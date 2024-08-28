const axios = require("axios")
const xsenv = require("@sap/xsenv")

/**
 *
 * @param {{oAuthTokenUtility:object, axios:object}} env
 * @param {{cisCentral:object,username:string,password:string}} state
 */
const canCreateServiceManager = (env, state) => {
  return {
    /**
     * @async
     * @param {string} subaccountId
     */
    createServiceManager: async (subaccountId) => {
      try {
        let clientid = state.cisCentral.uaa.clientid
        let clientsecret = state.cisCentral.uaa.clientsecret
        let tokenEndpoint = state.cisCentral.uaa.url + "/oauth/token"
        let token = await env.oAuthTokenUtility.getTokenWithPassword(tokenEndpoint, clientid, clientsecret, state.username, state.password)
        let authOptions = {
          method: "POST",
          url: state.cisCentral.endpoints.accounts_service_url + `/accounts/v1/subaccounts/${subaccountId}/serviceManagementBinding`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: JSON.stringify({
            labels: {
              createdBy: ["tenant-automator"],
            },
          }),
        }
        let response = await env.axios(authOptions)
        console.log(`Service manager in tenant subaccount ${subaccountId} successfully created`)
        return response.data
      } catch (error) {
        console.error(`Error: Service manager can not be created in tenant subaccount ${subaccountId}`)
        console.error("Error: Broker automation is skipped")
        throw error
      }
    },
  }
}

/**
 *
 * @param {{oAuthTokenUtility:object, axios:object}} env
 * @param {{cisCentral:object,username:string,password:string}} state
 */
const canDeleteServiceManager = (env, state) => {
  return {
    deleteServiceManager: async (subaccountId) => {
      try {
        let clientid = state.cisCentral.uaa.clientid
        let clientsecret = state.cisCentral.uaa.clientsecret
        let tokenEndpoint = state.cisCentral.uaa.url + "/oauth/token"
        let token = await env.oAuthTokenUtility.getTokenWithPassword(tokenEndpoint, clientid, clientsecret, state.username, state.password)
        let authOptions = {
          method: "DELETE",
          url: state.cisCentral.endpoints.accounts_service_url + `/accounts/v1/subaccounts/${subaccountId}/serviceManagementBinding`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
        let response = await env.axios(authOptions)
        console.log(`Service manager in tenant subaccount ${subaccountId} successfully deleted`)
        return response.data
      } catch (error) {
        console.error(`Error: Service manager can not be deleted from tenant subaccount ${subaccountId}`)
        throw error
      }
    },
  }
}

const composeCloudManagementCentral = (username, password, composeOAuthTokenUtility) => {
  xsenv.loadEnv()
  const services = xsenv.getServices({ cisCentral: { label: "cis" } })

  const oAuthTokenUtility = composeOAuthTokenUtility()

  const env = {
    oAuthTokenUtility,
    axios,
  }
  const state = {
    username,
    password,
    cisCentral: services.cisCentral,
  }

  return {
    ...canCreateServiceManager(env, state),
    ...canDeleteServiceManager(env, state),
  }
}

module.exports = { composeCloudManagementCentral }
