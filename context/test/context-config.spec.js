// @ts-nocheck
const expect = require("chai").expect

const path = require("path")
const {
  canGetContextTypes,
  canGetContextCategories,
  canCheckContextTypeConfigExists,
  canCheckContextCategoryConfigExists,
  canGetContextCategory,
  canGetKeys,
  canGetAttributes,
  canGetCompositeKeySegments,
  canGetExternalNameSegments,
} = require("../srv/lib/context-config")
const { composeText } = require("../srv/lib/text")
const text = composeText(path.join(__dirname, `_i18n-test`, `i18n`))

const CONTEXT_TYPES = {
  TEST_CONTEXT_ONE: "test-context-one",
  TEST_CONTEXT_TWO: "test-context-two",
}

const CONTEXT_CATEGORIES = {
  TEST_CATEGORY_ONE: "test-category-one",
  TEST_CATEGORY_TWO: "test-category-two",
}

const testContextCategoryConfig = [
  { contextCategory: CONTEXT_CATEGORIES.TEST_CATEGORY_ONE, attributes: ["attributeOne", "attributeTwo"] },
]

const testContextTypeConfig = [
  { contextType: "test-context-one", contextCategory: CONTEXT_CATEGORIES.TEST_CATEGORY_ONE, keys: ["keyOne", "keyTwo"] },

  {
    contextType: "test-context-two",
    contextCategory: CONTEXT_CATEGORIES.TEST_CATEGORY_TWO,
    keys: ["keyThree"],
    compositeKeySegments: [
      { segmentType: "segment-type-one", segmentValue: "segment-value-one" },
      { segmentType: "segment-type-two", segmentValue: "segment-value-two" },
    ],
    externalNameSegments: [
      { segmentType: "segment-type-one", segmentValue: "segment-value-one" },
      { segmentType: "segment-type-two", segmentValue: "segment-value-two" },
      { segmentType: "segment-type-three", segmentValue: "segment-value-three" },
    ],
  },
]

describe("Context Configuration", () => {

  it("should check if a context type configuration exists", () => {
    const testState = {
      contextTypeConfig: testContextTypeConfig,
    }

    const { checkContextTypeConfigExists } = canCheckContextTypeConfigExists(testState)

    const oneExists = checkContextTypeConfigExists("test-context-one")
    expect(oneExists).to.be.true

    const threeExists = checkContextTypeConfigExists("test-context-three")
    expect(threeExists).to.be.false
  })

  it("should return the correct keys for a context type", () => {
    const testState = {
      text,
      contextTypeConfig: testContextTypeConfig,
    }

    const { getKeys } = canGetKeys(testState, canCheckContextTypeConfigExists(testState))

    const oneKeys = getKeys("test-context-one")

    //retrieves correct keys
    expect(oneKeys).to.deep.equal(["keyOne", "keyTwo"])

    //throws error for missing context type
    expect(() => getKeys("test-context-three")).to.throw("contextConfigNotFoundForContextType")
  })

  it("should return the correct attributes for a context type", () => {
    const testState = {
      text,
      contextTypeConfig: testContextTypeConfig,
      contextCategoryConfig: testContextCategoryConfig,
    }

    const { getAttributes } = canGetAttributes(
      testState,
      canGetContextCategory(testState, canCheckContextTypeConfigExists(testState)),
      canCheckContextCategoryConfigExists(testState)
    )

    const oneAttributes = getAttributes("test-context-one")

    //retrieves correct attributes
    expect(oneAttributes).to.deep.equal(["attributeOne", "attributeTwo"])

    //throws error for missing context type configuration or context category config
    expect(() => getAttributes("test-context-three")).to.throw("contextConfigNotFoundForContextType")
    expect(() => getAttributes("test-context-two")).to.throw("contextConfigNotFoundForContextCategory")
  })

  it("should return the correct composite key segments for a context type", () => {
    const testState = {
      text,
      contextTypeConfig: testContextTypeConfig,
    }

    const { getCompositeKeySegments } = canGetCompositeKeySegments(testState, canCheckContextTypeConfigExists(testState))

    const oneSegments = getCompositeKeySegments("test-context-one")

    // no composite key segments
    expect(oneSegments).to.deep.equal([])

    const twoSegments = getCompositeKeySegments("test-context-two")

    //retrieves correct attributes
    expect(twoSegments).to.deep.equal([
      { segmentType: "segment-type-one", segmentValue: "segment-value-one" },
      { segmentType: "segment-type-two", segmentValue: "segment-value-two" },
    ])

    //throws error for missing context type
    expect(() => getCompositeKeySegments("test-context-three")).to.throw("contextConfigNotFoundForContextType")
  })

  it("should return the correct external name segments for a context type", () => {
    const testState = {
      text,
      contextTypeConfig: testContextTypeConfig,
    }

    const { getExternalNameSegments } = canGetExternalNameSegments(testState, canCheckContextTypeConfigExists(testState))

    const oneSegments = getExternalNameSegments("test-context-one")

    // no composite key segments
    expect(oneSegments).to.deep.equal([])

    const twoSegments = getExternalNameSegments("test-context-two")

    //retrieves correct attributes
    expect(twoSegments).to.deep.equal([
      { segmentType: "segment-type-one", segmentValue: "segment-value-one" },
      { segmentType: "segment-type-two", segmentValue: "segment-value-two" },
      { segmentType: "segment-type-three", segmentValue: "segment-value-three" },
    ])

    //throws error for missing context type
    expect(() => getExternalNameSegments("test-context-three")).to.throw("contextConfigNotFoundForContextType")
  })
})
