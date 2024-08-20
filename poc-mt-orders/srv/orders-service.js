const cds = require("@sap/cds")

module.exports = cds.service.impl(async (srv) => {
  srv.on("createContext", async (req) => {
    const contextService = await cds.connect.to("ContextService")

    // const payload = {
    //   contextType: "s4-sales-doc-item",
    //   descriptions: [
    //     {
    //       locale: "en",
    //       description: "test sales doc item",
    //     },
    //     { locale: "de", description: "german test sales doc item" },
    //   ],
    //   keys: [
    //     {
    //       keyName: "sales-doc",
    //       keyValue: "0210000245",
    //     },
    //     {
    //       keyName: "sales-doc-item",
    //       keyValue: "0010",
    //     },
    //     {
    //       keyName: "bad-key",
    //       keyValue: "invalid",
    //     },
    //   ],
    //   attributes: [
    //     {
    //       attributeName: "sales-doc-type",
    //       attributeValue: "quotation",
    //     },
    //     {
    //       attributeName: "bad-attribute",
    //       attributeValue: "invalid",
    //     },
    //   ],
    // }

    // //create context using defined payload
    // const createResult = await contextService.post('createContext', payload)

    // const contextID = createResult.data.contextID

    // console.log(`Context ID: ${contextID}`)

    const contexts = await contextService.get('Contexts')
    console.log("finished")
  })
})
