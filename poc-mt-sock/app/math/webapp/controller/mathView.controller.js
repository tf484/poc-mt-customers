sap.ui.define(["sap/ui/core/mvc/Controller", "sap/base/Log", "sap/ui/core/ws/WebSocket", "sap/ui/model/json/JSONModel"], function (Controller, Log, WebSocket, JSONModel) {
  "use strict"

  return Controller.extend("math.controller.mathView", {
    onInit: async function () {
      const viewData = new JSONModel()

      viewData.setProperty("/inputValue1", 0)
      viewData.setProperty("/inputValue2", 0)
      viewData.setProperty("/lastRefreshed", new Date())
      this.setModel(viewData, "viewData")

      this._logger = Log.getLogger("math.controller.CompositeApp")
      this._logger.setLevel("INFO")

      this._setUser()

      this._initializeWebsocket()
    },

    onAdd: async function () {
      const viewData = this.getModel("viewData")
      const inputValue1 = viewData.getProperty("/inputValue1") ? viewData.getProperty("/inputValue1") : 0
      const inputValue2 = viewData.getProperty("/inputValue2") ? viewData.getProperty("/inputValue2") : 0

      const model = this.getModel()
      const bindContext = model.bindContext("/add(...)")
      bindContext.setParameter("inputValue1", inputValue1)
      bindContext.setParameter("inputValue2", inputValue2)

      await this.executeBindContext(bindContext)

      this.clearInput()
    },


    onSubtract: async function () {
      const viewData = this.getModel("viewData")
      const inputValue1 = viewData.getProperty("/inputValue1") ? viewData.getProperty("/inputValue1") : 0
      const inputValue2 = viewData.getProperty("/inputValue2") ? viewData.getProperty("/inputValue2") : 0

      const model = this.getModel()
      const bindContext = model.bindContext("/subtract(...)")
      bindContext.setParameter("inputValue1", inputValue1)
      bindContext.setParameter("inputValue2", inputValue2)

      await this.executeBindContext(bindContext)

      this.clearInput()
    },

    onRefresh: function () {
      const tableBinding = this.byId("mathResults").getBinding("items")
      tableBinding.refresh()
      const viewData = this.getModel("viewData")
      viewData.setProperty("/lastRefreshed", new Date())
    },

    clearInput: function () {
      const viewData = this.getModel("viewData")
      viewData.setProperty("/inputValue1", 0)
      viewData.setProperty("/inputValue2", 0)
    },

    getModel: function (sName) {
      return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName)
    },

    setModel: function (oModel, sName) {
      return this.getView().setModel(oModel, sName)
    },

    executeBindContext: async function(preparedBindContext) {
      const view = this.getView()
      view.setBusy(true)

      await preparedBindContext.execute()

      view.setBusy(false)
    },

    _setUser: async function() {
      const model = this.getModel()
      const bindContext = model.bindContext("/getUser(...)")

      await this.executeBindContext(bindContext)

      const userID = await bindContext.requestObject("value")

      this.userID = userID
    },

    _initializeWebsocket: function () {
      let wsUrl
      if (document.location.protocol === "https:") {
        wsUrl =
          "wss://" + document.location.host + document.location.pathname + "/ws";
      } else {
        wsUrl =
          "ws://" + document.location.host + document.location.pathname + "/ws";
      }
      var connection = new WebSocket(wsUrl)

      connection.attachOpen(
        function (controlEvent) {
          this._logger.info(`wss open`)
        }.bind(this)
      )

      connection.attachMessage(
        function (controlEvent) {
          var wsMessage = JSON.parse(controlEvent.getParameter("data"))
          if (wsMessage.userID !== undefined && wsMessage.userID === this.userID) {
            this.onRefresh()
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
