const crypto = require('crypto');
const path = require('path');
const uuid = require("uuid/v4");

function niceHash(buffer) {
  return crypto
    .createHash("sha256")
    .update(buffer)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\//g, "-")
    .replace(/\+/, "_");
}

const fileFromBuffer = (mimeType, extension, buffer) => {
  // console.log('fileFromBuffer mime', mimeType, 'extension', extension)
  const fid = uuid();
  return {
    buffer,
    // path: path.join(strapi.config.appPath, strapi.config.paths.static, 'uploads', `${fid}.${extension}`),
    sha256: niceHash(buffer),
    hash: fid.replace(/-/g, ""),
    name: `${fid}.${extension}`,
    ext: `.${extension}`,
    type: mimeType,
    size: (buffer.length / 1000).toFixed(2)
  };
};

module.exports = fileFromBuffer;
