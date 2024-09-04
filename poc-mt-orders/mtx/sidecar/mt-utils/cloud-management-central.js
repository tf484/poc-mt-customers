
/**
 *
 * @param {{logInfo:Function,logError:Function,getCisCentral:Function,axios:object}} env
 * @param {{oAuthTokenUtility:object,username:string,password:string}} state
 */
const canCreateServiceManager = (env, state) => {
  return {
    /**
     * @async
     * @param {string} subaccountId
     */
    createServiceManager: async (subaccountId) => {
      try {
        const cisCentral = env.getCisCentral()
        const clientID = cisCentral.uaa.clientid
        const clientSecret = cisCentral.uaa.clientsecret
        const tokenEndpoint = cisCentral.uaa.url + "/oauth/token"
        const token = await state.oAuthTokenUtility.getTokenWithPassword(tokenEndpoint, clientID, clientSecret, state.username, state.password)
        const url = cisCentral.endpoints.accounts_service_url + `/accounts/v1/subaccounts/${subaccountId}/serviceManagementBinding`

        const authOptions = {
          method: "POST",
          url: url,
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

        const response = await env.axios(authOptions)

        env.logInfo(`Service manager in tenant subaccount ${subaccountId} successfully created`)
        return response.data
      } catch (error) {
        env.logError(`Service manager can not be created in tenant subaccount ${subaccountId}`)
        throw error
      }
    },
  }
}

/**
 *
 * @param {{logInfo:Function,logError:Function,getCisCentral:Function,axios:object}} env
 * @param {{oAuthTokenUtility:object,username:string,password:string}} state
 */
const canDeleteServiceManager = (env, state) => {
  return {
    deleteServiceManager: async (subaccountId) => {
      try {
        const cisCentral = env.getCisCentral()
        const clientID = cisCentral.uaa.clientid
        const clientSecret = cisCentral.uaa.clientsecret
        const tokenEndpoint = cisCentral.uaa.url + "/oauth/token"
        const token = await state.oAuthTokenUtility.getTokenWithPassword(tokenEndpoint, clientID, clientSecret, state.username, state.password)
        const url = cisCentral.endpoints.accounts_service_url + `/accounts/v1/subaccounts/${subaccountId}/serviceManagementBinding`

        const authOptions = {
          method: "DELETE",
          url: url,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }

        const response = await env.axios(authOptions)

        env.logInfo(`Service manager in tenant subaccount ${subaccountId} successfully deleted`)
        return response.data
      } catch (error) {
        env.logError(`Service manager can not be deleted from tenant subaccount ${subaccountId}`)
        throw error
      }
    },
  }
}

const composeCloudManagementCentral = (env, username, password, composeOAuthTokenUtility) => {

  const oAuthTokenUtility = composeOAuthTokenUtility(env)

  const state = {
    oAuthTokenUtility,
    username,
    password
  }

  return {
    ...canCreateServiceManager(env, state),
    ...canDeleteServiceManager(env, state),
  }
}

module.exports = { composeCloudManagementCentral }
