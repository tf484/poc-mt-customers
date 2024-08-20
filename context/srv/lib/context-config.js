
const path = require("path")
const { composeText } = require("./text")
const { contextTypeConfig } = require("./context-type-config-json")
const { contextCategoryConfig } = require("./context-category-config-json")


/**
 * @param {{contextTypeConfig:object[]}} state
 */
const canCheckContextTypeConfigExists = (state) => {
  return {
    /**
     * check to ensure configuration exists for an context type
     * @param {string} contextType
     */
    checkContextTypeConfigExists: (contextType) => {
      const contextTypeConfig = state.contextTypeConfig.find((item) => item.contextType === contextType)
      return contextTypeConfig !== undefined ? true : false
    },
  }
}

/**
 * @param {{contextCategoryConfig:object[]}} state
 */
const canCheckContextCategoryConfigExists = (state) => {
  return {
    /**
     * check to ensure configuration exists for an context category
     * @param {string} contextCategory
     */
    checkContextCategoryConfigExists: (contextCategory) => {
      const contextCategoryConfig = state.contextCategoryConfig.find((item) => item.contextCategory === contextCategory)
      return contextCategoryConfig !== undefined ? true : false
    },
  }
}
/**
 * @param {{text:object,contextTypeConfig:object}} state
 * @param {{checkContextTypeConfigExists:function}} checkContextTypeConfigExists
 */
const canGetContextCategory = (state, { checkContextTypeConfigExists }) => {
  return {
    getContextCategory: (contextType) => {
      if (!checkContextTypeConfigExists(contextType)) {
        throw new Error(state.text.getText("contextConfigNotFoundForContextType", [contextType]))
      }
      const contextTypeConfig = state.contextTypeConfig.find((item) => item.contextType === contextType)
      return contextTypeConfig.contextCategory
    },
  }
}

/**
 * @param {{text:object,contextTypeConfig:object}} state
 * @param {{checkContextTypeConfigExists:function}} checkContextTypeConfigExists
 */
const canGetKeys = (state, { checkContextTypeConfigExists }) => {
  return {
    getKeys: (contextType) => {
      if (!checkContextTypeConfigExists(contextType)) {
        throw new Error(state.text.getText("contextConfigNotFoundForContextType", [contextType]))
      }
      const contextTypeConfig = state.contextTypeConfig.find((item) => item.contextType === contextType)
      return contextTypeConfig.keys !== undefined ? contextTypeConfig.keys : []
    },
  }
}

/**
 * @param {{text:object, contextCategoryConfig:object}} state
 * @param {{getContextCategory:function}} getContextCategory
 * @param {{checkContextCategoryConfigExists:function}} checkContextCategoryConfigExists
 */
const canGetAttributes = (state, { getContextCategory }, { checkContextCategoryConfigExists }) => {
  return {
    getAttributes: (contextType) => {
      const contextCategory = getContextCategory(contextType)

      if (!checkContextCategoryConfigExists(contextCategory)) {
        throw new Error(state.text.getText("contextConfigNotFoundForContextCategory", [contextCategory]))
      }

      const contextCategoryConfig = state.contextCategoryConfig.find((item) => item.contextCategory === contextCategory)
      return contextCategoryConfig.attributes !== undefined ? contextCategoryConfig.attributes : []
    },
  }
}

/**
 * @param {{text:object,contextTypeConfig:object}} state
 * @param {{checkContextTypeConfigExists:function}} checkContextTypeConfigExists
 */
const canGetCompositeKeySegments = (state, { checkContextTypeConfigExists }) => {
  return {
    getCompositeKeySegments: (contextType) => {
      if (!checkContextTypeConfigExists(contextType)) {
        throw new Error(state.text.getText("contextConfigNotFoundForContextType", [contextType]))
      }
      const contextTypeConfig = state.contextTypeConfig.find((item) => item.contextType === contextType)
      return contextTypeConfig.compositeKeySegments !== undefined ? contextTypeConfig.compositeKeySegments : []
    },
  }
}

/**
 * @param {{text:object,contextTypeConfig:object}} state
 * @param {{checkContextTypeConfigExists:function}} checkContextTypeConfigExists
 */
const canGetExternalNameSegments = (state, { checkContextTypeConfigExists }) => {
  return {
    getExternalNameSegments: (contextType) => {
      if (!checkContextTypeConfigExists(contextType)) {
        throw new Error(state.text.getText("contextConfigNotFoundForContextType", [contextType]))
      }
      const contextTypeConfig = state.contextTypeConfig.find((item) => item.contextType === contextType)
      return contextTypeConfig.externalNameSegments !== undefined ? contextTypeConfig.externalNameSegments : []
    },
  }
}

// ====================== Compose Functions =============================

/**
 * Create a Context Config object
 * @param {string} [locale]
 */
const composeContextConfig = (locale) => {
  let text = null
  if (locale !== undefined && locale !== null) {
    text = composeText(path.join(__dirname, `..`, `..`, `_i18n`, `i18n`), locale)
  } else {
    text = composeText(path.join(__dirname, `..`, `..`, `_i18n`, `i18n`))
  }

  const state = { text, contextTypeConfig, contextCategoryConfig }

  return {
    ...canGetContextCategory(state, canCheckContextTypeConfigExists(state)),
    ...canGetKeys(state, canCheckContextTypeConfigExists(state)),
    ...canGetAttributes(state, canGetContextCategory(state, canCheckContextTypeConfigExists(state)), canCheckContextCategoryConfigExists(state)),
    ...canGetCompositeKeySegments(state, canCheckContextTypeConfigExists(state)),
    ...canGetExternalNameSegments(state, canCheckContextTypeConfigExists(state)),
  }
}

module.exports = {
  composeContextConfig,
  canGetContextCategory,
  canGetKeys,
  canGetAttributes,
  canGetCompositeKeySegments,
  canGetExternalNameSegments,
  canCheckContextTypeConfigExists,
  canCheckContextCategoryConfigExists,
}
