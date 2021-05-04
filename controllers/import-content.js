'use strict';

/**
 * import-content.js controller
 *
 * @description: A set of functions called "actions" of the `import-content` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async ctx => {
    const entries = await strapi.query("import-config", "import-content").find();
    // console.log("entries", entries)
    const withCounts = entries.map(entry => ({
      ...entry,
      importedCount: entry.importedItems.length,
      importeditems: []
    }));
    const withName = withCounts.map(entry =>
      ({
        ...entry,
        contentType: strapi.contentTypes[entry.contentType].info.name ||
        entry.contentType
      }))
    ctx.send(withName);
  },

  preAnalyzeImportFile: async ctx => {
    const services = strapi.plugins["import-content"].services;
    try {
      const data = await services["import-content"].preAnalyzeImportFile(ctx);
      ctx.send(data);
    } catch (error) {
      console.log(error);
      ctx.response.status = 406;
      ctx.response.message = "could not parse: " + error;
    }
  },

  create: async ctx => {
    const services = strapi.plugins["import-content"].services;
    const importConfig = ctx.request.body;
    importConfig.ongoing = true;
    const record = await strapi
      .query("import-config", "import-content")
      .create(importConfig);
    // console.log("create", record);
    await services["import-content"].importItems(record, ctx);
    ctx.send(record);
  },

  delete: async ctx => {
    const importId = ctx.params.importId;
    const res = await strapi.query("import-config", "import-content").delete({
      id: importId
    });
    if (res && res.id) {
      ctx.send(res.id);
    } else {
      ctx.response.status = 400;
      ctx.response.message = "could not delete: the provided id might be wrong";
    }
  },

  undo: async ctx => {
    const services = strapi.plugins["import-content"].services;
    const importId = ctx.params.importId;
    const importConfig = await strapi
      .query("import-config", "import-content")
      .findOne({ id: importId });
    console.log("undo", importId);
    await services["import-content"].undoItems(importConfig);
    ctx.send(importConfig);
  },


};
