sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageBox"
    ],
    function(BaseController, MessageBox) {
      "use strict";

      let sessionTimeout
      let isTrackingSession = false
    
      window.resetSessionTimer = function () {
        if (isTrackingSession) {
          clearTimeout(sessionTimeout)
          window.startSessionTimer()
        }
      }
    
      window.stopSessionTimer = function () {
        clearTimeout(sessionTimeout)
        isTrackingSession = false
      }
    
      window.startSessionTimer = function () {
        var bundle = jQuery.sap.resources({url : "i18n/i18n.properties"});
        isTrackingSession = true
        sessionTimeout = setTimeout(function () {
          MessageBox.show(bundle.getText("SessionDialogMessage"), {
            icon: MessageBox.Icon.INFORMATION,
            title: bundle.getText("SessionDialogTitle"),
            actions: [bundle.getText("SignIn"), MessageBox.Action.CLOSE],
            emphasizedAction: bundle.getText("SignIn"),
            onClose: function (sAction) {
              if (sAction == bundle.getText("SignIn")) {
                window.location.reload()
              } else {
                window.stopSessionTimer()
              }
            },
          })
        }, 840 * 1000)
      }
  
      return BaseController.extend("contexts.controller.App", {
        onInit() {
          window.startSessionTimer()
        }
      });
    }
  );
  