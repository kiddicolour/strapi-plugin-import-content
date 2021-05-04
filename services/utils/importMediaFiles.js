const _ = require("lodash");
const request = require("request");
const fileFromBuffer = require("./fileFromBuffer");
const { getMediaUrlsFromFieldData } = require("../utils/fieldUtils");

const fetchFiles = url =>
  new Promise((resolve, reject) => {
    request({ url, method: "GET", encoding: null }, async (err, res, body) => {
      if (err) {
        console.error(err)
        reject(err);
      }
      const mimeType = res.headers["content-type"].split(";").shift();
      const parsed = new URL(url);
      const extension = parsed.pathname
        .split(".")
        .pop()
        .toLowerCase();
      resolve(fileFromBuffer(mimeType, extension, body));
    });
  });

const storeFiles = async file => {
  const uploadProviderConfig = await strapi
    .store({
      environment: strapi.config.environment,
      type: "plugin",
      name: "upload-local"
    })
    .get({ key: "provider" }) || {};

    const config = await strapi.plugins.upload.config
    // console.log(config)
    // console.log('uploqdProviderCOnfig', uploadProviderConfig)
  return await strapi.plugins["upload"].provider.upload(
    [file],
    uploadProviderConfig
    // config
  );
};

const relateFileToContent = ({
  contentType,
  contentId,
  targetField,
  fileBuffer
}) => {
  fileBuffer.related = [
    {
      refId: contentId,
      ref: contentType,
      source: "content-manager",
      field: targetField
    }
  ];
  return fileBuffer;
};

const importMediaFiles = async (savedContent, sourceItem, importConfig) => {

  const { fieldMapping, contentType } = importConfig;
  //console.log('importMediaFiles fieldMapping', fieldMapping, 'contentType', contentType)
  const uploadedFileDescriptors = _.mapValues(
    fieldMapping,
    async (mapping, sourceField) => {
      //console.log('mapping of sourcefield', mapping, sourceField)
      if (mapping.options && mapping.options.importMediaToField) {
        const urls = getMediaUrlsFromFieldData(sourceItem[sourceField]);
        // console.log(urls)
        const fetchPromises = _.uniq(urls).map(fetchFiles);
        const fileBuffers = await Promise.all(fetchPromises);
        const relatedContents = fileBuffers.map(fileBuffer =>
          relateFileToContent({
            contentType,
            contentId: savedContent.id,
            targetField: mapping.importMediaToField,
            fileBuffer
          })
        );
        const storePromises = relatedContents.map(storeFiles);
        const storedFiles = await Promise.all(storePromises);
        console.log(_.flatten(storedFiles));
        return storedFiles;
      }
    }
  );
  return await Promise.all(_.values(uploadedFileDescriptors));
};

module.exports = importMediaFiles;
