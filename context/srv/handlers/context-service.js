const cds = require("@sap/cds")

const { parseKeyString, composeContextTools, composeEnvironment, composeContextConfig } = require("../lib")

module.exports = cds.service.impl(async (srv) => {
  const { ContextTypes, ContextCategories } = srv.entities

  srv.on("findContext", async (req) => {
    const { locale } = req
    const { contextType, keyString } = req.data

    const keys = parseKeyString(keyString)

    try {
      const env = composeEnvironment(cds, srv, locale)
      const contextTools = composeContextTools(env)

      const contextID = await contextTools.findContext(contextType, keys)

      return contextID
    } catch (error) {
      return req.error(500, error)
    }
  })

  srv.on("createContext", async (req) => {
    const { locale } = req
    const { contextType, descriptions, keys, attributes } = req.data

    try {
      const env = composeEnvironment(cds, srv, locale)
      const contextTools = composeContextTools(env)

      const context = await contextTools.createContext(contextType, descriptions, keys, attributes)

      return context
    } catch (error) {
      return req.error(500, error)
    }
  })

  srv.on("toggleStatus", async (req) => {
    const { locale } = req
    const { contextID } = req.data

    try {
      const env = composeEnvironment(cds, srv, locale)
      const contextTools = composeContextTools(env)

      const status = await contextTools.toggleStatus(contextID)

      return status
    } catch (error) {
      return req.error(500, error)
    }
  })

  srv.on("updateContext", async (req) => {
    const { locale } = req
    const { contextID, descriptions, keys, attributes } = req.data

    try {
      const env = composeEnvironment(cds, srv, locale)
      const contextTools = composeContextTools(env)

      const context = await contextTools.updateContext(contextID, descriptions, attributes)

      return context
    } catch (error) {
      return req.error(500, error)
    }
  })

  srv.on("getContextTypeDetails", async (req) => {
    const { locale } = req
    const { contextType } = req.data

    try {
      const contextConfig = composeContextConfig(locale)
      const keys = contextConfig.getKeys(contextType)
      const attributes = contextConfig.getAttributes(contextType)

      return { keys, attributes }
    } catch (error) {
      return req.error(500, error)
    }
  })

})
