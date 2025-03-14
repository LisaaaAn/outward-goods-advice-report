sap.ui.define([
  "ui5/ogarpt/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
  "use strict";
  return BaseController.extend("ui5.ogarpt.controller.Main", {
    onBeforeRendering: function () {
      this.getView().setModel(new JSONModel({ currentStep: 1 }), "formState");
    },
    onAfterRendering: function () {
      const oModel = this.getView().getModel();
      oModel.create("/ZQUERYLIKPSet", {
        "Vbeln": "1",
        "NP_ASQUERYH2I": [
          {
            "Posnr": "22"
          }
        ]
      }, {
        success: function (res) {
          const data = res?.NP_ASQUERYH2I?.results[0];
          const oParameterContext = oModel.createEntry('/ZQUERYLIKPSet', { properties: data })
          this.getView().setBindingContext(oParameterContext);
        }.bind(this),
        error: function (oError) {
          console.error("Request failed", oError);
        }
      });
    },
    onDisplayNotFound: function () {
      this.getRouter().getTargets().display("notFound", { fromTarget: "main" });
    },
    handleNavigate: function (evt) {
      const navCon = this.byId("navCon");
      const target = evt.getSource().data("target");
      const oModel = this.getView().getModel("formState");
      const step = oModel.getProperty("/currentStep");
      if (target) {
        if (target === 'p2') {
          this.byId('_IDGenXMLView').byId('_IDGenSmartForm').check().then((list) => {
            if (list.length === 0) {
              oModel.setProperty("/currentStep", 2);
              navCon.to(this.byId(target), 'slide');
            }
          });
        } else if (target === 'p3') {
          this.byId('_IDGenXMLView1').byId('_IDGenSmartForm1').check().then((list) => {
            if (list.length === 0) {
              oModel.setProperty("/currentStep", 3);
              navCon.to(this.byId(target), 'slide');
            }
          });
        }
      } else {
        if (step) {
          oModel.setProperty("/currentStep", step - 1);
        }
        navCon.back();
      }
    },
    handleSubmit: function () {
      this.byId('_IDGenXMLView2').byId('_IDGenSmartForm2').check().then((list) => {
        if (list.length === 0) {
          const submitData = this.getView().getBindingContext().getObject();
          console.log('Form Data: ' + JSON.stringify(submitData));
          MessageToast.show('Save Successfully!');
        }
      });
    }
  });
});