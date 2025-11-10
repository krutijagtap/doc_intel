sap.ui.define([
    "sap/ui/core/UIComponent",
    "peeranalysisv2/model/models",
     "peeranalysisv2/model/chatModel",
     "sap/ui/model/odata/v4/ODataModel"
], (UIComponent, models,chatModel,ODataModel,uploadEarnings) => {
    "use strict";

    return UIComponent.extend("peeranalysisv2.Component", {
        metadata: {
       
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();
            this.getModel("embeddings");

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
           
            
                        //Set Chat model
                        this.setModel(new chatModel(), "chatModel");

                        //RootPath
                        var appId = this.getManifestEntry("/sap.app/id");
                        var appPath = appId.replaceAll(".", "/");
                        var appModulePath = jQuery.sap.getModulePath(appPath);
                        let oRootPath = jQuery.sap.getModulePath("earningsai"); // your resource root
                        let oImageModel = new sap.ui.model.json.JSONModel({
                            path: appModulePath,
                        });
            
                        this.setModel(oImageModel, "imageModel");

                        const oContentModel = new ODataModel({
                            serviceUrl: "./odata/v4/earning-upload-srv/",
                            synchronizationMode: "None", // or "Auto" depending on your use case
                            operationMode: "Server", 
                            groupId: "$auto",
                            updateGroupId: "$auto",
                            autoExpandSelect: true
                          });
                    
                          // Set the model to the component with a name
                          this.setModel(oContentModel, "contentModel");

                        const oCIModel = new ODataModel({
                          serviceUrl: "./ci_api/odata/v4/catalog/",
                          synchronizationMode: "None", // or "Auto" depending on your use case
                          operationMode: "Server",
                          groupId: "$auto",
                          updateGroupId: "$auto",
                          autoExpandSelect: true,
                        });
                    
                          // Set the model to the component with a name
                          this.setModel(oCIModel, "contentIngestionModel");
                          

        }
    });
});