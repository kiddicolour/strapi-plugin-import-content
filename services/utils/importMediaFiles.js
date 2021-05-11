const _ = require("lodash");
const request = require("request");

const fileFromBuffer = require("./fileFromBuffer");
const { getMediaUrlsFromFieldData } = require("../utils/fieldUtils");

const fetchFiles = url =>
  new Promise((resolve, reject) => {
    console.log('request file url', url)
    request({ url, method: "GET", encoding: null }, (err, res, body) => {
      if (err) {
        console.error(`rejected fetchFile with error: ${err}`)
        reject(err);
      }
      const parsed = new URL(url);
      const extension = parsed.pathname
        .split(".")
        .pop()
        .toLowerCase();
      // console.log('request response body', body, 'err', err, 'extensions', extension)
      const mimeType = res.headers["content-type"].split(";").shift();

      resolve(fileFromBuffer(mimeType, extension, body));
    });
  });

const storeFiles = async file => {
  const { buffer, related, ...rest } = file
  // console.log('Buffer', file.buffer)
  // let streamBuffer = file.buffer.createReadStream(someBuffer);
  // const files = {
  //   path: path.join(strapi.config.appPath, strapi.config.paths.static, 'upload', file.name),
  //   // path: bufferToStream(file.buffer),
  //   // path: `./public/uploads/${file.name}`,
  //   ...rest
  // }
  // console.log('file before upload call', rest, 'related', related)

  // await strapi.plugins.upload.provider.upload(file)
  // console.log('file after provider upload', file)
  // file.path = path.join(strapi.config.appPath, strapi.config.paths.static, file.url)

  return strapi.plugins["upload"].services["upload"].upload(
    // { data: { ...related }, files },
    { data: { fileInfo: { ...rest }, ...related }, files: file },
    // file.buffer,
    {}
  );
};
const relateFileToContent = ({
  contentType,
  contentId,
  targetField,
  fileBuffer
}) => {
  // console.log('Added related info to fileBuffer', fileBuffer.related)
  fileBuffer.related = {
    refId: contentId,
    ref: contentType,
    source: "content-manager",
    field: targetField
  };
  return fileBuffer;
};

const importMediaFiles = async (savedContent, sourceItem, importConfig) => {
  const { fieldMapping, contentType } = importConfig;
  const uploadedFileDescriptors = _.mapValues(
    fieldMapping,
    async (mapping, sourceField) => {
      if (mapping.importMediaToField) {
        const urls = getMediaUrlsFromFieldData(sourceItem[sourceField]);
        const fetchPromises = _.uniq(urls).map(fetchFiles);
        const fileBuffers = await Promise.all(fetchPromises);
        // console.log('fileBuffers', fileBuffers)
        const relatedContents = fileBuffers.map(fileBuffer =>
          relateFileToContent({
            contentType,
            contentId: savedContent.id,
            targetField: mapping.importMediaToField,
            fileBuffer
          })
        );
        console.log('relatedContents', relatedContents)
        const storePromises = relatedContents.map(storeFiles);
        const storedFiles = await Promise.all(storePromises);
        console.log('storedFiles', storedFiles);
        console.log(_.flatten(storedFiles));
        return storedFiles;
      }
    }
  );
  return await Promise.all(_.values(uploadedFileDescriptors));
};
module.exports = importMediaFiles;
