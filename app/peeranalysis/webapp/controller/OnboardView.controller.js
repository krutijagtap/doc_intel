sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
  ], function (Controller, MessageToast) {
    "use strict";
  
    return Controller.extend("peeranalysis.controller.OnboardView", {
      onInit: function () {
      
      },
      onAfterRendering: function () {
 
        const currentUrl = window.location.href;

        // Strip off the hash fragment (e.g., #/Onboard)
        const baseUrl = currentUrl.split("#")[0];
    
        // Replace app name in the base URL
        const pattern = /(\/[^\/]+\.earningupload\.)[^.]+(-[\d.]+\/index\.html)/;
        const targetBank = "onboardbanks";
      
        const newBankUrl = baseUrl.replace(pattern, `$1${targetBank}$2`);
     //   const newreportsUrl = baseUrl.replace(pattern, `$1${targetReports}$2`);
    
        const bankiframe = this.byId("onboardbanks")?.getDomRef();
        if (bankiframe) {
            bankiframe.setAttribute("src", newBankUrl);
        } else {
            console.error("iframe element not found");
        }

    //     const reportsiframe = this.byId("reports")?.getDomRef();
    //     if (reportsiframe) {
    //       reportsiframe.setAttribute("src", newreportsUrl);
    //   } else {
    //       console.error("iframe element not found");
    //   }
    }




    });
  });