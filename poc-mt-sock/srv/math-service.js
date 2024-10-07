const cds = require("@sap/cds")


const alertWsClients = (userID) => {
  if(global.wss){
    for (const client of global.wss.clients) {
      console.log(`new math entry for userID ${userID}`)
      setTimeout(() => {
        client.send(JSON.stringify({ userID }))
      }, 3000 )
    }
  }else{
    console.log("Websocket Global Not Found!!!")
  }
}

module.exports = cds.service.impl(async (srv) => {
  const { MathResults } = srv.entities

  const OPERATIONS = { ADD: "add", SUBTRACT: "subtract" }

  srv.on("add", async (req) => {
    const { inputValue1, inputValue2 } = req.data

    const inputValue1Number = Number.parseFloat(inputValue1)
    const inputValue2Number = Number.parseFloat(inputValue2)

    const resultValue = inputValue1Number + inputValue2Number

    console.log("inputValue1: ", inputValue1Number)
    console.log("inputValue2: ", inputValue2Number)
    console.log("result: ", resultValue)

    const insertResult = await INSERT.into(MathResults).entries([{ inputValue1: inputValue1Number, inputValue2: inputValue2Number, operation: OPERATIONS.ADD, resultValue }])

    alertWsClients(req.user.id)
  })

  srv.on("subtract", async (req) => {
    const { inputValue1, inputValue2 } = req.data

    const inputValue1Number = Number.parseFloat(inputValue1)
    const inputValue2Number = Number.parseFloat(inputValue2)

    const resultValue = inputValue1Number - inputValue2Number

    console.log("inputValue1: ", inputValue1Number)
    console.log("inputValue2: ", inputValue2Number)
    console.log("result: ", resultValue)

    const insertResult = await INSERT.into(MathResults).entries([{ inputValue1: inputValue1Number, inputValue2: inputValue2Number, operation: OPERATIONS.SUBTRACT, resultValue }])

    alertWsClients(req.user.id)
  })

  srv.on("getUser", async (req) => {
    return req.user.id
  })
})
