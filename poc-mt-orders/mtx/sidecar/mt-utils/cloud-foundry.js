
/**
 *
 * @param {{logInfo:function,logError:Function,getCloudFoundryApi:function,axios:object}} env
 * @param {{token:string|null}} state
 */
const canLogin = (env, state) => {
  return {
    /**
     * 
     * @param {string} username 
     * @param {string} password 
     */
    login: async (username, password) => {
      try {
        const optionsInfo = {
          method: "GET",
          url: env.getCloudFoundryApi() + "/info",
        }

        const cfInfo = await env.axios(optionsInfo)

        const loginEndpoint = cfInfo.data.authorization_endpoint
        const tokenEndpoint = loginEndpoint + "/oauth/token"
        const optionsLogin = {
          method: "POST",
          url: tokenEndpoint,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic Y2Y6",
          },
          data: new URLSearchParams({
            grant_type: "password",
            username: username,
            password: password,
          }).toString(),
        }
        const loginResponse = await env.axios(optionsLogin)
        state.token = loginResponse.data.access_token

        env.logInfo(`Login to Cloud Foundry API with user ${username} successful`)
        return loginResponse.data.access_token
      } catch (error) {
        env.logError(`Failed to login to Cloud Foundry API with user ${username}`)
        throw error
      }
    },
  }
}

/**
 * 
 * @param {{}} env 
 * @param {{token:string|null}} state 
 */
const canGetToken = (env, state) => {
  return {
    getToken: () => {
      if(!state.token) throw new Error('Token has not been set, please login first.')
      return state.token
    }
  }
}

/**
 *
 * @param {{logDebug:Function,logInfo:Function,logError:Function,getCloudFoundryApi:function,getOrgID:function,getSpaceID:function,getAppUri:function,axios:object}} env
 * @param {{}} state
 * @param {{getToken:function}} getToken
 */
const canGetAppDomainInfo = (env, state, { getToken }) => {
  return {
    getAppDomainInfo: async (appname) => {
      try {
        const token = getToken()

        const orgUrl = env.getCloudFoundryApi() + "/v3/apps?organization_guids=" + env.getOrgID() + "&space_guids=" + env.getSpaceID() + "&names=" + appname
        env.logDebug("Org URl: ", orgUrl)

        const optionsApps = {
          method: "GET",
          url: orgUrl,
          headers: {
            Authorization: "Bearer " + token,
          },
        }
        const resultApps = await env.axios(optionsApps)
        
        // @ts-ignore
        const domainUrl = env.getCloudFoundryApi() + "/v3/domains?names=" + /\.(.*)/gm.exec(env.getAppUri())[1]
        env.logDebug("Domain URL: ", domainUrl)

        const optionsDomains = {
          method: "GET",
          url: domainUrl,
          headers: {
            Authorization: "Bearer " + token,
          },
        }
        // get domain GUID
        const resultDomains = await env.axios(optionsDomains)
        const results = {
          app_id: resultApps.data.resources[0].guid,
          domain_id: resultDomains.data.resources[0].guid,
        }

        env.logInfo(`Domain info for ${appname} successfully retrieved`)
        return results
      } catch (error) {
        env.logError(`Retrieved domain info for app ${appname}`)
        throw error
      }
    },
  }
}

/**
 *
 * @param {{logInfo:function,logError:Function,getCloudFoundryApi:function,getSpaceID:function,axios:object}} env
 * @param {{}} state
 * @param {{getAppDomainInfo:function}} getAppDomainInfo
 * * @param {{getToken:function}} getToken
 */
const canCreateRoute = (env, state, { getAppDomainInfo }, { getToken }) => {
  return {
    createRoute: async (tenantHost, appname) => {
      try {

        const appDomainInfo = await getAppDomainInfo(appname)

        const token = getToken()

        const optionRoutes = {
          method: "POST",
          url: env.getCloudFoundryApi() + "/v3/routes",
          headers: {
            Authorization: "Bearer " + token,
          },
          data: {
            host: tenantHost,
            relationships: {
              space: {
                data: {
                  guid: env.getSpaceID(),
                },
              },
              domain: {
                data: {
                  guid: appDomainInfo.domain_id,
                },
              },
            },
          },
        }
        const resultRoutes = await env.axios(optionRoutes)

        const optionsApp = {
          method: "POST",
          url: env.getCloudFoundryApi() + "/v3/routes/" + resultRoutes.data.guid + "/destinations",
          headers: {
            Authorization: "Bearer " + token,
          },
          data: {
            destinations: [
              {
                app: {
                  guid: appDomainInfo.app_id,
                },
              },
            ],
          },
        }

        const resultApps = await env.axios(optionsApp)

        env.logInfo(`Route for ${tenantHost} successfully created`)
        return resultApps.data
      } catch (error) {
        env.logError("Route can not be created for ", tenantHost)
        throw error
      }
    },
  }
}

/**
 *
 * @param {{logError:Function,getCloudFoundryApi:function,axios:object}} env
 * @param {{}} state
 * @param {{getToken:function}} getToken
 */
const canGetAppRoute = (env, state, { getToken }) => {
  return {
    getAppRoute: async (appId, tenantHost) => {
      try {
        const options = {
          method: "GET",
          url: env.getCloudFoundryApi() + "/v3/apps/" + appId + "/routes",
          headers: {
            Authorization: "Bearer " + getToken(),
          },
          params: {
            hosts: tenantHost,
          },
        }
        const response = await env.axios(options)
        if (response.data.pagination.total_results === 1) {
          return response.data
        } else {
          env.logError(`Route for app ${appId} and host ${tenantHost} can not be found`)
          throw new Error(`Route for app ${appId} and host ${tenantHost} can not be found`)
        }
      } catch (error) {
        env.logError("Can not find the route")
      }
    },
  }
}

/**
 *
 * @param {{logInfo:function,logError:Function,getCloudFoundryApi:function,axios:object}} env
 * @param {{}} state
 * @param {{getAppDomainInfo:function}} getAppDomainInfo
 * @param {{getAppRoute:function}} getAppRoute
 * @param {{getToken:function}} getToken
 */
const canDeleteRoute = (env, state, { getAppDomainInfo }, { getAppRoute }, { getToken }) => {
  return {
    deleteRoute: async (tenantHost, appname) => {
      try {
        const appDomainInfo = await getAppDomainInfo(appname)
        const route = await getAppRoute(appDomainInfo.app_id, tenantHost)
        const options = {
          method: "DELETE",
          url: env.getCloudFoundryApi() + "/v3/routes/" + route.resources[0].guid,
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        }
        const response = await env.axios(options)
        env.logInfo(`Route for ${tenantHost} successfully deleted`)
        return response.data
      } catch (error) {
        env.logError("Route can not be deleted for ", tenantHost)
      }
    },
  }
}

const composeCloudFoundry = (env) => {

  const state = {
    token: null,
  }

  const closureGetToken = canGetToken(env, state)
  const closureGetAppDomainInfo = canGetAppDomainInfo(env, state, closureGetToken)
  const closureGetAppRoute = canGetAppRoute(env, state, closureGetToken)

  return {
    ...canLogin(env, state),
    ...canCreateRoute(env, state, closureGetAppDomainInfo, closureGetToken),
    ...canDeleteRoute(env, state, closureGetAppDomainInfo, closureGetAppRoute, closureGetToken),
  }
}

module.exports = { composeCloudFoundry }
