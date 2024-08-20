const { CONTEXT_TYPES, CONTEXT_CATEGORIES, KEYS, SEGMENT_TYPES } = require("./enums")

const contextTypeConfig = [
  {
    contextType: CONTEXT_TYPES.S4_PLANT,
    contextCategory: CONTEXT_CATEGORIES.PLANT,
    keys: [KEYS.PLANT],
    compositeKeySegments: [
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "s4-plant" },
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "-" },
      { segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.PLANT },
    ],
    externalNameSegments: [{ segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.PLANT }],
  },
  {
    contextType: CONTEXT_TYPES.S4_WORKCENTER,
    contextCategory: CONTEXT_CATEGORIES.WORKCENTER,
    keys: [KEYS.PLANT, KEYS.WORKCENTER],
    compositeKeySegments: [
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "s4-workcenter" },
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "-" },
      { segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.PLANT },
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "-" },
      { segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.WORKCENTER },
    ],
    externalNameSegments: [
      { segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.PLANT },
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "-" },
      { segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.WORKCENTER },
    ],
  },

  {
    contextType: CONTEXT_TYPES.S4_MATERIAL,
    contextCategory: CONTEXT_CATEGORIES.MATERIAL,
    keys: [KEYS.MATERIAL],
    compositeKeySegments: [
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "s4-material" },
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "-" },
      { segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.MATERIAL },
    ],
    externalNameSegments: [{ segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.MATERIAL }],
  },

  {
    contextType: CONTEXT_TYPES.S4_SALES_DOC_ITEM,
    contextCategory: CONTEXT_CATEGORIES.SALES_ITEM,
    keys: [KEYS.SALES_DOC, KEYS.SALES_DOC_ITEM],
    compositeKeySegments: [
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "s4-sales-doc-item" },
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "-" },
      { segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.SALES_DOC },
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "-" },
      { segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.SALES_DOC_ITEM },
    ],
    externalNameSegments: [
      { segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.SALES_DOC },
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "-" },
      { segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.SALES_DOC_ITEM },
    ],
  },

  {
    contextType: CONTEXT_TYPES.IQC_ML_MODEL,
    contextCategory: CONTEXT_CATEGORIES.ML_MODEL,
    keys: [KEYS.MODEL_NAME],
    compositeKeySegments: [
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "iqc-ml-model" },
      { segmentType: SEGMENT_TYPES.LITERAL, segmentValue: "-" },
      { segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.MODEL_NAME },
    ],
    externalNameSegments: [{ segmentType: SEGMENT_TYPES.KEY, segmentValue: KEYS.MODEL_NAME }],
  },
]

module.exports = { contextTypeConfig }
