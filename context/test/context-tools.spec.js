// @ts-nocheck
const expect = require("chai").expect

const path = require("path")
const {
  parseKeyString,
  canValidateKeys,
  canValidateAttributes,
  canFilterKeys,
  canFilterAttributes,
  canBuildCompositeKey,
  canBuildExternalName,
  canFindContext,
  canCreateContext,
} = require("../srv/lib/context-tools")
const { composeText } = require("../srv/lib/text")
const text = composeText(path.join(__dirname, `_i18n-test`, `i18n`))

const testContextConfig = {
  getKeys: () => {
    return ["key1", "key2"]
  },
  getAttributes: () => {
    return ["attribute1", "attribute2"]
  },
  getCompositeKeySegments: () => {
    return [
      { segmentType: "literal", segmentValue: "test" },
      { segmentType: "literal", segmentValue: "-" },
      { segmentType: "key", segmentValue: "key2" },
      { segmentType: "literal", segmentValue: "-" },
      { segmentType: "key", segmentValue: "key1" },
    ]
  },
  getExternalNameSegments: () => {
    return [
      { segmentType: "key", segmentValue: "key2" },
      { segmentType: "literal", segmentValue: "-" },
      { segmentType: "attribute", segmentValue: "attribute1" },
    ]
  },
}

describe("Context Tools", () => {
  it("should parse keys correctly", () => {
    const keyString = "key1:value1,key2:value2"

    const keys = parseKeyString(keyString)

    expect(keys).to.deep.equal([
      { keyName: "key1", keyValue: "value1" },
      { keyName: "key2", keyValue: "value2" },
    ])
  })

  it("should filter keys to only what is configured for context type", () => {
    const testState = {
      contextConfig: testContextConfig,
    }
    const { filterKeys } = canFilterKeys(testState)

    const keySetOne = [
      { keyName: "key1", keyValue: "value1" },
      { keyName: "key2", keyValue: "value2" },
    ]
    const filteredKeySetOne = filterKeys("test-context", keySetOne)

    //all  keys passed, so filtered should be same as original
    expect(filteredKeySetOne).to.deep.equal(keySetOne)

    const keySetTwo = [
      { keyName: "key1", keyValue: "value1" },
      { keyName: "key2", keyValue: "value2" },
      { keyName: "key3", keyValue: "value3" },
    ]

    const filteredKeySetTwo = filterKeys("test-context", keySetTwo)

    // a subset of keys returned, since one passed is extraneous
    expect(filteredKeySetTwo).to.deep.equal(keySetOne)

    const keySetThree = [
      { keyName: "key1", keyValue: "value1" },
      { keyName: "key3", keyValue: "value3" },
    ]

    const filteredKeySetThree = filterKeys("test-context", keySetThree)

    // only one key returned, as one of two is not part configuration
    expect(filteredKeySetThree).to.deep.equal([{ keyName: "key1", keyValue: "value1" }])
  })

  it("should filter attributes to only what is configured for context type", () => {
    const testState = {
      contextConfig: testContextConfig,
    }
    const { filterAttributes } = canFilterAttributes(testState)

    const attributeSetOne = [
      { attributeName: "attribute1", attributeValue: "value1" },
      { attributeName: "attribute2", attributeValue: "value2" },
    ]
    const filteredAttributeSetOne = filterAttributes("test-context", attributeSetOne)

    //all attributes passed, so filtered should be same as original
    expect(filteredAttributeSetOne).to.deep.equal(attributeSetOne)

    const attributeSetTwo = [
      { attributeName: "attribute1", attributeValue: "value1" },
      { attributeName: "attribute2", attributeValue: "value2" },
      { attributeName: "attribute3", attributeValue: "value3" },
    ]

    const filteredAttributeSetTwo = filterAttributes("test-context", attributeSetTwo)

    // a subset of attributes returned, since one passed is extraneous
    expect(filteredAttributeSetTwo).to.deep.equal(attributeSetOne)

    const attributeSetThree = [
      { attributeName: "attribute1", attributeValue: "value1" },
      { attributeName: "attribute3", attributeValue: "value3" },
    ]

    const filteredAttributeSetThree = filterAttributes("test-context", attributeSetThree)

    // only one attribute returned, as one of two is not part configuration
    expect(filteredAttributeSetThree).to.deep.equal([{ attributeName: "attribute1", attributeValue: "value1" }])
  })

  it("should validate keys to what is configured for context type", () => {
    const testState = {
      contextConfig: testContextConfig,
    }
    const { validateKeys } = canValidateKeys(testState)

    const keySetOne = [
      { keyName: "key1", keyValue: "value1" },
      { keyName: "key2", keyValue: "value2" },
    ]

    //exact keys passed, so valid
    expect(validateKeys("test-context", keySetOne)).to.be.true

    const keySetTwo = [
      { keyName: "key1", keyValue: "value1" },
      { keyName: "key2", keyValue: "value2" },
      { keyName: "key3", keyValue: "value3" },
    ]

    // a superset of keys passed, so valid
    expect(validateKeys("test-context", keySetTwo)).to.be.true

    const keySetThree = [
      { keyName: "key1", keyValue: "value1" },
      { keyName: "key3", keyValue: "value3" },
    ]

    // only one valid key is present, so false
    expect(validateKeys("test-context", keySetThree)).to.be.false
  })

  it("should validate attributes to what is configured for context type", () => {
    const testState = {
      contextConfig: testContextConfig,
    }
    const { validateAttributes } = canValidateAttributes(testState)

    const attributeSetOne = [
      { attributeName: "attribute1", attributeValue: "value1" },
      { attributeName: "attribute2", attributeValue: "value2" },
    ]

    //exact attributes passed, so valid
    expect(validateAttributes("test-context", attributeSetOne)).to.be.true

    const attributeSetTwo = [
      { attributeName: "attribute1", attributeValue: "value1" },
      { attributeName: "attribute2", attributeValue: "value2" },
      { attributeName: "attribute3", attributeValue: "value3" },
    ]

    // a superset of attributes passed, so valid
    expect(validateAttributes("test-context", attributeSetTwo)).to.be.true

    const attributeSetThree = [
      { attributeName: "attribute1", attributeValue: "value1" },
      { attributeName: "attribute3", attributeValue: "value3" },
    ]

    // only one valid attribute is present, so false
    expect(validateAttributes("test-context", attributeSetThree)).to.be.false
  })

  it("should build composite key based on context type config", () => {
    const testState = {
      contextConfig: testContextConfig,
    }
    const { buildCompositeKey } = canBuildCompositeKey(testState)

    const keySet = [
      { keyName: "key1", keyValue: "value1" },
      { keyName: "key2", keyValue: "value2" },
      { keyName: "key3", keyValue: "value3" },
    ]

    const compositeKeyString = buildCompositeKey("test-context", keySet)

    // extra key (key3) is not included and values are out of order due to config
    expect(compositeKeyString).to.equal("test-value2-value1")
  })

  it("should throw excepiton when attempting to build a composite key based on incorrect context type config", () => {
    const testState = {
      text,
      contextConfig: {
        getCompositeKeySegments: () => {
          return [
            { segmentType: "attribute", segmentValue: "test" }, //attributes can not be used to build composite keys
          ]
        },
      },
    }

    const { buildCompositeKey } = canBuildCompositeKey(testState)
    const keySet = []
    // exception thrown because attribute used in context type config
    expect(() => buildCompositeKey("test-context", keySet)).to.throw("compositeKeyCanNotBeCreatedByAttributeValues")
  })

  it("should build external name based on context type config", () => {
    const testState = {
      contextConfig: testContextConfig,
    }
    const { buildExternalName } = canBuildExternalName(testState)

    const keySet = [
      { keyName: "key1", keyValue: "keyValue1" },
      { keyName: "key2", keyValue: "keyValue2" },
      { keyName: "key3", keyValue: "keyValue3" },
    ]

    const attributeSet = [
      { attributeName: "attribute1", attributeValue: "attributeValue1" },
      { attributeName: "attribute2", attributeValue: "attributeValue2" },
    ]

    const externalNameString = buildExternalName("test-context", keySet, attributeSet)

    // only key value 2 and attribute value 1 are included
    expect(externalNameString).to.equal("keyValue2-attributeValue1")
  })

  it("should not find context if keys passed are not valid", async () => {

    const { findContext } = canFindContext({}, {text}, { validateKeys: () => false }, { buildCompositeKey: () => 'test-composite-key'})

    //should error out on invalid keys since passing stub function that always returns false for the "validateKeys" call
    try {
      await findContext()
    } catch (err) {
      expect(err.message).to.deep.equal("keysNotValidForContextType")
    }
  })

  it("create should throw errors if context not valid", async () => {
    const contextConfig = { getContextCategory: () => "stub-context-category" }
    const stubState = { text, contextConfig }
    const stubEnv = {}

    const stubValidateKeysTrue = { validateKeys: () => true }
    const stubValidateKeysFalse = { validateKeys: () => false }
    const stubValidateAttributesTrue = { validateAttributes: () => true }
    const stubValidateAttributesFalse = { validateAttributes: () => false }

    const stubFilterKeys = { filterKeys: () => [] }
    const stubFilterAttibutes = { filterAttributes: () => [] }

    const stubBuildCompositeKey = { buildCompositeKey: () => "stub-composite-key" }
    const stubBuildExternalName = { buildExternalName: () => "stub-external-name" }

    const stubFindContext = { findContext: () => "stub-uuid-of-found-context-for-error" }

    const { ["createContext"]: createForFindContextValidation } = canCreateContext(
      stubEnv,
      stubState,
      stubValidateKeysTrue,
      stubValidateAttributesTrue,
      stubFilterKeys,
      stubFilterAttibutes,
      stubBuildCompositeKey,
      stubBuildExternalName,
      stubFindContext
    )

    try {
      await createForFindContextValidation("stub-context-type", [], [], [])
    } catch (err) {
      expect(err.message).to.deep.equal("cannotCreateContextAsAlreadyExists")
    }

    const { ["createContext"]: createForValidateKeysValidation } = canCreateContext(
      stubEnv,
      stubState,
      stubValidateKeysFalse,
      stubValidateAttributesTrue,
      stubFilterKeys,
      stubFilterAttibutes,
      stubBuildCompositeKey,
      stubBuildExternalName,
      stubFindContext
    )

    try {
      await createForValidateKeysValidation("stub-context-type", [], [], [])
    } catch (err) {
      expect(err.message).to.deep.equal("keysNotValidForContextType")
    }

    const { ["createContext"]: createForValidateAttributesValidation } = canCreateContext(
      stubEnv,
      stubState,
      stubValidateKeysTrue,
      stubValidateAttributesFalse,
      stubFilterKeys,
      stubFilterAttibutes,
      stubBuildCompositeKey,
      stubBuildExternalName,
      stubFindContext
    )

    try {
      await createForValidateAttributesValidation("stub-context-type", [], [], [])
    } catch (err) {
      expect(err.message).to.deep.equal("attributesNotValidForContextType")
    }
  })
})
