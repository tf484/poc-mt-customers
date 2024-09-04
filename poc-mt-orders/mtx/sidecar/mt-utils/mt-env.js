/**
 * @typedef {string} UUID
 */

/**
 * @param {{cds:object}} state
 */
const canGetLog = (state) => {
  return {
    getLog: () => {
      return state.cds.log("aic")
    },
  }
}

/**
 *
 * @param {*} state
 * @param {{getLog:function}} getLog
 * @returns
 */
const canLogDebug = (state, { getLog }) => {
  return {
    logDebug: (...args) => {
      const log = getLog()
      log._debug && log.debug(args)
    },
  }
}

/**
 *
 * @param {*} state
 * @param {{getLog:function}} getLog
 * @returns
 */
const canLogError = (state, { getLog }) => {
  return {
    logError: (...args) => {
      const log = getLog()
      log._error && log.error(args)
    },
  }
}

/**
 *
 * @param {*} state
 * @param {{getLog:function}} getLog
 * @returns
 */
const canLogInfo = (state, { getLog }) => {
    return {
      logInfo: (...args) => {
        const log = getLog()
        log._info && log.info(args)
      },
    }
  }

/**
 * @param {{tenantSubdomain:string|null}} state
 */

const canGetTenantSubdomain = (state) => {
  return {
    getTenantSubdomain: () => {
      if (!state.tenantSubdomain) throw new Error("Tenant Subdomain has not been set")
      return state.tenantSubdomain
    },
  }
}

/**
 * @param {{tenantSubaccountID:UUID|null}} state
 */

const canGetTenantSubaccountID = (state) => {
  return {
    getTenantSubaccountID: () => {
      if (!state.tenantSubaccountID) throw new Error("Tenant Subaccount ID has not been set")
      return state.tenantSubaccountID
    },
  }
}

/**
 * @param {{credentialStoreNamespace:string|null}} state
 */

const canGetCredentialStoreNamespace = (state) => {
  return {
    getCredentialStoreNamespace: () => {
      if (!state.credentialStoreNamespace) throw new Error("Credential Store Namespace has not been set")
      return state.credentialStoreNamespace
    },
  }
}

/**
 * @param {{tenantSeparator:string|null}} state
 */

const canGetTenantSeparator = (state) => {
  return {
    getTenantSeparator: () => {
      if (!state.tenantSeparator) throw new Error("Tenant Separator has not been set")
      return state.tenantSeparator
    },
  }
}

/**
 * @param {{saasAppName:string|null}} state
 */

const canGetSaasAppName = (state) => {
  return {
    getSaasAppName: () => {
      if (!state.saasAppName) throw new Error("Saas App Name has not been set")
      return state.saasAppName
    },
  }
}

/**
 * @param {{cloudFoundryAppName:string|null}} state
 */

const canGetCloudFoundryAppName = (state) => {
  return {
    getCloudFoundryAppName: () => {
      if (!state.cloudFoundryAppName) throw new Error("Cloud Foundry App Name has not been set")
      return state.cloudFoundryAppName
    },
  }
}

/**
 * @param {{cloudFoundryApi:string|null}} state
 */

const canGetCloudFoundryApi = (state) => {
  return {
    getCloudFoundryApi: () => {
      if (!state.cloudFoundryApi) throw new Error("Cloud Foundry API has not been set")
      return state.cloudFoundryApi
    },
  }
}

/**
 * @param {{brokerName:string|null}} state
 */

const canGetBrokerName = (state) => {
  return {
    getBrokerName: () => {
      if (!state.brokerName) throw new Error("Broker Name has not been set")
      return state.brokerName
    },
  }
}

/**
 * @param {{brokerUrl:string|null}} state
 */

const canGetBrokerUrl = (state) => {
  return {
    getBrokerUrl: () => {
      if (!state.brokerUrl) {
        throw new Error("Broker URL has not been set")
      }
      return state.brokerUrl
    },
  }
}

/**
 * @param {{spaceName:string|null}} state
 */

const canGetSpaceName = (state) => {
  return {
    getSpaceName: () => {
      if (!state.spaceName) throw new Error("Space Name has not been set")
      return state.spaceName
    },
  }
}

/**
 * @param {{spaceID:string|null}} state
 */

const canGetSpaceID = (state) => {
  return {
    getSpaceID: () => {
      if (!state.spaceID) throw new Error("Space ID has not been set")
      return state.spaceID
    },
  }
}

/**
 * @param {{orgID:string|null}} state
 */

const canGetOrgID = (state) => {
  return {
    getOrgID: () => {
      if (!state.orgID) throw new Error("Organization ID has not been set")
      return state.orgID
    },
  }
}

/**
 * @param {{appUri:string|null}} state
 */

const canGetAppUri = (state) => {
  return {
    getAppUri: () => {
      if (!state.appUri) throw new Error("App URI has not been set")
      return state.appUri
    },
  }
}

/**
 * @param {{cisCentral:string|null}} state
 */

const canGetCisCentral = (state) => {
  return {
    getCisCentral: () => {
      if (!state.cisCentral) {
        throw new Error("CIS Central has not been set")
      }
      return state.cisCentral
    },
  }
}

/**
 * @param {{credStore:string|null}} state
 */

const canGetCredStore = (state) => {
  return {
    getCredStore: () => {
      if (!state.credStore) {
        throw new Error("Credential Store has not been set")
      }
      return state.credStore
    },
  }
}

/**
 *
 * @param {object} cds CAP Core Data Services
 * @param {object} axios
 * @param {object} fetch,
 * @param {object} jose,
 * @param {string|null|undefined} tenantSubdomain
 * @param {UUID|null|undefined} tenantSubaccountID
 * @param {string|null|undefined} credentialStoreNamespace
 * @param {string|null|undefined} tenantSeparator
 * @param {string|null|undefined} saasAppName
 * @param {string|null|undefined} cloudFoundryAppName
 * @param {string|null|undefined} cloudFoundryApi
 * @param {string|null|undefined} brokerName
 * @param {string|null|undefined} brokerUrl
 * @param {string|null|undefined} spaceName
 * @param {string|null|undefined} spaceID
 * @param {string|null|undefined} orgID
 * @param {string|null|undefined} appUri
 * @param {object|null|undefined} cisCentral
 * @param {object|null|undefined} credStore
 */

const composeEnvironment = (
  cds,
  axios,
  fetch,
  jose,
  tenantSubdomain,
  tenantSubaccountID,
  credentialStoreNamespace,
  tenantSeparator,
  saasAppName,
  cloudFoundryAppName,
  cloudFoundryApi,
  brokerName,
  brokerUrl,
  spaceName,
  spaceID,
  orgID,
  appUri,
  cisCentral,
  credStore
) => {
  const state = {
    cds,
    axios,
    fetch,
    jose,
    tenantSubdomain: tenantSubdomain ? tenantSubdomain : null,
    tenantSubaccountID: tenantSubaccountID ? tenantSubaccountID : null,
    credentialStoreNamespace: credentialStoreNamespace ? credentialStoreNamespace : null,
    tenantSeparator: tenantSeparator ? tenantSeparator : null,
    saasAppName: saasAppName ? saasAppName : null,
    cloudFoundryAppName: cloudFoundryAppName ? cloudFoundryAppName : null,
    cloudFoundryApi: cloudFoundryApi ? cloudFoundryApi : null,
    brokerName: brokerName ? brokerName : null,
    brokerUrl: brokerUrl ? brokerUrl : null,
    spaceName: spaceName ? spaceName : null,
    spaceID: spaceID ? spaceID : null,
    appUri: appUri ? appUri : null,
    orgID: orgID ? orgID : null,
    cisCentral: cisCentral ? cisCentral : null,
    credStore: credStore ? credStore : null,
  }

  const closureGetLogs = canGetLog(state)
  const closureLogDebug = canLogDebug(state, closureGetLogs)
  const closureLogError = canLogError(state, closureGetLogs)
  const closureLogInfo = canLogInfo(state, closureGetLogs)

  const { logDebug } = closureLogDebug

  logDebug("<====== BEGIN MT Environment Variables ===========>")
  logDebug(" cds set: ", state.cds ? true : false)
  logDebug(" axios set: ", state.axios ? true : false)
  logDebug(" fetch set: ", state.fetch ? true : false)
  logDebug(" jose set: ", state.jose ? true : false)
  logDebug(" cisCentral set: ", state.cisCentral ? true : false)
  logDebug(" credStore set: ", state.credStore ? true : false)
  logDebug(" tenantSubdomain: ", state.tenantSubdomain)
  logDebug(" tenantSubaccountID: ", state.tenantSubaccountID)
  logDebug(" credentialStoreNamespace: ", state.credentialStoreNamespace)
  logDebug(" saasAppName: ", state.saasAppName)
  logDebug(" cloudFoundryAppName: ", state.cloudFoundryAppName)
  logDebug(" cloudFoundryApi: ", state.cloudFoundryApi)
  logDebug(" brokerName: ", state.brokerName)
  logDebug(" brokerUrl: ", state.brokerUrl)
  logDebug(" spaceName: ", state.spaceName)
  logDebug(" spaceID: ", state.spaceID)
  logDebug(" appUri: ", state.appUri)
  logDebug(" orgID: ", state.orgID)
  logDebug("<====== END MT Environment Variables ===========>")

  return {
    ...closureGetLogs,
    ...closureLogError,
    ...closureLogDebug,
    ...closureLogInfo,
    axios: state.axios,
    fetch: state.fetch,
    jose: state.jose,
    ...canGetTenantSubdomain(state),
    ...canGetTenantSubaccountID(state),
    ...canGetCredentialStoreNamespace(state),
    ...canGetTenantSeparator(state),
    ...canGetSaasAppName(state),
    ...canGetCloudFoundryAppName(state),
    ...canGetCloudFoundryApi(state),
    ...canGetBrokerName(state),
    ...canGetBrokerUrl(state),
    ...canGetSpaceName(state),
    ...canGetSpaceID(state),
    ...canGetOrgID(state),
    ...canGetAppUri(state),
    ...canGetCisCentral(state),
    ...canGetCredStore(state),
  }
}

module.exports = { composeEnvironment }
