// const cfenv = require("cfenv")
// const xsenv = require("@sap/xsenv")

const { composeServiceManager } = require("./service-manager")
const { composeCredentialStore } = require("./credential-store")
const { composeOAuthTokenUtility } = require("./oauth-token-utility")
const { composeCloudManagementCentral } = require("./cloud-management-central")
const { composeCloudFoundry } = require("./cloud-foundry")

const CREDENTIAL_TYPE_PASSWORD = "password"
const CREDENTIAL_BTP_ADMIN = "btp-admin-user"
const CREDENTIAL_BROKER_USER = "broker-credentials"

/**
 * Deploy Tenant Artifacts
 * @param {{logInfo:Function,logError:Function}} env
 * @param {object} state
 * @param {{createRoute:Function}} createRoute
 * @param {{registerBTPServiceBroker:Function}} registerBTPServiceBroker
 * @param {{cleanUpCreatedServices:Function}} cleanupCreatedServices
 */
const canDeployTenantArtifacts = (env, state, { createRoute }, { registerBTPServiceBroker }, { cleanUpCreatedServices }) => {
  return {
    deployTenantArtifacts: async () => {
      try {
        await createRoute()
        await registerBTPServiceBroker()
        await cleanUpCreatedServices()
        env.logInfo("Tenant Automation: Deployment has been completed successfully!")
      } catch (error) {
        env.logError("Tenant Automation Error during deployment of Artifacts")
        throw error
      }
    },
  }
}

/**
 * Undeploy Tenant Artifacts
 * @param {{logInfo:Function,logError:Function}} env
 * @param {object} state
 * @param {{deleteRoute:Function}} deleteRoute
 * @param {{unregisterBTPServiceBroker:Function}} unregisterBTPServiceBroker
 * @param {{cleanUpCreatedServices:Function}} cleanUpCreatedServices
 */
const canUndeployTenantArtifacts = (env, state, { deleteRoute }, { unregisterBTPServiceBroker }, { cleanUpCreatedServices }) => {
  return {
    undeployTenantArtifacts: async () => {
      try {
        await deleteRoute()
        await unregisterBTPServiceBroker()
        await cleanUpCreatedServices()
        env.logInfo("Automation: Undeployment has been completed successfully!")
      } catch (error) {
        env.logError("Tenant artifacts cannot be undeployed!")
        throw error
      }
    },
  }
}

/**
 * Register BTP Service Broker
 * @param {{logInfo:Function,logError:Function,getTenantSubaccountID:Function}} env
 * @param {{cloudManagementCentral:object}} state
 */
const canCleanUpCreatedServices = (env, state) => {
  return {
    cleanUpCreatedServices: async () => {
      try {
        await state.cloudManagementCentral.deleteServiceManager(env.getTenantSubaccountID())
        env.logInfo("Service Manager is deleted")
      } catch (error) {
        env.logError("Clean up can not be completed!")
        throw error
      }
    },
  }
}

/**
 * Register BTP Service Broker
 * @param {{logInfo:Function,logError:Function,getBrokerName:Function,getBrokerUrl:Function,getSpaceName:Function}} env
 * @param {{serviceManager:object, credentials:Map}} state
 */
const canRegisterBTPServiceBroker = (env, state) => {
  return {
    registerBTPServiceBroker: async () => {
      try {
        let sbCreds = state.credentials.get(CREDENTIAL_BROKER_USER)
        let sbUrl = env.getBrokerUrl()
        await state.serviceManager.createServiceBroker(
          `${env.getBrokerName()}-${env.getSpaceName()}`,
          sbUrl,
          "AICOMP API Broker",
          sbCreds.username,
          sbCreds.value
        )
        env.logInfo(`Inbound API Broker ${env.getBrokerName()} registered successfully!`)
      } catch (error) {
        env.logError("Service broker cannot be registered!")
        throw error
      }
    },
  }
}

/**
 * Unregister BTP Service Broker
 * @param {{logInfo:Function,logError:Function,getBrokerName:Function,getBrokerUrl:Function,getSpaceName:Function,getTenantSubaccountID:Function}} env
 * @param {{serviceManager:object}} state
 */
const canUnregisterBTPServiceBroker = (env, state) => {
  return {
    unregisterBTPServiceBroker: async () => {
      try {
        const serviceBroker = await state.serviceManager.getServiceBroker(`${env.getBrokerName()}-${env.getSpaceName()}-${env.getTenantSubaccountID()}`)
        await state.serviceManager.deleteServiceBroker(serviceBroker.id)
        env.logInfo(`Service Broker ${env.getBrokerName()} deleted`)
      } catch (error) {
        env.logError(`Service Broker ${env.getBrokerName()} can not be deleted`)
        throw error
      }
    },
  }
}

/**
 * Create Cloud Foundry Route
 * @param {{logInfo:Function,logError:Function,getTenantSubdomain:Function,getTenantSeparator:Function,getSaasAppName:Function, getCloudFoundryAppName}} env
 * @param {{cloudFoundry:object}} state
 */
const canCreateRoute = (env, state) => {
  return {
    createRoute: async () => {
      try {
        const tenantHost = env.getTenantSubdomain() + env.getTenantSeparator() + env.getSaasAppName()
        const appName = env.getCloudFoundryAppName()
        await state.cloudFoundry.createRoute(tenantHost, appName)
        env.logInfo(`Route created for tenantHost: ${tenantHost} and appName: ${appName}`)
      } catch (error) {
        env.logError("Route could not be created!")
        throw error
      }
    },
  }
}

/**
 * Delete Cloud Foundry Route
 * @param {{logInfo:Function,logError:Function,getTenantSubdomain:Function,getTenantSeparator:Function,getSaasAppName:Function, getCloudFoundryAppName}} env
 * @param {{cloudFoundry:object}} state
 */
const canDeleteRoute = (env, state) => {
  return {
    deleteRoute: async () => {
      try {
        const tenantHost = env.getTenantSubdomain() + env.getTenantSeparator() + env.getSaasAppName()
        const appName = env.getCloudFoundryAppName()
        await state.cloudFoundry.deleteRoute(tenantHost, appName)
        env.logInfo(`Route deleted for tenantHost: ${tenantHost} and appName: ${appName}`)
      } catch (error) {
        env.logError("Route could not be deleted!")
        throw error
      }
    },
  }
}

/**
 *
 * @param {{logDebug,logError,logInfo,getCredentialStoreNamespace,getTenantSubdomain,getTenantSubaccountID,getTenantSeparator,getSaasAppName,getCloudFoundryAppName,getBrokerName,getBrokerUrl,getSpaceName}} env
 */
const composeTenantAutomator = async (env) => {
  try {

    const credentials = new Map()
    const credStore = composeCredentialStore(env, env.getCredentialStoreNamespace())

    const creds = await Promise.all([
      credStore.readCredential(CREDENTIAL_TYPE_PASSWORD, CREDENTIAL_BTP_ADMIN),
      credStore.readCredential(CREDENTIAL_TYPE_PASSWORD, CREDENTIAL_BROKER_USER),
    ])
    creds.forEach((cred) => {
      credentials.set(cred.name, cred)
    })

    const btpAdmin = credentials.get(CREDENTIAL_BTP_ADMIN)

    const cloudFoundry = composeCloudFoundry(env)
    await cloudFoundry.login(btpAdmin.username, btpAdmin.value)

    const cloudManagementCentral = composeCloudManagementCentral(env, btpAdmin.username, btpAdmin.value, composeOAuthTokenUtility)
    const serviceManagerCredentials = await cloudManagementCentral.createServiceManager(env.getTenantSubaccountID())

    const serviceManager = composeServiceManager(env, serviceManagerCredentials, composeOAuthTokenUtility)

    const state = {
      cloudFoundry,
      cloudManagementCentral,
      serviceManager,
      credentials,
    }
    env.logInfo("Tenant Automator Created")

    return {
      ...canDeployTenantArtifacts(env, state, canCreateRoute(env, state), canRegisterBTPServiceBroker(env, state), canCleanUpCreatedServices(env, state)),
      ...canUndeployTenantArtifacts(env, state, canDeleteRoute(env, state), canUnregisterBTPServiceBroker(env, state), canCleanUpCreatedServices(env, state)),
    }
  } catch (error) {
    env.logError("Unable to compose Tenant Automator")
    throw error
  }
}

module.exports = { composeTenantAutomator }
