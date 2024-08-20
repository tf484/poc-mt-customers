/**
 * @param {{locale:string}} state
 */

/**
 *
 * @param {object} cds CAP Core Data Services
 * @param {object} service CAP service
 * @param {string} locale Location/Language of user (ex: en-EN, de-DE, etc.)
 */
const composeEnvironment = (cds, service, locale) => {
  const state = {
    locale,
    cds,
    service,
  }
  return {
    ...state,
  }
}

module.exports = { composeEnvironment }
