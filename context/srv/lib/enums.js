const CONTEXT_TYPES = {
  S4_WORKCENTER: "s4-workcenter",
  S4_PLANT: "s4-plant",
  S4_MATERIAL: "s4-material",
  S4_SALES_DOC_ITEM: "s4-sales-doc-item",
  IQC_ML_MODEL: "iqc-ml-model",
}

const CONTEXT_CATEGORIES = {
  WORKCENTER: "workcenter",
  PLANT: "plant",
  MATERIAL: "material",
  SALES_ITEM: "sales-item",
  ML_MODEL: "ml-model",
}

const SEGMENT_TYPES = { LITERAL: "literal", KEY: "key", ATTRIBUTE: "attribute" }

const KEYS = {
  MATERIAL: "material",
  WORKCENTER: "workcenter",
  PLANT: "plant",
  SALES_DOC: "sales-doc",
  SALES_DOC_ITEM: "sales-doc-item",
  MODEL_NAME: "model-name",
}

const ATTRIBUTES = { SALES_DOC_TYPE: "sales-doc-type" }

module.exports = { CONTEXT_TYPES, CONTEXT_CATEGORIES, SEGMENT_TYPES, KEYS, ATTRIBUTES }
