/**
 * @param {{logInfo:Function,logError:Function,axios}} env
 */
const canGetTokenWithPassword = (env) => {
  return {
    /**
     * Get OAuth Token using Client Credentials
     * @param {string} tokenEndpoint oauth token url endpoint
     * @param {string} clientid client id to use for authentication
     * @param {string} clientsecret client secret to use for authenication
     * @param {string} username user name
     * @param {string} password password
     * @returns access token
     */
    getTokenWithPassword: async (tokenEndpoint, clientid, clientsecret, username, password) => {
      try {
        let authOptions = {
          method: "POST",
          url: tokenEndpoint,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + Buffer.from(clientid + ":" + clientsecret).toString("base64"),
          },
          data: new URLSearchParams({
            grant_type: "password",
            username: username,
            password: password,
          }).toString(),
        }
        let response = await env.axios(authOptions)

        env.logInfo("Password Token Retrieved successfully")
        return response.data.access_token
      } catch (error) {
        env.logError("Password Token can not be retrieved!")
        throw error
      }
    },
  }
}

/**
 * @param {{logInfo:Function,logError:Function,axios}} env
 */
const canGetTokenWithClientCreds = (env) => {
  return {
    /**
     * Get OAuth Token using Client Credentials
     * @param {string} tokenEndpoint oauth token url endpoint
     * @param {*} clientid client id to use for authentication
     * @param {*} clientsecret client secret to use for authenication
     * @returns access token
     */
    getTokenWithClientCreds: async (tokenEndpoint, clientid, clientsecret) => {
      try {
        let authOptions = {
          method: "POST",
          url: tokenEndpoint,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + Buffer.from(clientid + ":" + clientsecret).toString("base64"),
          },
          data: new URLSearchParams({
            grant_type: "client_credentials",
            response_type: "token",
          }).toString(),
        }
        let response = await env.axios(authOptions)

        env.logInfo("Password Token Retrieved successfully")
        return response.data.access_token
      } catch (error) {
        env.logError("Client Credential Token can not be retrieved!")
        throw error
      }
    },
  }
}

const composeOAuthTokenUtility = (env) => {
  return {
    ...canGetTokenWithPassword(env),
    ...canGetTokenWithClientCreds(env),
  }
}

module.exports = {
  composeOAuthTokenUtility,
}
