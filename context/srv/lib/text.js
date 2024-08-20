
const { TextBundle } = require('@sap/textbundle')


/**
 * 
 * @param {{textBundle:TextBundle}} state  
 */
const canGetText = (state) => {
  return {
    /**
     * Retrieve text from text bundle for key
     * @param {string} key key identifier for text to retrieve
     * @param {string[]} [args] ordered arguments to add to text placeholders
     * @returns {string} found text placeholder arguments populated
     */
    getText: (key, args=[]) => {
      return state.textBundle.getText(key, args)
    }
  }

}
/**
 * 
 * @param {string} bundlePath
 * @param {string} [locale]
 */
const composeText = (bundlePath,locale=`en-EN`) => {

  const textBundle = new TextBundle(bundlePath,locale)

  const state={
    locale,
    bundlePath,
    textBundle
  }

  return {
    ...canGetText(state)
  }
}

module.exports = { composeText }