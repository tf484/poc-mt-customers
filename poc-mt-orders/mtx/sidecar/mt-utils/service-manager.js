/**
 *
 * @param {{logInfo:Function,logError:Function,axios:object}} env
 * @param {{serviceCredentials:object}} state
 * @param {{getToken:Function}} getToken
 */
const canCreateServiceInstance = (env, state, { getToken }) => {
  return {
    createServiceInstance: async (serviceName, serviceOffering, servicePlan) => {
      try {
        let body = {
          name: serviceName,
          service_offering_name: serviceOffering,
          service_plan_name: servicePlan,
          labels: {
            createdBy: ["saas-automator"],
          },
        }
        let token = await getToken()
        let optionsInstance = {
          method: "POST",
          url: state.serviceCredentials.sm_url + `/v1/service_instances`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: JSON.stringify(body),
        }
        let response = await env.axios(optionsInstance)

        env.logInfo(`Service instance successfully created for ${serviceOffering}-${servicePlan}`)
        return response.data
      } catch (error) {
        env.logError(`Service instance can not be created for ${serviceOffering}-${servicePlan}`)
        throw error
      }
    },
  }
}

/**
 *
 * @param {{logInfo:Function,logError:Function,axios:object}} env
 * @param {{serviceCredentials:object}} state
 * @param {{getToken:Function}} getToken
 */
const canCreateServiceBinding = (env, state, { getToken }) => {
  return {
    createServiceBinding: async (serviceInstanceId, subscribingSubdomain) => {
      try {
        let token = await getToken()
        let options = {
          method: "POST",
          url: state.serviceCredentials.sm_url + `/v1/service_bindings`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: JSON.stringify({ name: subscribingSubdomain, service_instance_id: serviceInstanceId }),
        }
        let response = await env.axios(options)

        env.logInfo(`Service binding created for ${serviceInstanceId}`)
        return response.data
      } catch (error) {
        env.logError(`Service binding can not be created for ${serviceInstanceId}`)
        throw error
      }
    },
  }
}

/**
 *
 * @param {{logInfo:Function,logError:Function,axios:object}} env
 * @param {{serviceCredentials:object}} state
 * @param {{getToken:Function}} getToken
 */
const canDeleteServiceInstance = (env, state, { getToken }) => {
  return {
    deleteServiceInstance: async (serviceInstanceId) => {
      try {
        let token = await getToken()
        let optionsInstance = {
          method: "DELETE",
          url: state.serviceCredentials.sm_url + `/v1/service_instances/${serviceInstanceId}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
        let response = await env.axios(optionsInstance)

        env.logInfo(`Service instance ${serviceInstanceId} successfully deleted`)
        return response.data
      } catch (error) {
        env.logError(`Service instance can not be deleted`)
        throw error
      }
    },
  }
}

/**
 *
 * @param {{logInfo:Function,logError:Function,axios:object}} env
 * @param {{serviceCredentials:object}} state
 * @param {{getToken:Function}} getToken
 */
const canDeleteServiceBinding = (env, state, { getToken }) => {
  return {
    deleteServiceBinding: async (serviceBindingId) => {
      try {
        let token = await getToken()
        let optionsInstance = {
          method: "DELETE",
          url: state.serviceCredentials.sm_url + `/v1/service_bindings/${serviceBindingId}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
        let response = await env.axios(optionsInstance)

        env.logInfo(`Service binding ${serviceBindingId} successfully deleted`)
        return response.data
      } catch (error) {
        env.logError(`Service binding can not be deleted`)
        throw error
      }
    },
  }
}

/**
 *
 * @param {{logInfo:Function,logError:Function,axios:object}} env
 * @param {{serviceCredentials:object}} state
 * @param {{getToken:Function}} getToken
 */
const canGetAllServiceBindings = (env, state, { getToken }) => {
  return {
    getAllServiceBindings: async (tenant) => {
      try {
        let token = await getToken()
        let bindingQuery = new URLSearchParams({ label: `subaccount_id eq '${tenant}'` }).toString()
        let optionsBinding = {
          method: "GET",
          url: state.serviceCredentials.sm_url + `/v1/service_bindings?${bindingQuery}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
        let response = await env.axios(optionsBinding)

        env.logInfo(`Successfully retrieved service bindings for ${tenant}`)
        return response.data.items
      } catch (error) {
        env.logError("Can not retrieve service bindings")
        throw error
      }
    },
  }
}

/**
 *
 * @param {{logInfo:Function,logError:Function}} env
 * @param {{serviceCredentials:object, oAuthTokenUtility:object, tokenStore:object}} state
 */
const canGetToken = (env, state) => {
  return {
    getToken: async () => {
      try {
        if (!state.tokenStore.token) {
          let tokenEndpoint = state.serviceCredentials.url + "/oauth/token"
          state.tokenStore.token = await state.oAuthTokenUtility.getTokenWithClientCreds(
            tokenEndpoint,
            state.serviceCredentials.clientid,
            state.serviceCredentials.clientsecret
          )
        }
        return state.tokenStore.token
      } catch (error) {
        env.logError("Unable to get a token for Service Manager")
        throw error
      }
    },
  }
}

/**
 *
 * @param {{logInfo:Function,logError:Function,axios:object}} env
 * @param {{serviceCredentials:object}} state
 * @param {{getToken:Function}} getToken
 */
const canCreateServiceBroker = (env, state, { getToken }) => {
  return {
    createServiceBroker: async (name, url, description, user, password) => {
      let body = {
        name: name,
        broker_url: url,
        description: description,
        credentials: {
          basic: {
            username: user,
            password: password,
          },
        },
      }
      try {
        let token = await getToken()
        let options = {
          method: "POST",
          url: state.serviceCredentials.sm_url + `/v1/service_brokers`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: JSON.stringify(body),
        }
        let response = await env.axios(options)

        env.logInfo(`Service Broker ${name} successfully created`)
        return response.data
      } catch (error) {
        env.logError("Service Broker can not be created")
        throw error
      }
    },
  }
}

/**
 *
 * @param {{logInfo:Function,logError:Function,axios:object}} env
 * @param {{serviceCredentials:object}} state
 * @param {{getToken:Function}} getToken
 */
const canDeleteServiceBroker = (env, state, { getToken }) => {
  return {
    deleteServiceBroker: async (serviceBrokerId) => {
      try {
        const token = await getToken()
        const deleteUrl = state.serviceCredentials.sm_url + `/v1/service_brokers/${serviceBrokerId}`
        const options = {
          method: "DELETE",
          url: deleteUrl,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }

        const response = await env.axios(options)
        env.logInfo(`Service Broker ${serviceBrokerId} successfully deleted`)
        return response.data
      } catch (error) {
        env.logError("Service Broker can not be deleted")
        throw error
      }
    },
  }
}

/**
 *
 * @param {{logInfo:Function,logError:Function,axios:object}} env
 * @param {{serviceCredentials:object}} state
 * @param {{getToken:Function}} getToken
 */
const canGetServiceBroker = (env, state, { getToken }) => {
  return {
    getServiceBroker: async (name) => {
      try {
        const query = encodeURIComponent(`fieldQuery=name eq '${name}'`)
        const token = await getToken()
        const options = {
          method: "GET",
          url: state.serviceCredentials.sm_url + `/v1/service_brokers/?${query}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
        const response = await env.axios(options)
        env.logInfo(`Service Broker ${name} successfully retrieved`)
        return response.data.items[0]
      } catch (error) {
        env.logError("Unable to retrieve Service Broker")
        throw error
      }
    },
  }
}

const composeServiceManager = (env, serviceCredentials, composeOAuthTokenUtility) => {
  const oAuthTokenUtility = composeOAuthTokenUtility(env)

  const state = {
    oAuthTokenUtility,
    serviceCredentials,
    tokenStore: {},
  }

  return {
    ...canCreateServiceInstance(env, state, canGetToken(env, state)),
    ...canCreateServiceBinding(env, state, canGetToken(env, state)),
    ...canDeleteServiceInstance(env, state, canGetToken(env, state)),
    ...canDeleteServiceBinding(env, state, canGetToken(env, state)),
    ...canGetAllServiceBindings(env, state, canGetToken(env, state)),
    ...canCreateServiceBroker(env, state, canGetToken(env, state)),
    ...canDeleteServiceBroker(env, state, canGetToken(env, state)),
    ...canGetServiceBroker(env, state, canGetToken(env, state)),
  }
}

module.exports = { composeServiceManager }
