sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/Component"  
], function (Controller, MessageToast,Component) {
  "use strict";

  return Controller.extend("peeranalysisv2.controller.ReportsView", {
    onInit: function () {

 
    },
    onAfterRendering: function () {
      const oIframe = this.byId("reports")?.getDomRef();
      if (!oIframe) { return; }
    
      // 1. build URL first
      const sUrl = this._isFLP() ? this._getFLPUrl() : this._getStandaloneUrl();
    
      // 2. attach handler *before* setting src
      const fnInjectCss = () => {
        try {
          const oDoc = oIframe.contentDocument || oIframe.contentWindow.document;
          const oStyle = oDoc.createElement("style");
          oStyle.textContent = `
            #shell-header, #shell-header-hdr, #header-shellArea { display:none!important; }
            #shellLayout { padding-top:0!important; }
          `;
          oDoc.head.appendChild(oStyle);
        } catch (e) {
          console.error("Failed to inject style into iframe", e);
        }
      };
      oIframe.removeEventListener("load", fnInjectCss);
      oIframe.addEventListener("load", fnInjectCss);
    
      // 3. finally trigger navigation
      oIframe.src = sUrl;
    },
    
    _isFLP: () => !!sap.ushell?.Container,
    
    _getStandaloneUrl: function () {
      const baseUrl = window.location.href.split("#")[0];
      return baseUrl.replace(/(\/[^\/]+\.earningupload\.)[^.]+(-[\d.]+\/index\.html)/,
                             "$1comscbuploadearningsv2$2");
    },
    _getFLPUrl:function() {
    const href = window.location.href;
  
    const url = new URL(href);
    const siteId = url.searchParams.get("siteId");
    const sapAppId = url.searchParams.get("sap-ui-app-id");
    const appHint = "sap-ui-app-id-hint=saas_approuter_" + sapAppId;
  
    // Example: mapping app id to hash (like #Banks-update)
    const hashMapping = {
      peeranalysis: "Banks-update",
      uploadearnings: "Earnings-upload",
      // Add other mappings as needed
    };    
    const semanticHash = hashMapping[sapAppId] || "home";    
    const formattedUrl = `${url.origin}/site?siteId=${siteId}`;
    const completeurl = formattedUrl+"#EarningsV2-upload?sap-ui-app-id-hint=saas_approuter_" + sapAppId;
    return completeurl;
  }   
  });
});

