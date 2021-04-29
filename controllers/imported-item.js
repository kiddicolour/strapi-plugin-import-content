module.exports = {
  count: async ctx => {
    const entries = await strapi.query("imported-item", "import-content").count(ctx.request.query)
    ctx.send(entries)
  },
  findOne: async ctx => {
    const entries = await strapi.query("imported-item", "import-content").findOne({id: ctx.params.importId})
    ctx.send(entries)
  },
  find: async ctx => {
    const entries = await strapi.query("imported-item", "import-content").find(ctx.request.query)
    ctx.send(entries)
  },
  delete: async ctx => {
    return strapi.query("imported-item", "import-content").delete({id: ctx.params.importId})
  },
  update: async ctx => {
    return strapi.query("imported-item", "import-content").update({id: ctx.params.importId}, ctx.request.body)
  }
};
