
/**
* @param {{}} env 
* @param {{}} state 
*/
const canCheckStatus = (env, state) => {
 return {
   /**
    * check response and throw error if needed
    * @param {{ok:*,status:*,statusText:string}} response 
    */
   checkStatus: async (response) => {
     if (!response.ok) {
       throw new Error("Credential Store Status: " + response.status + " " + response.statusText)
     }
     return response
   },
 }
}

/**
* 
* @param {{jose:object}} env 
* @param {{}} state 
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
* @param {{fetch:object,getCredStore:Function}} env 
* @param {{namespace:string}} state 
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
     const credStore = env.getCredStore()
     headers.set("Authorization", `Basic ${Buffer.from(`${credStore.username}:${credStore.password}`).toString("base64")}`)
     headers.set("sapcp-credstore-namespace", state.namespace)
     return headers
   },
 }
}

/**
* 
* @param {{fetch:object}} env 
* @param {{}} state 
* @param {{checkStatus:Function}} checkStatus 
* @param {{decryptPayload:Function}} param3 
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
* @param {{logInfo:Function,logError:Function,getCredStore:Function}} env 
* @param {*} state 
* @param {{fetchAndDecrypt:Function}} fetchAndDecrypt
* @param {{getHeaders:Function}} getHeaders
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
    try{
      const headers = await getHeaders()
      const credStore = env.getCredStore()
      const credential = fetchAndDecrypt(
        credStore.encryption.client_private_key,
        `${credStore.url}/${type}?name=${encodeURIComponent(name)}`,
        "get",
        headers
      )
      env.logInfo(`Credential ${name} successfully retrieved from Credential Store`)
      return credential
    } catch (error){
      env.logError(`Failed to retrieve credential ${name} from Credential Store`)
      throw error
    }
   },
 }
}

const composeCredentialStore = (env, namespace) => {


 const state = {
   namespace,
 }

 return {
   ...canReadCredential(env, state, canFetchAndDecrypt(env, state, canCheckStatus(env, state), canDecryptPayload(env, state)), canGetHeaders(env, state)),
 }
}

module.exports = {
 composeCredentialStore,
}
