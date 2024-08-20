const axios = require("axios")
const cfenv = require("cfenv")

/**
 *
 * @param {{appEnv:object,axios:object}} env
 * @param {{token:string}} state
 */
const canLogin = (env, state) => {
  return {
    login: async (username, password) => {
      try {
        const optionsInfo = {
          method: "GET",
          url: env.appEnv.app.cf_api + "/info",
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
        console.log(`Login to CF with user ${username} successful`)
        return loginResponse.data.access_token
      } catch (error) {
        console.error(`Error: Can not login to CF with user ${username}`)
      }
    },
  }
}

/**
 *
 * @param {{appEnv:object,axios:object}} env
 * @param {{token:string}} state
 */
const canGetAppDomainInfo = (env, state) => {
  return {
    getAppDomainInfo: async (appname) => {
      try {
        const optionsApps = {
          method: "GET",
          url:
            env.appEnv.app.cf_api +
            "/v3/apps?organization_guids=" +
            env.appEnv.app.organization_id +
            "&space_guids=" +
            env.appEnv.app.space_id +
            "&names=" +
            appname,
          headers: {
            Authorization: "Bearer " + state.token,
          },
        }
        const resultApps = await env.axios(optionsApps)

        const optionsDomains = {
          method: "GET",
          // @ts-ignore
          url: env.appEnv.app.cf_api + "/v3/domains?names=" + /\.(.*)/gm.exec(env.appEnv.app.application_uris[0])[1],
          headers: {
            Authorization: "Bearer " + state.token,
          },
        }
        // get domain GUID
        let resultDomains = await env.axios(optionsDomains)
        let results = {
          app_id: resultApps.data.resources[0].guid,
          domain_id: resultDomains.data.resources[0].guid,
        }
        console.log(`Domain info for ${appname} successfully retrieved`)
        return results
      } catch (err) {
        console.error(`Error: Can get domain info for app ${appname}`)
        console.error(`Error: ${err.stack}`)
        return err.message
      }
    },
  }
}

/**
 *
 * @param {{appEnv:object,axios:object}} env
 * @param {{token:string}} state
 * @param {{getAppDomainInfo:function}} getAppDomainInfo
 */
const canCreateRoute = (env, state, { getAppDomainInfo }) => {
  return {
    createRoute: async (tenantHost, appname) => {
      try {
        const appDomainInfo = await getAppDomainInfo(appname)
        const optionRoutes = {
          method: "POST",
          url: env.appEnv.app.cf_api + "/v3/routes",
          headers: {
            Authorization: "Bearer " + state.token,
          },
          data: {
            host: tenantHost,
            relationships: {
              space: {
                data: {
                  guid: env.appEnv.app.space_id,
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
          url: env.appEnv.app.cf_api + "/v3/routes/" + resultRoutes.data.guid + "/destinations",
          headers: {
            Authorization: "Bearer " + state.token,
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

        let resultApps = await env.axios(optionsApp)
        console.log(`Route for ${tenantHost} successfully created`)
        return resultApps.data
      } catch (error) {
        console.error("Error: Route can not be created for ", tenantHost)
      }
    },
  }
}

/**
 *
 * @param {{appEnv:object,axios:object}} env
 * @param {{token:string}} state
 */
const canGetAppRoute = (env, state) => {
  return {
    getAppRoute: async (appId, tenantHost) => {
      try {
        const options = {
          method: "GET",
          url: env.appEnv.app.cf_api + "/v3/apps/" + appId + "/routes",
          headers: {
            Authorization: "Bearer " + state.token,
          },
          params: {
            hosts: tenantHost,
          },
        }
        const response = await env.axios(options)
        if (response.data.pagination.total_results === 1) {
          return response.data
        } else {
          console.error(`Error: Route for app ${appId} and host ${tenantHost} can not be found`)
          throw new Error(`Error: Route for app ${appId} and host ${tenantHost} can not be found`)
        }
      } catch (error) {
        console.error("Error: Can not find the route")
      }
    },
  }
}

/**
 *
 * @param {{appEnv:object,axios:object}} env
 * @param {{token:string}} state
 * @param {{getAppDomainInfo:function}} getAppDomainInfo
 * @param {{getAppRoute:function}} getAppRoute
 */
const canDeleteRoute = (env, state, { getAppDomainInfo }, { getAppRoute }) => {
  return {
    deleteRoute: async (tenantHost, appname) => {
      try {
        const appDomainInfo = await getAppDomainInfo(appname)
        const route = await getAppRoute(appDomainInfo.app_id, tenantHost)
        const options = {
          method: "DELETE",
          url: env.appEnv.app.cf_api + "/v3/routes/" + route.resources[0].guid,
          headers: {
            Authorization: "Bearer " + state.token,
          },
        }
        const response = await env.axios(options)
        console.log(`Route for ${tenantHost} successfully deleted`)
        return response.data
      } catch (error) {
        console.error("Error: Route can not be deleted for ", tenantHost)
      }
    },
  }
}

const composeCloudFoundryCLI = () => {
  const appEnv = cfenv.getAppEnv()

  const env = {
    appEnv,
    axios,
  }

  const state = {
    token: "",
  }

  return {
    ...canLogin(env, state),
    ...canCreateRoute(env, state, canGetAppDomainInfo(env, state)),
    ...canDeleteRoute(env, state, canGetAppDomainInfo(env, state), canGetAppRoute(env, state)),
  }
}

module.exports = { composeCloudFoundryCLI }
