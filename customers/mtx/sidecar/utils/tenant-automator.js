const cfenv = require("cfenv")
const xsenv = require("@sap/xsenv")

const { composeServiceManager } = require("./service-manager")
const { composeCredentialStore } = require("./credential-store")
const { composeOAuthTokenUtility } = require("./oauth-token-utility")
const { composeCloudManagementCentral } = require("./cloud-management-central")
const { composeCloudFoundryCLI } = require("./cloud-foundry-cli")

/**
 * Deploy Tenant Artifacts
 * @param {{process:object}} env
 * @param {{subAccountID:string,subDomain:string}} state
 * @param {{createRoute:function}} createRoute
 * @param {{registerBTPServiceBroker:function}} registerBTPServiceBroker
 * @param {{cleanUpCreatedServices:function}} cleanupCreatedServices
 */
const canDeployTenantArtifacts = (env, state, { createRoute }, { registerBTPServiceBroker }, { cleanUpCreatedServices }) => {
  return {
    deployTenantArtifacts: async () => {
      try {
        await createRoute()
        await registerBTPServiceBroker()
        await cleanUpCreatedServices()
        console.log("Tenant Automation: Deployment has been completed successfully!")
      } catch (error) {
        console.log("Tenant Automation Error during deployment of Artifacts")
        throw error
      }
    },
  }
}

/**
 * Undeploy Tenant Artifacts
 * @param {{process:object}} env
 * @param {{subAccountID:string,subDomain:string}} state
 * @param {{deleteRoute:function}} deleteRoute
 * @param {{unregisterBTPServiceBroker}} unregisterBTPServiceBroker
 * @param {{cleanUpCreatedServices}} cleanUpCreatedServices
 */
const canUndeployTenantArtifacts = (env, state, { deleteRoute }, { unregisterBTPServiceBroker }, { cleanUpCreatedServices }) => {
  return {
    undeployTenantArtifacts: async () => {
      try {
        await deleteRoute()
        await unregisterBTPServiceBroker()
        await cleanUpCreatedServices()
        console.log("Automation: Undeployment has been completed successfully!")
      } catch (error) {
        console.error("Tenant artifacts cannot be undeployed!")
        throw error
      }
    },
  }
}

/**
 * Register BTP Service Broker
 * @param {object} env
 * @param {{cloudManagementCentral:object, subAccountID:string}} state
 */
const canCleanUpCreatedServices = (env, state) => {
  return {
    cleanUpCreatedServices: async () => {
      try {
        await state.cloudManagementCentral.deleteServiceManager(state.subAccountID)
        console.log("Service Manager is deleted")
      } catch (error) {
        console.error("Clean up can not be completed!")
        throw error
      }
    },
  }
}

/**
 * Register BTP Service Broker
 * @param {{process:object, appEnv:object}} env
 * @param {{serviceManager:object, credentials:Map}} state
 */
const canRegisterBTPServiceBroker = (env, state) => {
  return {
    registerBTPServiceBroker: async () => {
      try {
        let sbCreds = state.credentials.get(`broker-credentials`)
        let sbUrl = env.process.env.brokerUrl
        await state.serviceManager.createServiceBroker(
          `${env.process.env.brokerName}-${env.appEnv.app.space_name}`,
          sbUrl,
          "AICOMP API Broker",
          sbCreds.username,
          sbCreds.value
        )
        console.log(`Inbound API Broker ${env.process.env.brokerName} registered successfully!`)
      } catch (error) {
        console.log("ERROR DURING BTP SERVICE BROKER =====>", error)
        console.error("Service broker cannot be registered!")
      }
    },
  }
}

/**
 * Unregister BTP Service Broker
 * @param {{process:object, appEnv}} env
 * @param {{serviceManager:object, credentials:Map, subAccountID:string}} state
 */
const canUnregisterBTPServiceBroker = (env, state) => {
  return {
    unregisterBTPServiceBroker: async () => {
      try {
        let sb = await state.serviceManager.getServiceBroker(`${env.process.env.brokerName}-${env.appEnv.app.space_name}-${state.subAccountID}`)
        await state.serviceManager.deleteServiceBroker(sb.id)
        console.log(`Service Broker ${env.process.env.brokerName} deleted`)
      } catch (error) {
        console.log(`Service Broker ${env.process.env.brokerName} can not be deleted`)
      }
    },
  }
}

/**
 * Create Cloud Foundry Route
 * @param {{process:object}} env
 * @param {{subDomain:string, cf:object}} state
 */
const canCreateRoute = (env, state) => {
  return {
    createRoute: async () => {
      try {
        const tenantHost = state.subDomain + process.env.tenantSeparator + process.env.saasAppName
        const appName = process.env.cfAppName
        await state.cf.createRoute(tenantHost, appName)
        console.log(`Route created for tenantHost: ${tenantHost} and appName: ${appName}`)
      } catch (error) {
        console.error("Route could not be created!")
        throw error
      }
    },
  }
}

/**
 * Delete Cloud Foundry Route
 * @param {{process:object}} env
 * @param {{subDomain:string, cf:object}} state
 */
const canDeleteRoute = (env, state) => {
  return {
    deleteRoute: async (unsubscribedSubdomain) => {
      try {
        const tenantHost = state.subDomain + process.env.tenantSeparator + process.env.saasAppName
        const appName = process.env.cfAppName
        await state.cf.deleteRoute(tenantHost, appName)
      } catch (error) {
        console.error("Route could not be deleted!")
        throw error
      }
    },
  }
}

const composeTenantAutomator = async (subAccountID, subDomain, credentialStoreContext) => {
  const appEnv = cfenv.getAppEnv()
  xsenv.loadEnv()

  const credentials = new Map()
  try {
    const credStore = composeCredentialStore(credentialStoreContext)

    let creds = await Promise.all([credStore.readCredential("password", "btp-admin-user"), credStore.readCredential("password", "broker-credentials")])
    creds.forEach((cred) => {
      credentials.set(cred.name, cred)
    })

    console.log("Credentials retrieved from credential store successfully")
  } catch (error) {
    console.error("Unable to retrieve credentials from cred store, please make sure that they are created! Automation skipped!")
    throw error
  }

  const btpAdmin = credentials.get("btp-admin-user")

  let cf = {}
  try {
    cf = composeCloudFoundryCLI()
    await cf.login(btpAdmin.username, btpAdmin.value)
    console.log("Cloud Foundry CLI login successful")
  } catch (error) {
    console.error("Unable to login to Cloud Foundry CLI! Automation skipped!")
    throw error
  }

  let cloudManagementCentral = {}
  let serviceManager = {}
  try {
    cloudManagementCentral = composeCloudManagementCentral(btpAdmin.username, btpAdmin.value, composeOAuthTokenUtility)
    let serviceManagerCredentials = await cloudManagementCentral.createServiceManager(subAccountID)
    console.log("Service manager has been created successfully!")
    serviceManager = composeServiceManager(serviceManagerCredentials, composeOAuthTokenUtility)
  } catch (error) {
    console.error("Service Manager can not be created!")
    throw error
  }

  const env = {
    process,
    appEnv,
  }

  const state = {
    cf,
    cloudManagementCentral,
    serviceManager,
    credentials,
    subAccountID,
    subDomain,
  }

  return {
    ...canDeployTenantArtifacts(env, state, canCreateRoute(env, state), canRegisterBTPServiceBroker(env, state), canCleanUpCreatedServices(env, state)),
    ...canUndeployTenantArtifacts(env, state, canDeleteRoute(env, state), canUnregisterBTPServiceBroker(env, state), canCleanUpCreatedServices(env, state)),
  }
}

module.exports = { composeTenantAutomator }
