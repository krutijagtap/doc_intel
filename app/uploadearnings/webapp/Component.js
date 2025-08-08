

sap.ui.define(
    ["sap/fe/core/AppComponent"],
    function (Component) {
        "use strict";

        return Component.extend("com.scb.uploadearnings.Component", {
            metadata: {
                manifest: "json"
            },

            onInit: function(){
                const oModel = this.getModel("visibility");
                oModel.bindContext("/VisibilityConfig").requestObject().then(function (odata) {
                    console.log("Visibility config loaded",odata);

                });

            }
        });
    }
);