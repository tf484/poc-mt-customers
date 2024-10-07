const cds = require("@sap/cds")
const { parse } = require("url");
const { WebSocketServer } = require("ws")

const log = cds.log("aic")

const wss = new WebSocketServer({ noServer: true })

cds.on("listening", ({ server }) => {
  log._info && log.info("listening for ws upgrade event")

  server.on("upgrade", (request, socket, head) => {
    const { pathname } = parse(request.url)
    log._info && log.info(`upgrade pathname: ${pathname}`)
    wss.handleUpgrade(request, socket, head, (ws) => {
      log._info && log.info("handle ws upgrade event")

      wss.emit("connection", ws, request)
    })
  })

  global.wss = wss
})

module.exports = (options) => {
  // delegate to default server.js
  return cds.server(options)
}
