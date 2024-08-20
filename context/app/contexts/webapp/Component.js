/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/Device", "contexts/model/models", "./controller/ErrorHandler"],
  function (UIComponent, Device, models, ErrorHandler) {
    "use strict"

    return UIComponent.extend("contexts.Component", {
      metadata: {
        manifest: "json",
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments)

        this._errorHandler = new ErrorHandler(this)

        // enable routing
        this.getRouter().initialize()

        // set the device model
        this.setModel(models.createDeviceModel(), "device")
      },

      /**
       * The component is destroyed by UI5 automatically.
       * In this method, the ErrorHandler is destroyed.
       * @public
       * @override
       */
      destroy: function () {
        this._errorHandler.destroy()
        // call the base component's destroy function
        UIComponent.prototype.destroy.apply(this, arguments)
      },

      getErrorHandler: function () {
        return this._errorHandler
      },
    })
  }
)
