// @ts-nocheck

const cds = require("@sap/cds/lib")
const { GET, POST, expect, axios } = cds.test(__dirname + "/..")

axios.defaults.headers["Authorization"] = `Basic ${Buffer.from(
  "admin:"
).toString("base64")}`


//TODO: doesn't work, was wanting to remove chatter during test output, but this statement is not having any effect
//cds.env["log-level"] = cds.log.levels.SILENT

describe("Context Service", () => {
  it("create context", async () => {
    const payload = {
      contextType: "s4-sales-doc-item",
      descriptions: [
        {
          locale: "en",
          description: "test sales doc item",
        },
        { locale: "de", description: "german test sales doc item" },
      ],
      keys: [
        {
          keyName: "sales-doc",
          keyValue: "0210000245",
        },
        {
          keyName: "sales-doc-item",
          keyValue: "0010",
        },
        {
          keyName: "bad-key",
          keyValue: "invalid",
        },
      ],
      attributes: [
        {
          attributeName: "sales-doc-type",
          attributeValue: "quotation",
        },
        {
          attributeName: "bad-attribute",
          attributeValue: "invalid",
        },
      ],
    }

    //create context using defined payload
    const createResult = await POST(`/odata/v4/service/context/createContext`, payload)

    //create should end in 200 status for succesful create
    expect(createResult.status).to.equal(200)

    const createdID = createResult.data.contextID

    //read newly created record
    const readResult = await GET(`/odata/v4/service/context/Contexts(${createdID})?$expand=keys,attributes,texts`)

    //read should result in 200 status for successful read
    expect(readResult.status).to.equal(200)

    //created context should only include valid keys/attributes, should have a built composite Key, and all valid texts
    expect(readResult.data).to.containSubset({
      contextType_code: "s4-sales-doc-item",
      contextCategory_code: "sales-item",
      description: "test sales doc item",
      compositeKey: "s4-sales-doc-item-0210000245-0010",
      externalName: "0210000245-0010",
      keys: [
        {
          keyName: "sales-doc",
          keyValue: "0210000245",
        },
        {
          keyName: "sales-doc-item",
          keyValue: "0010",
        },
      ],
      attributes: [
        {
          attributeName: "sales-doc-type",
          attributeValue: "quotation",
        },
      ],
      texts: [
        {
          locale: "en",
          description: "test sales doc item",
        },
        { locale: "de", description: "german test sales doc item" },
      ],
    })

    //attempt to create same context again - should fail since context already exists
    try {
      await POST(`/odata/v4/service/context/createContext`, payload)
    } catch (err) {
      expect(err.message).to.equal(
        `500 - Cannot create context for Composite Key s4-sales-doc-item-0210000245-0010 and Context Type s4-sales-doc-item as it already exists under Context ID ${createdID}`
      )
    }
  })

  it("find context", async () => {
    //find recently created context
    const foundResult = await GET(`/odata/v4/service/context/findContext(contextType='s4-sales-doc-item',keyString='sales-doc:0210000245,sales-doc-item:0010')`)

    //find should end in 200 status for succesfull find
    expect(foundResult.status).to.equal(200)

    const foundID = foundResult.data.value

    //read found record
    const readResult = await GET(`/odata/v4/service/context/Contexts(${foundID})?$expand=keys,attributes,texts`)

    //read should result in 200 status for successful read
    expect(readResult.status).to.equal(200)

    //create context using defined payload
    try {
      await GET(`/odata/v4/service/context/findContext(contextType='s4-sales-doc-item',keyString='')`)
    } catch (err) {
      expect(err.message).to.equal("500 - All required Keys were not passed for Context Type s4-sales-doc-item")
    }
  })

})