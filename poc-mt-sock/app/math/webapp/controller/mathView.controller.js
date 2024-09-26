sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/ws/WebSocket"], function (Controller, WebSocket) {
  "use strict"

  return Controller.extend("math.controller.mathView", {
    onInit: function () {
      this._initializeWebsocket()
    },

    _initializeWebsocket: function () {
      var connection = new WebSocket("/core-ws")

      connection.attachOpen(
        function (controlEvent) {
          this._logger.info(`wss open`)
        }.bind(this)
      )

      connection.attachMessage(
        function (controlEvent) {
          var wsMessage = JSON.parse(controlEvent.getParameter("data"))
          if (wsMessage.appID !== undefined && wsMessage.appID === this.appID) {
            this._refreshView()
          }
        }.bind(this)
      )

      connection.attachError(
        function (controlEvent) {
          this._logger.error(`wss error`)
        }.bind(this)
      )

      connection.attachClose(
        function (controlEvent) {
          this._logger.warning(`wss close`)
          setTimeout(this._initializeWebsocket.bind(this), 1000)
        }.bind(this)
      )
    },
  })
})
