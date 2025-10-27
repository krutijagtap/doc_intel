sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "../lib/jspdf/jspdf.umd.min",
    "../lib/dompurify/purify.min",
    "../lib/html2canvas/html2canvas.min"
], (Controller,MessageBox) => {
    "use strict";

    return Controller.extend("peeranalysisv2.controller.PeerAnaysisView", {
      onInit() {
        let oView = this.getView();
        oView.setBusy(true); // Show busy indicator
        this.onfetchRoles().then((resp) => {
          oView.setBusy(false); // Hide busy indicator
          this.fetchFileStatus();
        });
        const chatModel = this.getOwnerComponent().getModel("chatModel");
        chatModel.setProperty("/downloadTemplateLink", this.getBaseURL() + "/static/PromptTemplate.xlsx");
      },
      onAfterRendering: function () {
        let me = this;
        me.attachEventchatFeedInput(me);
      },
      userlivechange: function (oEvent) {
        const userinp = oEvent.getParameter("value");
        const chatModel = this.getOwnerComponent().getModel("chatModel");
        if (!userinp || userinp == "/n") {
          chatModel.setSubmit(false);
        } else {
          chatModel.setSubmit(true);
        }
      },
      /**
       * Attach Enter Event for chatFeedInput
       * @param {object} controller this
       */
      attachEventchatFeedInput: function (controller) {
        let chatFeedInput = controller.getView().byId("chatFeedInput");
        let chatFeedSubmit = controller.getView().byId("chatFeedSubmit");
        chatFeedInput.attachBrowserEvent("keypress", function (event) {
          if (event.keyCode === 13 && chatFeedInput.getValue().trim() !== "") {
            chatFeedSubmit.firePress();
            chatFeedInput.setValue(null);
            event.preventDefault();
          }
        });
      },
      /**
       * Event handler for the chat entered by user
       * Calls the ai and return aresponse
       * @param {object} oEvent object
       */
      onUserChat: async function () {
        const chatModel = this.getOwnerComponent().getModel("chatModel");
        const oView = this.getView();
        const sInput = this.byId("chatFeedInput").getValue();
        if (sInput.trim() === "") {
          sap.m.MessageBox.error("Please Enter a prompt for AskFinsight!");
          return;
        }
        // Disable submit + hide previous result
        chatModel.setSubmit(false);
        chatModel.setvisibleResult(false);

        // Create and show busy dialog
        const oBusyDialog = new sap.m.BusyDialog({
          title: "Busy Indicator",
          text: "Generating response. Please standby..",
        });
        oBusyDialog.open();

        // Freeze the screen
        oView.setBusy(true);

        // 🔁 Yield back to rendering thread before blocking async call
        await Promise.resolve();

        try {
          const resp = await this.onfetchData(sInput);

          chatModel.setResult(resp);
          chatModel.setvisibleResult(true);
          console.log(resp);
        } catch (err) {
          console.error("Chat fetch error:", err);
          sap.m.MessageToast.show("Failed to get response.");
        } finally {
          oBusyDialog.close();
          oView.setBusy(false);
        }
      },

      /**
       * Copy the Agent Chat
       * @param {object} oEvent
       */
      onChatCopy: function (oEvent) {
        const sourceData = oEvent.getSource().data("source");
        const oChatBox =
          sourceData === "promptResult"
            ? this.byId("PromptResultBox")
            : this.byId("ChatBotResult");
        const domRef = oChatBox?.getDomRef();

        if (!domRef) {
          sap.m.MessageToast.show("Nothing to copy");
          return;
        }

        const message = domRef.innerText;

        if (navigator?.clipboard && message) {
          navigator.clipboard
            .writeText(message)
            .then(() => {
              sap.m.MessageToast.show("Text copied to clipboard");
            })
            .catch((err) => {
              console.error("Copy failed", err);
              sap.m.MessageToast.show("Failed to copy text.");
            });
        }
      },

      onfetchCSRF: async function (url) {
        const response = await fetch(url, {
          method: "HEAD",
          credentials: "include",
          headers: {
            "X-CSRF-Token": "Fetch",
          },
        });
        const token = response.headers.get("X-CSRF-Token");
        if (!token) {
          throw new Error("Failed to fetch CSRF token");
        }
        return token;
      },
      onfetchData: async function (sInput) {
        const chatUrl =
          this.getBaseURL() + "/v2/odata/v4/earning-upload-srv/chatResponse";
        const csrfUrl = this.getBaseURL() + "/v2/odata/v4/earning-upload-srv/";
        const csrf = await this.onfetchCSRF(csrfUrl);

        // const url = "https://EarningsAIAssistantUI5-noisy-numbat-gk.cfapps.ap11.hana.ondemand.com/api/chat";

        try {
          let response = await fetch(chatUrl, {
            method: "POST",
            headers: {
              "X-CSRF-Token": csrf,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: sInput, token: csrf }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          const sResponse = data.d.chatResponse.result; // ✅ Store API response in a variable
          console.log("API Response:", sResponse);
          return sResponse;

          // Optional: Store result in SAPUI5 JSONModel
          // var oModel = new sap.ui.model.json.JSONModel({ apiResult: sResponse });
          // sap.ui.getCore().setModel(oModel, "chatModel");
        } catch (error) {
          console.error("API Error:", error);
        }
      },

      onfetchRoles: async function (params) {
        const chatModel = this.getOwnerComponent().getModel("chatModel");
        const url = this.getBaseURL() + "/user-api/currentUser";
        const oPromise = new Promise(async (resolve, reject) => {
          try {
            const response = await fetch(url, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const roles = data.scopes;
            const hasScopeForView = roles.some((role) =>
              role.includes("scopeforview")
            );
            const hasScopeForManage = roles.some((role) =>
              role.includes("scopeformanage")
            );
            // chatModel.setenablUpload(hasScopeForManage);
            // chatModel.setenableQuery(hasScopeForView);
            chatModel.setProperty("/enableUpload", hasScopeForManage);
            chatModel.setProperty("/enableQuery", hasScopeForView);
            chatModel.setProperty("/userId", data.name);
            const sResponse = data.result; // ✅ Store API response in a variable
            resolve(sResponse);
          } catch (error) {
            console.error("API Error:", error);
            reject(error);
          }
        });
        return oPromise;
      },

      getBaseURL: function () {
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath);
        return appModulePath;
      },

      /**
       * Regenerate the Agent Chat
       * @param {object} oEvent
       * @param {object} controller
       */
      onChatRegenerate: function (oEvent) {
        const chatModel = this.getOwnerComponent().getModel("chatModel");
        const oSource = oEvent?.getSource();
        const userMessage = oSource?.data("userMessage");
        if (userMessage) {
          // triggerChat(this, sInput);
          chatModel.addUserChat(userMessage);
          const sResponse =
            '<html>\n<body>\n<h2>Top 5 Earning Items Summary</h2>\n\n<table border="1">\n  <tr>\n    <th>Item</th>\n    <th>Revenue (million)</th>\n    <th>Profit before tax (million)</th>\n    <th>Total assets (million)</th>\n  </tr>\n  <tr>\n    <td><strong>1. Total Corporate & Investment Banking</strong></td>\n    <td>$196,823</td>\n    <td>$118,106</td>\n    <td>$363,909</td>\n  </tr>\n  <tr>\n    <td><strong>2. Total Group</strong></td>\n    <td>$420,117</td>\n    <td>$193,115</td>\n    <td>$581,841</td>\n  </tr>\n  <tr>\n    <td><strong>3. Oil & Gas industry</strong></td>\n    <td>$7,421</td>\n    <td>$7,928</td>\n    <td>$21,440</td>\n  </tr>\n  <tr>\n    <td><strong>4. Commercial Real Estate</strong></td>\n    <td>$7,635</td>\n    <td>$2,758</td>\n    <td>$7,677</td>\n  </tr>\n  <tr>\n    <td><strong>5. Power industry</strong></td>\n    <td>$6,341</td>\n    <td>$4,538</td>\n    <td>$10,503</td>\n  </tr>\n</table>\n\n<h3>Key Points:</h3>\n<ul>\n<li>Corporate & Investment Banking and Total Group are the top earners by a significant margin</li>\n<li>Among industries, Oil & Gas, Commercial Real Estate, and Power are the highest earning sectors</li>\n<li>Data is sourced exclusively from non-transcript contexts as required</li>\n<li>Confidence is high for the reported figures, as they come directly from financial tables</li>\n<li>Some contextual information (e.g. year, specific segment breakdowns) is limited in the available non-transcript data</li>\n</ul>\n</body>\n</html>';
          chatModel.setResult(sResponse);
        }
      },

      /**
       * Export chat to pdf
       * @param {object} oEvent
       * @param {object} controller
       */
      // onChatExport: async function (oEvent) {
      //   const chatModel = this.getOwnerComponent().getModel("chatModel");
      //   const message = chatModel.getProperty("/result");
      //   if (message) {
      //     // Create PDF document
      //     var doc = new jspdf.jsPDF({
      //       orientation: "portrait",
      //       unit: "pt",
      //       format: "a4",
      //     });

      //     // Sanitize the HTML using DOMPurify
      //     var sanitizedHTML = DOMPurify.sanitize(message);
      //     await doc.html(sanitizedHTML, {
      //       width: 580,
      //       windowWidth: 580,
      //       margin: 15,
      //     });
      //     await doc.save();
      //   }
      // },

      // export V2

      // onChatExport: async function () {
      //   const oChatBox = this.byId("ChatBotResult");
      //   const domRef = oChatBox?.getDomRef();

      //   if (!domRef) {
      //     sap.m.MessageToast.show("No content to export");
      //     return;
      //   }

      //   const { jsPDF } = window.jspdf;
      //   domRef.classList.add("exporting");

      //   try {
      //     const canvas = await html2canvas(domRef, {
      //       scale: 2,
      //       useCORS: true,
      //       scrollY: 0,
      //       windowWidth: domRef.scrollWidth
      //     });

      //     const imgData = canvas.toDataURL("image/png");

      //     const pdf = new jsPDF("p", "pt", "a4");
      //     const pdfWidth = pdf.internal.pageSize.getWidth();
      //     const pdfHeight = pdf.internal.pageSize.getHeight();

      //     const canvasWidth = canvas.width;
      //     const canvasHeight = canvas.height;

      //     const imgHeight = (pdfWidth * canvasHeight) / canvasWidth;

      //     let heightLeft = imgHeight;
      //     let position = 0;

      //     // First page
      //     pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      //     heightLeft -= pdfHeight;

      //     // More pages if needed
      //     while (heightLeft > 0) {
      //       position = heightLeft - imgHeight;
      //       pdf.addPage();
      //       pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      //       heightLeft -= pdfHeight;
      //     }

      //     pdf.save("summary.pdf");
      //     sap.m.MessageToast.show("PDF exported successfully");

      //   } catch (err) {
      //     console.error("PDF generation failed", err);
      //     sap.m.MessageToast.show("Failed to export PDF");
      //   } finally {
      //     domRef.classList.remove("exporting");
      //   }
      // },

      onChatExport: async function (oEvent) {
        const sourceData = oEvent.getSource().data("source");
        if (!window.jspdf || !window.html2canvas) {
          sap.m.MessageToast.show("Required libraries not loaded.");
          return;
        }

        const { jsPDF } = window.jspdf;
        const userInput =
          this.getView().getModel("chatModel").getProperty("/userMessage") ||
          "";

        const domRef = this.byId(
          sourceData === "promptResult" ? "PromptResultBox" : "ChatBotResult"
        )?.getDomRef();
        if (!domRef) {
          sap.m.MessageToast.show("No content to export");
          return;
        }

        // --- Create hidden container ---
        const wrapper = document.createElement("div");
        wrapper.style.width = "794px"; // A4 width in px at 96 DPI
        wrapper.style.padding = "20px";
        wrapper.style.background = "#fff";
        wrapper.style.fontFamily = "Arial, sans-serif";
        wrapper.style.position = "absolute";
        wrapper.style.top = "0";
        wrapper.style.left = "-9999px";
        document.body.appendChild(wrapper);

        // --- User Input Section ---
        if (sourceData !== "promptResult" && userInput) {
          const userInputBox = document.createElement("div");
          userInputBox.style.background =
            "linear-gradient(to right, #e8f0ff, #f2f6fd)";
          userInputBox.style.padding = "16px 24px";
          userInputBox.style.borderRadius = "8px";
          userInputBox.style.marginBottom = "24px";
          userInputBox.style.border = "1px solid #cdddfb";

          const headerText = document.createElement("div");
          headerText.textContent = "USER INPUT";
          headerText.style.fontSize = "18px";
          headerText.style.fontWeight = "bold";
          headerText.style.color = "#1a73e8";
          headerText.style.marginBottom = "8px";

          const userInputText = document.createElement("div");
          userInputText.textContent = userInput;
          userInputText.style.fontSize = "14px";
          userInputText.style.color = "#333";

          userInputBox.appendChild(headerText);
          userInputBox.appendChild(userInputText);
          wrapper.appendChild(userInputBox);
        }

        // --- Clone Chat Response ---
        const responseClone = domRef.cloneNode(true);
        responseClone.style.margin = "0"; // prevent extra spacing
        wrapper.appendChild(responseClone);

        // --- Wait for DOM to layout ---
        await new Promise((resolve) => requestAnimationFrame(resolve));

        try {
          const canvas = await html2canvas(wrapper, {
            scale: 2,
            useCORS: true,
            scrollY: 0,
            windowWidth: wrapper.scrollWidth,
            height: wrapper.scrollHeight,
          });

          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "pt", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
            position -= pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
          }

          pdf.save("Finsight_Chat_Export.pdf");
          sap.m.MessageToast.show("PDF exported successfully");
        } catch (err) {
          console.error("PDF export failed", err);
          sap.m.MessageToast.show("Failed to export PDF");
        } finally {
          document.body.removeChild(wrapper);
        }
      },

      onGenEmbeddings: async function () {
        const chatModel = this.getOwnerComponent().getModel("chatModel");
        const url =
          "https://EarningsAIAssistantUI5-noisy-numbat-gk.cfapps.ap11.hana.ondemand.com/api/generate-embeddings";
        chatModel.setbusyText("Creating embeddings, please wait");
        chatModel.setbusyIndicator(true);

        try {
          const response = await fetch(url, {
            method: "POST",
          });

          if (!response.ok) {
            chatModel.setbusyIndicator(false);
            sap.m.MessageToast.show(response.status);
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          const sResponse = data.message; // ✅ Store API response in a variable
          if (sResponse) {
            chatModel.setbusyIndicator(false);
            sap.m.MessageToast.show(data.message);
            return;
          }
          return sResponse;
        } catch (error) {
          chatModel.setbusyIndicator(false);
          console.error("API Error:", error);
        }
      },

      onUploadFileContent: async function (oFile) {
        const chatModel = this.getOwnerComponent().getModel("chatModel");
        chatModel.setProperty("/busyIndicator", true);
        // const url = this.getBaseURL() + "/v2/odata/v4/earning-upload-srv/uploadPromptFile";
        const url = this.getBaseURL() + "/api/chat_upload";
        const csrfUrl = this.getBaseURL() + "/v2/odata/v4/earning-upload-srv/";
        const csrf = await this.onfetchCSRF(csrfUrl);
        let formData = new FormData();
        formData.append("file", oFile);
        formData.append("userId", chatModel.getProperty("/userId"));
        try {
          const response = await fetch(url, {
            headers: {
              "X-CSRF-Token": csrf,
            },
            method: "POST",
            body: formData,
          });

          // if (!response.ok) {
          //   sap.m.MessageToast.show(response.status);
          //   throw new Error(`HTTP error! Status: ${response.status}`);
          // }
          // {
          //   "download_url": "http://localhost:8080/api/job/c9f8d235091c/download",
          //   "estimated_processing_time": "2 minute(s)",
          //   "job_id": "c9f8d235091c",
          //   "message": "File 'Peer Analysis-mod.xlsx' uploaded successfully and queued for processing.",
          //   "prompts_found": 3,
          //   "status_url": "http://localhost:8080/api/job/c9f8d235091c",
          //   "userId": "8221550"
          // }

          const data = await response.json();
          chatModel.setProperty("/busyIndicator", false);
          if (data.error) {
            MessageBox.error(data.error);
            return;
          }
          //show dialog
          const dialogContent = new sap.m.VBox({
            items: [
              new sap.m.Text({ text: data.message }),
              new sap.m.Text({ text: "Prompts found: " + data.prompts_found }),
              new sap.m.Text({
                text:
                  "Estimated processing time: " +
                  data.estimated_processing_time,
              }),
            ],
            width: "100%",
          });
          dialogContent.addStyleClass("sapUiSmallMargin");
          new sap.m.Dialog({
            title: "File Upload Status",
            content: [dialogContent],
            beginButton: new sap.m.Button({
              text: "OK",
              press: function () {
                this.getParent().close();
              },
            }),
          }).open();
          this.fetchFileStatus();

          // Optional: Store result in SAPUI5 JSONModel
          // var oModel = new sap.ui.model.json.JSONModel({ apiResult: sResponse });
          // sap.ui.getCore().setModel(oModel, "chatModel");
        } catch (error) {
          console.error("API Error:", error);
        }
      },
      fetchFileStatus: async function () {
        const chatModel = this.getOwnerComponent().getModel("chatModel");
        const url =
          this.getBaseURL() +`/api/job/status_by_userid?userId=${chatModel.getProperty("/userId")}`;
          // this.getBaseURL() + `/api/job/status_by_userid?userId=8226807`;
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `HTTP error! Status: ${response.status}`
            );
          }
          const data = await response.json();
          chatModel.setProperty("/fileStatus", data.jobs);
          if (data.jobs.length > 0) {
            chatModel.setProperty("/fileStatusVisible", true);
          }
        } catch (error) {
          //log error josn message from backend
        }
      },
      onPromptFileUpload: async function (oEvent) {
        const oFile = oEvent.getParameters("files").files[0];
        const chatModel = this.getOwnerComponent().getModel("chatModel");
        if (oFile) {
          chatModel.setProperty("/enableSubmit", true);
          this._uploadingFile = oFile;
        } else {
          chatModel.setProperty("/enableSubmit", false);
          this._uploadingFile = null;
        }
      },
      onGenerateReport: async function () {
        if (!this._uploadingFile) {
          sap.m.MessageBox.error(
            "Please upload a prompt template file before generating report."
          );
          return;
        }
        this.onUploadFileContent(this._uploadingFile);
        this.getView().byId("promptFileUploader").clear();
        this._uploadingFile = null;
        this.getView()
          .getModel("chatModel")
          .setProperty("/enableSubmit", false);
      },
      onViewReport: async function (oEvent) {
        const sJobId = oEvent
          .getSource()
          .getBindingContext("chatModel")
          .getProperty("job_id");
        this._currentJobId = sJobId;
        const reportUrl =
          this.getBaseURL() + `/api/job/${sJobId}/download?inline=1`;
        const chatModel = this.getOwnerComponent().getModel("chatModel");
        const oView = this.getView();
        oView.setBusy(true);
        const reportContent = await fetch(reportUrl, {
          method: "GET",
          headers: { "Content-Type": "text/html" },
        });
        oView.setBusy(false);
        if (!reportContent.ok) {
          sap.m.MessageBox.error("Failed to fetch report content.");
          return false;
        }
        const sResponse = reportContent.body
          ? await reportContent.text()
          : "No content available";
        chatModel.setProperty("/promptResult", sResponse);
        chatModel.setProperty("/visiblePromptResult", true);
        return sResponse;
      },
      onDownloadReport: function (oEvent) {
        const sJobId = oEvent
          .getSource()
          .getBindingContext("chatModel")
          .getProperty("job_id");
        this._currentJobId = sJobId;
        this.getView().byId("downloadPromptResultBtn").firePress();
      },
      onDownloadPromptResult: function(){
        const docUrl =`${this.getBaseURL()}/api/job/${this._currentJobId}/download?format=docx`;
        window.open(docUrl);
      },
      onDownloadMetadata: async function () {
        sap.m.MessageToast.show(
          "For any change in Standard Account line mappings please reach out to Group FP&A"
        );
        const baseUrl = this.getBaseURL();
        const downloadUrl = baseUrl + "/ci_api/odata/v4/catalog/downloadMetadata";
        const csrf = await this.onfetchCSRF(baseUrl);
        const responseAPI = await fetch(downloadUrl, {
          method: "POST",
          headers: {
            "X-CSRF-Token": csrf,
            "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-type": "application/json"
          },
          body:"{}"
        });
        if (!responseAPI.ok) {
          let res;
          try {
            res = await responseAPI.json();
            sap.m.MessageToast.show(res.message);
          } catch (e) {
            sap.m.MessageToast.show("Download failed.");
          }
          return;
        }
        
        const blob = await responseAPI.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'metadata.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      formatProcessingStatusIcon: function (sStatus) {
        switch (sStatus) {
          case "queued":
            return "sap-icon://synchronize";
          case "completed":
            return "sap-icon://sys-enter-2";
          case "failed":
            return "sap-icon://error";
          default:
            return "sap-icon://question-mark";
        }
      },
      formatDateTime: function (dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date)) return dateString; // fallback if invalid date

        const pad = (n) => (n < 10 ? "0" + n : n);
        const MM = pad(date.getMonth() + 1);
        const DD = pad(date.getDate());
        const YYYY = date.getFullYear();
        const HH = pad(date.getHours());
        const mm = pad(date.getMinutes());
        const ss = pad(date.getSeconds());

        return `${MM}/${DD}/${YYYY} ${HH}:${mm}:${ss}`;
      },
    });
});