const cds = require("@sap/cds")
const cfenv = require("cfenv")
const xsenv = require("@sap/xsenv")
const axios = require("axios")
const fetch = require("node-fetch")
const jose = require("node-jose")
const { composeTenantAutomator } = require("./tenant-automator")
const { composeEnvironment } = require("./mt-env")

xsenv.loadEnv()
const cisCentralServices = xsenv.getServices({ cisCentral: { label: "cis" } })
if (!cisCentralServices.cisCentral) throw new Error("CIS Central Binding not found from xsenv.services")
const credStoreServices = xsenv.getServices({ credStore: { tag: "credstore" } })
if (!credStoreServices.credStore) throw new Error("Credential Store Binding not found from xsenv.services")

const appEnv = cfenv.getAppEnv()

let initValues = null

module.exports = {
  tenantDeployment: (service) => {
    service.on("subscribe", async (req, next) => {
      await next()

      if(!initValues) throw new Error('Deployment has not been initialized')

      if (req.data.metadata) {
        const tenantSubdomain = req.data.metadata.subscribedSubdomain
        const tenantSubaccountID = req.data.metadata.subscribedSubaccountId

        const env = composeEnvironment(
          cds,
          axios,
          fetch,
          jose,
          tenantSubdomain,
          tenantSubaccountID,
          initValues.credentialStoreNamespace,
          process.env.tenantSeparator,
          process.env.saasAppName,
          process.env.cfAppName,
          appEnv.app.cf_api,
          process.env.brokerName,
          process.env.brokerUrl,
          appEnv.app.space_name,
          appEnv.app.space_id,
          appEnv.app.organization_id,
          appEnv.app.application_uris[0],
          cisCentralServices.cisCentral,
          credStoreServices.credStore
        )

        env.logDebug("====> Subscribe data:", JSON.stringify(req.data))

        const tenantAutomator = await composeTenantAutomator(env)
        await tenantAutomator.deployTenantArtifacts()
      }
    })

    service.on("unsubscribe", async (req, next) => {
      await next()

      if(!initValues) throw new Error('Deployment has not been initialized')

      if (req.data.options) {
        const tenantSubdomain = req.data.options.subscribedSubdomain
        const tenantSubaccountID = req.data.options.subscribedSubaccountId

        const env = composeEnvironment(
          cds,
          axios,
          fetch,
          jose,
          tenantSubdomain,
          tenantSubaccountID,
          initValues.credentialStoreNamespace,
          process.env.tenantSeparator,
          process.env.saasAppName,
          process.env.cfAppName,
          appEnv.app.cf_api,
          process.env.brokerName,
          process.env.brokerUrl,
          appEnv.app.space_name,
          appEnv.app.space_id,
          appEnv.app.organization_id,
          appEnv.app.application_uris[0],
          cisCentralServices.cisCentral,
          credStoreServices.credStore
        )

        env.logDebug("====> Unsubscribe data:", JSON.stringify(req.data))

        const tenantAutomator = await composeTenantAutomator(env)
        await tenantAutomator.undeployTenantArtifacts()
      }
    })

    // service.on("upgrade", async (req, next) => {
    //   await next()
      
    // })
  },

  /**
   *
   * @param {{credentialStoreNamespace:string}} values
   */
  initialize: (values) => {
    initValues = values
  },
}
