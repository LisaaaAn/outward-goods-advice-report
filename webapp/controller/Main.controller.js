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
        success: function (data) {
          console.log('HeaderData:', data);
          // const oParameterContext = oModel.createEntry('/ZQUERYLIKPSet', { properties: data })
          // this.getView().setBindingContext(oParameterContext);
          this.byId('_IDGenXMLView').byId('_IDGenSmartForm').bindElement("/ZQUERYLIKPSet('1')")
          this.byId('_IDGenXMLView1').byId('_IDGenSmartForm1').bindElement("/ZQUERYLIKPSet('1')")
          this.byId('_IDGenXMLView2').byId('_IDGenSmartForm2').bindElement("/ZQUERYLIKPSet('1')")
          // const oModel = this.getView().getModel();
          // const oTable = this.byId('_IDGenXMLView2').byId('EditableTable');
          let itemsData = { results: [] }
          if (data?.NP_ASQUERYH2I?.results && data?.NP_ASQUERYH2I?.results.length) {
            itemsData = data.NP_ASQUERYH2I;
          }
          console.log('ItemsData:', itemsData);
          this.getView().setModel(new JSONModel(itemsData), 'items');
          // oModel.metadataLoaded().then(() => {
          //   // const oContext = this.byId('_IDGenXMLView').byId('_IDGenSmartForm').getBindingContext();
          //   oTable.bindItems({
          //     path: '{items>/results}',
          //     template: oTable.getAggregation("items")
          //   });
          // });
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