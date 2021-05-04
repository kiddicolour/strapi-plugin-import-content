'use strict';

/**
 * import-content.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const { resolveDataFromRequest, getItemsFromData } = require("./utils/utils");
const analyzer = require("./utils/analyzer");
const _ = require("lodash");
const importFields = require("./utils/importFields");
const importMediaFiles = require("./utils/importMediaFiles");

const import_queue = {};

// we expect a list of records, the first one being the original one
// we have to return a list of localizations, not including the current record
const buildLocalizationsArray = (records, current) => {

  // only valid if multiple records are in
  if (!(records.length > 1)) {
    return
  }

  return records
  .filter(record => record.id !== current.id)
  .map(record => ({
    id: record.id,
    locale: record.locale,
    published_at: record.published_at
  }))
}

const importNextItem = async importConfig => {
  const sourceItem = import_queue[importConfig.id].shift();
  if (!sourceItem) {
    console.log("import complete");
    await strapi
      .query("import-config", "import-content")
      .update({ id: importConfig.id }, { ongoing: false });
    return;
  }

  /**
   * When importing localized fields having multiple languages per row,
   * we need to do multiple creations for a single record (one for each language)
   * passing the id of the first created record to the localized ones
   * 
   * Strapi needs the id of the initial record to add translations 
   * as the creation procedure accepts only a single language at a time
   * Therefor the importFields function will return a sorted array
   * if multiple translations of the same record need to be created.
   * Once the first record is created, we need to provide the id for the localized versions
   */
  try {
    const importedItems = await importFields(
      sourceItem,
      importConfig.fieldMapping,
      importConfig.options
    );

    console.log('importedItems ########## ', importedItems)
    const savedContents = [];
    let id;

    for (const importedItem of importedItems) {

      if (id && importedItem.id === null) {
        importedItem.id = id
      }

      console.log("Importing item ", importedItem.id)

      const savedContent = await strapi
        .query(importConfig.contentType)
        .create(importedItem);

        // only store id of first record, dumb-ass
        if (!id) {
          id = savedContent.id
        }

      const uploadedFiles = await importMediaFiles(
        savedContent,
        sourceItem,
        importConfig
      );
      const fileIds = _.map(_.flatten(uploadedFiles), "id");
      await strapi.query("imported-item", "import-content").create({
        importconfig: importConfig.id,
        ContentId: savedContent.id,
        ContentType: importConfig.contentType,
        importedFiles: { fileIds }
      });      

      savedContents.push(savedContent)

    }


    // now to link all translations with the original and back
    // n languages => (n-1)squared links needed :mindblown:
    // so we need to run a new query for each language, hooray
    for (const content of savedContents) {
      const localizations = buildLocalizationsArray(savedContents, content)
      if (localizations) {
        const result = await strapi.query(importConfig.contentType)
        .update({id: content.id}, {localizations: localizations});
        // console.log('UpdatedLocalization ', localizations, 'result', result)
      }
    }

  } catch (e) {
    console.log(e);
  }
  const { IMPORT_THROTTLE } = strapi.plugins["import-content"].config;
  setTimeout(() => importNextItem(importConfig), IMPORT_THROTTLE);
};

const undo_queue = {};
const removeImportedFiles = async (fileIds, uploadConfig) => {
  const removePromises = fileIds.map(id =>
    strapi.plugins["upload"].services.upload.remove({ id }, uploadConfig)
  );
  return await Promise.all(removePromises);
};

const undoNextItem = async (importConfig, uploadConfig) => {
  const item = undo_queue[importConfig.id].shift();
  if (!item) {
    console.log("undo complete");
    await strapi
      .query("import-config", "import-content")
      .update({ id: importConfig.id }, { ongoing: false });
    return;
  }
  try {
    await strapi.query(importConfig.contentType).delete({ id: item.ContentId });
  } catch (e) {
    console.log(e);
  }
  try {
    const importedFileIds = _.compact(item.importedFiles.fileIds);
    await removeImportedFiles(importedFileIds, uploadConfig);
  } catch (e) {
    console.log(e);
  }
  try {
    await strapi.query("imported-item", "import-content").delete({
      id: item.id
    });
  } catch (e) {
    console.log(e);
  }
  const { UNDO_THROTTLE } = strapi.plugins["import-content"].config;
  setTimeout(() => undoNextItem(importConfig, uploadConfig), UNDO_THROTTLE);
};

module.exports = {
  preAnalyzeImportFile: async ctx => {
    const { dataType, body, options } = await resolveDataFromRequest(ctx);
    const { sourceType, items } = await getItemsFromData({
      dataType,
      body,
      options
    });
    const analysis = analyzer.analyze(sourceType, items);
    return { sourceType, ...analysis };
  },
  importItems: (importConfig, ctx) =>
    new Promise(async (resolve, reject) => {
      const { dataType, body } = await resolveDataFromRequest(ctx);
      // console.log("importitems", importConfig);
      try {
        const { items } = await getItemsFromData({
          dataType,
          body,
          options: importConfig.options
        });
        import_queue[importConfig.id] = items;
      } catch (error) {
        reject(error);
      }
      resolve({
        status: "import started",
        importConfigId: importConfig.id
      });
      importNextItem(importConfig);
    })
  ,
  undoItems: importConfig =>
    new Promise(async (resolve, reject) => {
      try {
        undo_queue[importConfig.id] = importConfig.importeditems;
      } catch (error) {
        reject(error);
      }
      await strapi
        .query("import-config", "import-content")
        .update({ id: importConfig.id }, { ongoing: true });
      resolve({
        status: "undo started",
        importConfigId: importConfig.id
      });
      const uploadConfig = await strapi
        .store({
          environment: strapi.config.environment,
          type: "plugin",
          name: "upload"
        })
        .get({ key: "provider" });
      undoNextItem(importConfig, uploadConfig);
    })
};
