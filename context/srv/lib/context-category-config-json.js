const { CONTEXT_CATEGORIES, ATTRIBUTES } = require("./enums")

const contextCategoryConfig = [
  { contextCategory: CONTEXT_CATEGORIES.PLANT, attributes: [] },
  { contextCategory: CONTEXT_CATEGORIES.WORKCENTER, attributes: [] },
  { contextCategory: CONTEXT_CATEGORIES.MATERIAL, attributes: [] },
  { contextCategory: CONTEXT_CATEGORIES.SALES_ITEM, attributes: [ATTRIBUTES.SALES_DOC_TYPE] },
  { contextCategory: CONTEXT_CATEGORIES.ML_MODEL, attributes: [] },
]

module.exports = { contextCategoryConfig }
