sap.ui.define([
	"sap/m/MessagePopover",
	"sap/m/MessageItem",
	"sap/ui/base/Object",
	"sap/m/MessageBox"
], function (MessagePopover, MessageItem, UI5Object, MessageBox) {
	"use strict";

	return UI5Object.extend("contexts.controller.ErrorHandler", {

		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias contexts.controller.ErrorHandler
		 */
		constructor: function (oComponent) {
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oModel = oComponent.getModel();
			this._messageOpen = false;
			this._serviceErrorText = this._oResourceBundle.getText("serviceErrorText");
			this._serviceErrorTitle = this._oResourceBundle.getText("serviceErrorTitle");


			this._oModel.attachDataReceived(function (oEvent) {
				const params = oEvent.getParameters();

                if(params.error){
                    this._showServiceError(params.error)
                }

			}, this);
		},

		_showServiceError: function (sDetails) {
			if (this._messageOpen) {
				return;
			}
			this._messageOpen = true;
			MessageBox.error(
				this._serviceErrorText, {
					id: "serviceErrorMessageBox",
                    title: this._serviceErrorTitle,
					details: sDetails,
					actions: [MessageBox.Action.CLOSE],
					onClose: function () {
						this._messageOpen = false;
					}.bind(this)
				}
			);
		}
	});
});