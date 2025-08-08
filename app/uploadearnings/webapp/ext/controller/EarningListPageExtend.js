sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/library","sap/m/MessageBox"
], function(MessageToast,coreLibrary,MessageBox) {
    'use strict';    
    let extensionAPI;
    async function _updateStatus(oContext, sStatus){
        const oModel = oContext.getModel();
        const sPath  = oContext.getPath();
        try{
            await oModel.update(sPath, {status: sStatus});
            MessageToast.show("Status updated to" + sStatus);
        } catch(err){
            console.error("update failed",err);
            MessageToast.show("Failed to update status")
        }
    }
    return {           
        onInit: function(){
            ///    extensionAPI = this.extensionAPI;
            const oModel = this.getView().getModel("visibility");

            if (oModel){
              oModel.oBindContext("/VisibilityConfig").requestObject().then((data) => {
                console.log("visibility Config", data);

              }).catch(err =>{
                console.log("Failed", err);

              })
            }else{
              console.warn("visibiliy model not found");
            }

                 
        },

        onBeforeDelete: function(oContext) {
          const status = oContext.getObject().status;
    
          if (status === "Approved") {
            MessageBox.error("You cannot delete a Approved file.");
            return Promise.reject("Deletion not allowed for Approved files");
          }
    
          // Allow deletion
          return Promise.resolve();
        },

        onApprove:async function( oBindingContext, aSelectedContexts) {
          const status = aSelectedContexts.map(ctx=> ctx.getProperty("status"));
          console.log("current status" + status);
          
          if (status.includes("Approved")) {
            MessageBox.error("You cannot approve  an already Approved file.");
            return Promise.reject("Approval not allowed for already  Approved files");
          }
            
              if(!aSelectedContexts || aSelectedContexts.length === 0) {
                 MessageToast.show("Please select at least one row")
              }
              let model = this.editFlow.getView().getModel();
              const aIDs = aSelectedContexts.map(ctx=> ctx.getProperty("ID"));
              try{
                let result = await this.editFlow.invokeAction(
                    "/approveFiles",{
                      skipParameterDialog: true,
                      model: model,
                      parameterValues: [{name: "ids", value: aIDs}],    
                      invocationGroupig: "Isolated"
                    }                 
                )
                model.refresh();
                MessageToast.show("Files approved Successfully");
              }catch(err){
                console.error("Approval Failed", err);
                MessageToast.show("Approval Failed");
              }
              await this.editFlow.refresh();
        },
        onReject: async function(oBindingContext, aSelectedContexts) {
            if(!aSelectedContexts || aSelectedContexts.length === 0) {
                MessageToast.show("Please select at least one row")
             }
             let model = this.editFlow.getView().getModel();
             const aIDs = aSelectedContexts.map(ctx=> ctx.getProperty("ID"));
             try{
               let result = await this.editFlow.invokeAction(
                   "/rejectFiles",{
                     skipParameterDialog: true,
                     model: model,
                     parameterValues: [{name: "ids", value: aIDs}],    
                     invocationGroupig: "Isolated"
                   }                
               )
               MessageToast.show("Files Rejected Successfully");
             }catch(err){
               console.error("Rejection Failed", err);
               MessageToast.show("Rejection Failed");
             }
        }
    };
});
