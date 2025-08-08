sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    'use strict';

    return {
        getDocumentUrl: function (url) {
            const additionalUrl = this?.getEditFlow()?.getAppComponent()?._componentConfig?.url;
            if (additionalUrl) {
                return additionalUrl.slice(0, -1) + url;
            } else {
                return url;
            }
        },

        onEarningFileUploadChange: async function (oEvent) {
            const oFileUploader = oEvent.getSource();
            const oFile = oEvent.getParameter("files")[0];
            const oView = this.getEditFlow().getView();
            const oModel = oView.getModel(); // OData V4 model
            const oContext = oView.getBindingContext(); // EarningFiles context

            if (!oFile || !oContext) return;

            const reader = new FileReader();
            const readPromise = new Promise((resolve, reject) => {
                reader.onload = function (e) {
                    const content = e.currentTarget.result;

                    resolve(content);
                };

                reader.onerror = function (error) {
                    reject(error);
                };
            });
            reader.readAsDataURL(oFile);

            const result = await readPromise;

            const fileContent = result.split("base64,")[1];

            try {
                const fileUrl = "./odata/v4/earning-upload-srv/EarningFiles(ID=<ID>,IsActiveEntity=true)/content";
                oContext.setProperty("mediaType", oFile.type);
                oContext.setProperty("fileName", oFile.name);
                oContext.setProperty("content", fileContent);
                oContext.setProperty("url", fileUrl.replace("<ID>", oContext.getProperty("ID")));
                MessageToast.show("File uploaded successfully");
            } catch (err) {
                sap.m.MessageBox.error("Upload failed: " + err.message);
            }
        }
    };
});