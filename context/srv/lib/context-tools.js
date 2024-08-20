const { SEGMENT_TYPES } = require("./enums")

const path = require("path")
const { composeText } = require("./text")

const { composeContextConfig } = require("./context-config")

/**
 * @typedef {string} UUID
 */

// ======================= Utility Functions ==============================

/**
 * @param {string} keyString - a comma separated list of key name/value pairs,each separated by a colon (ex. 'key1:value1,key2:value2')
 * @returns {{keyName:string,keyValue:string}[]} parsed keys
 */
function parseKeyString(keyString) {
  const keyList = keyString.split(",")

  const keys = keyList.map((item) => {
    const pair = item.split(":")
    return { keyName: pair[0], keyValue: pair[1] }
  })

  return keys
}

// ======================= Composition Functions ==============================

/**
 * @param {{cds:object}} env runtime environment
 * @param {{contextsEntity:object,text:object}} state composition state
 * @param {{validateKeys:function}} validateKeys function for validating that correct keys have been sent
 * @param {{buildCompositeKey:function}} buildCompositeKey function to build a composite key based on configuration of context type
 */
const canFindContext = (env, state, { validateKeys }, { buildCompositeKey }) => {
  return {
    /**
     * @async
     * @param {string} contextType
     * @param {{keyName:string,keyValue:string}[]} keys
     * @returns {Promise<UUID>} context ID that was found
     */
    findContext: async (contextType, keys) => {
      if (!validateKeys(contextType, keys)) {
        throw new Error(state.text.getText("keysNotValidForContextType", [contextType]))
      }

      const compositeKey = buildCompositeKey(contextType, keys)

      const contexts = await env.cds.ql.SELECT.from(state.contextsEntity).columns(`ID`).where(`compositeKey`, `=`, `${compositeKey}`)

      if (contexts.length < 1) {
        throw new Error(state.text.getText("noContextFoundForCompositeKey", [compositeKey, contextType]))
      }
      return contexts[0].ID
    },
  }
}

/**
 * @param {{contextConfig:object}} state composition state
 */
const canValidateAttributes = (state) => {
  return {
    /**
     * @param {string} contextType
     * @param {{attributeName,attributeValue}[]} attributes
     * @returns {boolean} true if all attributes accounted for
     */
    validateAttributes: (contextType, attributes) => {
      const validAttributes = state.contextConfig.getAttributes(contextType)

      const attributesFound = validAttributes.map((validAttribute) => {
        const foundAttribute = attributes.find((attribute) => attribute.attributeName === validAttribute)
        return foundAttribute === undefined ? false : true
      })

      return !attributesFound.includes(false)
    },
  }
}

/**
 * @param {{contextConfig:object}} state composition state
 */
const canValidateKeys = (state) => {
  return {
    /**
     * @param {string} contextType
     * @param {{keyName,keyValue}[]} keys
     * @returns {boolean} true if all keys accounted for
     */
    validateKeys: (contextType, keys) => {
      const validKeys = state.contextConfig.getKeys(contextType)

      const keysFound = validKeys.map((validKey) => {
        const foundKey = keys.find((key) => key.keyName === validKey)
        return foundKey === undefined ? false : true
      })

      return !keysFound.includes(false)
    },
  }
}

/**
 * @param {{contextConfig:object}} state composition state
 */
const canFilterAttributes = (state) => {
  return {
    /**
     * @param {string} contextType
     * @param {{attributeName,attributeValue}[]} attributes
     * @returns {{attributeName,attributeValue}[]} attributes filtered to only include valid attributes in context type configuration
     */
    filterAttributes: (contextType, attributes) => {
      const validAttributes = state.contextConfig.getAttributes(contextType)

      const filteredAttributes = attributes.filter((attribute) => validAttributes.includes(attribute.attributeName))

      return filteredAttributes
    },
  }
}

/**
 * @param {{contextConfig:object}} state composition state
 */
const canFilterKeys = (state) => {
  return {
    /**
     * @param {string} contextType
     * @param {{keyName,keyValue}[]} keys
     * @returns {{keyName,keyValue}[]} keys filtered to only include valid keys in context type configuration
     */
    filterKeys: (contextType, keys) => {
      const validKeys = state.contextConfig.getKeys(contextType)

      const filteredKeys = keys.filter((key) => validKeys.includes(key.keyName))

      return filteredKeys
    },
  }
}

/**
 * @param {{contextConfig:object,text:object}} state composition state
 */
const canBuildCompositeKey = (state) => {
  return {
    /**
     *
     * @param {string} contextType
     * @param {{keyName,keyValue}[]} keys
     * @returns {string} composite key string
     */
    buildCompositeKey: (contextType, keys) => {
      const keySegments = state.contextConfig.getCompositeKeySegments(contextType)

      const compositeKeySegments = keySegments.map((segment) => {
        if (segment.segmentType === SEGMENT_TYPES.LITERAL) {
          return segment.segmentValue
        } else if (segment.segmentType === SEGMENT_TYPES.KEY) {
          let segmentValue = ""
          const key = keys.find((item) => item.keyName === segment.segmentValue)
          if (key !== undefined) {
            segmentValue = key.keyValue
          }
          return segmentValue
        } else if (segment.segmentType === SEGMENT_TYPES.ATTRIBUTE) {
          throw new Error(state.text.getText("compositeKeyCanNotBeCreatedByAttributeValues", [contextType]))
        }
      })

      const compositeKey = compositeKeySegments.join("")

      return compositeKey
    },
  }
}

/**
 * @param {{contextConfig:object,text:object}} state composition state
 */
const canBuildExternalName = (state) => {
  return {
    /**
     *
     * @param {string} contextType
     * @param {{keyName,keyValue}[]} keys
     * @param {{attributeName,attributeValue}[]} attributes
     * @returns {string} composite key string
     */
    buildExternalName: (contextType, keys, attributes) => {
      const nameSegments = state.contextConfig.getExternalNameSegments(contextType)

      const externalNameSegments = nameSegments.map((segment) => {
        if (segment.segmentType === SEGMENT_TYPES.LITERAL) {
          return segment.segmentValue
        } else if (segment.segmentType === SEGMENT_TYPES.KEY) {
          let segmentValue = ""
          const key = keys.find((item) => item.keyName === segment.segmentValue)
          if (key !== undefined) {
            segmentValue = key.keyValue
          }
          return segmentValue
        } else if (segment.segmentType === SEGMENT_TYPES.ATTRIBUTE) {
          let segmentValue = ""
          const attribute = attributes.find((item) => item.attributeName === segment.segmentValue)
          if (attribute !== undefined) {
            segmentValue = attribute.attributeValue
          }
          return segmentValue
        }
      })

      const externalName = externalNameSegments.join("")

      return externalName
    },
  }
}

/**
 * @param {{cds:object}} env runtime environment
 * @param {{contextConfig:object,contextsEntity:object,text:object}} state composition state
 * @param {{validateKeys:function}} validateKeys function for validating that correct keys have been sent
 * @param {{validateAttributes:function}} validateAttributes function for validating that correct attributes have been sent
 * @param {{filterKeys:function}} filterKeys function to filter keys to only configured items
 * @param {{filterAttributes:function}} filterAttributes function to filter attributes to only configured items
 * @param {{buildCompositeKey:function}} buildCompositeKey function to build a composite key based on configuration of context type
 * @param {{buildExternalName:function}} buildExternalName function to build a external name based on configuration of context type
 * @param {{findContext:function}} findContext function to find currently existing contexts to ensure duplicate contexts are created
 */
const canCreateContext = (
  env,
  state,
  { validateKeys },
  { validateAttributes },
  { filterKeys },
  { filterAttributes },
  { buildCompositeKey },
  { buildExternalName },
  { findContext }
) => {
  return {
    createContext: async (contextType, descriptions, keys, attributes) => {
      if (!validateKeys(contextType, keys)) {
        throw new Error(state.text.getText("keysNotValidForContextType", [contextType]))
      }

      if (!validateAttributes(contextType, attributes)) {
        throw new Error(state.text.getText("attributesNotValidForContextType", [contextType]))
      }

      const contextCategory = state.contextConfig.getContextCategory(contextType)

      const filteredKeys = filterKeys(contextType, keys)
      const filteredAttributes = filterAttributes(contextType, attributes)

      const compositeKey = buildCompositeKey(contextType, keys)
      const externalName = buildExternalName(contextType, keys, attributes)

      //check to make sure context does not already exist before creating new one for same keys
      let existsID
      try {
        existsID = await findContext(contextType, keys)
      } catch {
        //continue if error thrown
      }
      if (existsID) {
        throw new Error(state.text.getText("cannotCreateContextAsAlreadyExists", [compositeKey, contextType, existsID]))
      }

      const description = Array.isArray(descriptions) && descriptions.length > 0 ? descriptions[0].description : ""

      const context = {
        contextType_code: contextType,
        contextCategory_code: contextCategory,
        compositeKey,
        externalName,
        description,
        texts: descriptions,
        keys: filteredKeys,
        attributes: filteredAttributes,
      }
      const insertResult = await env.cds.ql.INSERT.into(state.contextsEntity, [context])

      return { contextID: [...insertResult][0].ID, compositeKey }
    },
  }
}

/**
 * @param {{cds:object}} env runtime environment
 * @param {{contextsEntity:object,text:object}} state composition state
 */
const canToggleStatus = (env, state) => {
  return {
    toggleStatus: async (contextID) => {
      const context = await env.cds.ql.SELECT.one.from(state.contextsEntity).columns("inactive").where({ ID: contextID })
      const newStatus = !context.inactive

      await env.cds.ql.UPDATE(state.contextsEntity, contextID).with({ inactive: newStatus })

      return { inactive: newStatus }
    },
  }
}

/**
 * @param {{cds:object}} env runtime environment
 * @param {{contextConfig:object,contextsEntity:object,textsEntity:object,attributesEntity:object,text:object}} state composition state
 * @param {{validateAttributes:function}} validateAttributes function for validating that correct attributes have been sent
 * @param {{filterAttributes:function}} filterAttributes function to filter attributes to only configured items
 */
const canUpdateContext = (env, state, { validateAttributes }, { filterAttributes }) => {
  return {
    updateContext: async (contextID, descriptions, attributes) => {
      const context = await env.cds.ql.SELECT.one.from(state.contextsEntity).columns("contextType_code").where({ ID: contextID })
      if (!context) throw new Error(state.text.getText("noContextFoundForID", [contextID]))

      const contextType = context.contextType_code

      if (!validateAttributes(contextType, attributes)) {
        throw new Error(state.text.getText("attributesNotValidForContextType", [contextType]))
      }

      const filteredAttributes = filterAttributes(contextType, attributes)

      const description = Array.isArray(descriptions) && descriptions.length > 0 ? descriptions[0].description : ""

      await env.cds.ql.UPDATE(state.contextsEntity, contextID).with({ description: description })

      const newDescriptions = descriptions.map((item) => {
        return { ID: contextID, locale: item.locale, description: item.description }
      })

      await env.cds.ql.DELETE(state.textsEntity).where({ ID: contextID })
      await env.cds.ql.INSERT.into(state.textsEntity).entries(newDescriptions)

      const newAttributes = attributes.map((item) => {
        return { up__ID: contextID, attributeName: item.attributeName, attributeValue: item.attributeValue }
      })

      await env.cds.ql.DELETE(state.attributesEntity).where({ up__ID: contextID })
      if (Array.isArray(newAttributes && newAttributes.length > 0)) {
        await env.cds.ql.INSERT.into(state.attributesEntity).entries(newAttributes)
      }
    },
  }
}

/**
 * Compose an Context Tools object for creating and finding abstract contexts for external linking
 * @param {{cds:object,service:object,locale:string}} env runtime environment
 */
const composeContextTools = (env) => {
  const text = composeText(path.join(__dirname, `..`, `..`, `_i18n`, `i18n`), env.locale)

  const contextConfig = composeContextConfig()

  const { Contexts, "Contexts.texts": Texts, "Contexts.attributes": Attributes } = env.service.entities

  const state = {
    text,
    contextConfig,
    contextsEntity: Contexts,
    textsEntity: Texts,
    attributesEntity: Attributes,
  }

  return {
    ...canCreateContext(
      env,
      state,
      canValidateKeys(state),
      canValidateAttributes(state),
      canFilterKeys(state),
      canFilterAttributes(state),
      canBuildCompositeKey(state),
      canBuildExternalName(state),
      canFindContext(env, state, canValidateKeys(state), canBuildCompositeKey(state))
    ),
    ...canUpdateContext(env, state, canValidateAttributes(state), canFilterAttributes(state)),
    ...canFindContext(env, state, canValidateKeys(state), canBuildCompositeKey(state)),
    ...canToggleStatus(env, state),
  }
}

// ====================== Compose Functions =============================

module.exports = {
  parseKeyString,
  composeContextTools,
  canBuildCompositeKey,
  canBuildExternalName,
  canValidateAttributes,
  canValidateKeys,
  canFilterAttributes,
  canFilterKeys,
  canFindContext,
  canCreateContext,
}
