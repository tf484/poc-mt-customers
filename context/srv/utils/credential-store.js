/*
    Based on SAP Help document
    https://help.sap.com/docs/CREDENTIAL_STORE/601525c6e5604e4192451d5e7328fa3c/decad8fa526c40138d2a6843fb6a82bb.html
*/


 const fetch = require("node-fetch")
 const jose = require("node-jose")
 const xsenv = require("@sap/xsenv")


/**
 * @param {*} env 
 * @param {*} state 
 */
const canCheckStatus = (env, state) => {
  return {
    /**
     * check response and throw error if needed
     * @param {{ok:*,status:*,statusText:string}} response 
     * @returns 
     */
    checkStatus: async (response) => {
      if (!response.ok) {
        throw Error("checkStatus: " + response.status + " " + response.statusText)
      }
      return response
    },
  }
}

/**
 * 
 * @param {{jose:object}} env 
 * @param {*} state 
 */
const canDecryptPayload = (env, state) => {
  return {
    /**
     * Decrypt Payload
     * @param {*} privateKey 
     * @param {*} payload 
     * @returns 
     */
    decryptPayload: async (privateKey, payload) => {
      const key = await env.jose.JWK.asKey(`-----BEGIN PRIVATE KEY-----${privateKey}-----END PRIVATE KEY-----`, "pem", { alg: "RSA-OAEP-256", enc: "A256GCM" })
      const decrypt = await env.jose.JWE.createDecrypt(key).decrypt(payload)
      const result = decrypt.plaintext.toString()
      return result
    },
  }
}

/**
 * 
 * @param {{fetch:object}} env 
 * @param {{binding:object, namespace:string}} state 
 * @returns 
 */
const canGetHeaders = (env, state) => {
  return {
    /**
     * 
     * @param {object} init initial headers to include
     * @returns 
     */
    getHeaders: async (init) => {
      const headers = new env.fetch.Headers(init)
      headers.set("Authorization", `Basic ${Buffer.from(`${state.binding.username}:${state.binding.password}`).toString("base64")}`)
      headers.set("sapcp-credstore-namespace", state.namespace)
      return headers
    },
  }
}

/**
 * 
 * @param {{fetch:object}} env 
 * @param {object} state 
 * @param {{checkStatus:function}} checkStatus 
 * @param {{decryptPayload:function}} param3 
 */
const canFetchAndDecrypt = (env, state, { checkStatus }, { decryptPayload }) => {
  return {
    /**
     * 
     * @param {string} privateKey private key used to decrypt return payload
     * @param {string} url url to request result from
     * @param {string} method HTTP method for result request
     * @param {object} headers headers needed to request
     * @param {*} body 
     */
    fetchAndDecrypt: async (privateKey, url, method, headers, body) => {
      const result = await env.fetch(url, { method, headers, body })
        .then(checkStatus)
        .then((response) => response.text())
        .then((payload) => decryptPayload(privateKey, payload))
        .then(JSON.parse)
      return result
    },
  }
}

/**
 * 
 * @param {*} env 
 * @param {{binding}} state 
 * @param {{fetchAndDecrypt:function}} fetchAndDecrypt
 * @param {{getHeaders:function}} getHeaders
 */
const canReadCredential = (env, state, { fetchAndDecrypt }, { getHeaders }) => {
  return {
    /**
     * 
     * @param {*} type 
     * @param {*} name 
     * @returns 
     */
    readCredential: async (type, name) => {
      const headers = await getHeaders()
      return fetchAndDecrypt(
        state.binding.encryption.client_private_key,
        `${state.binding.url}/${type}?name=${encodeURIComponent(name)}`,
        "get",
        headers
      )
    },
  }
}

const composeCredentialStore = (namespace) => {
  xsenv.loadEnv()
  const services = xsenv.getServices({ credStore: { tag: "credstore" } })
  const binding = services.credStore
  if (!binding) console.error("Credential Store Binding not found from xsenv.services")

  const env = {
    fetch,
    jose,
  }

  const state = {
    namespace,
    binding,
  }

  return {
    ...canReadCredential(env,state, canFetchAndDecrypt(env, state, canCheckStatus(env, state), canDecryptPayload(env, state)), canGetHeaders(env, state)),
  }
}

module.exports = {
  composeCredentialStore,
}
