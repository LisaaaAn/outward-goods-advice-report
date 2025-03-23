sap.ui.define([
  "ui5/ogarpt/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
  "use strict";
  return BaseController.extend("ui5.ogarpt.controller.Main", {
    onBeforeRendering: function () {
      // 创建日期模型
      const today = new Date();
      const dateModel = new JSONModel({
        currentYear: today.getFullYear(),
        currentDate: today.getDate().toString().padStart(2, '0') + '.' + 
                    (today.getMonth() + 1).toString().padStart(2, '0') + '.' + 
                    today.getFullYear()
      });
      this.getView().setModel(dateModel, "dateModel");
      this.getView().setModel(new JSONModel({ currentStep: 1 }), "formState");

      // 打开空白表单页
      const oModel = this.getView().getModel();
      const oParameterContext = oModel.createEntry('/HEADSet', { properties: {
          "ZTYPE_MOVEMENT": ""
        }
      })
      this.getView().setBindingContext(oParameterContext);
    },
    onInit: function () {
      // const oModel = this.getView().getModel();
      // const oParameterContext = oModel.createEntry('/HEADSet', { properties: {
      //     "ZTYPE_MOVEMENT": ""
      //   }
      // })
      // this.getView().setBindingContext(oParameterContext);
      // const oModel = this.getView().getModel();
      // oModel.create("/HEADSet", {
      //     "DistrChan": "10",
      //     "Division": "00",
      //     "DlvType": "LO",
      //     "Salesorg": "1310",
      //     "ShipPoint": "1310",
      //     "ShipTo": "0001000155",
      //     "ZTYPE_MOVEMENT":"1234567",
      //     "ZGM3_CONTACT":"1234567",
      //     "ZGM3_TELEPHONE":"1234567",
      //     "NP_ASH2DLVTI": [{
      //             "RefItem": "000010"
      //             }],
      //     "NP_ASH2DATES": [{
      //             "Timetype": "WS GOODS ISSUE  LIKP"
      //         }
      //     ],
      //     "NP_ASH2RETURN":[{}]
    
      // }, {
      //   success: function (data) {
      //     console.log('HeaderData:', data);
      //     const oParameterContext = oModel.createEntry('/HEADSet', { properties: data })
      //     this.getView().setBindingContext(oParameterContext);
      //     // this.byId('_IDGenXMLView').byId('_IDGenSmartForm').bindElement("/HEADSet('1310')")
      //     // this.byId('_IDGenXMLView1').byId('_IDGenSmartForm1').bindElement("/HEADSet('1310')")
      //     // this.byId('_IDGenXMLView2').byId('_IDGenSmartForm2').bindElement("/HEADSet('1310')")
      //     // const oModel = this.getView().getModel();
      //     // const oTable = this.byId('_IDGenXMLView2').byId('EditableTable');
      //     let itemsData = { results: [] }
      //     if (data?.NP_ASH2DLVTI?.results && data?.NP_ASH2DLVTI?.results.length) {
      //       itemsData = data.NP_ASH2DLVTI;
      //     }
      //     console.log('ItemsData:', itemsData);
      //     this.getView().setModel(new JSONModel(itemsData), 'items');
      //     // oModel.metadataLoaded().then(() => {
      //     //   // const oContext = this.byId('_IDGenXMLView').byId('_IDGenSmartForm').getBindingContext();
      //     //   oTable.bindItems({
      //     //     path: '{items>/results}',
      //     //     template: oTable.getAggregation("items")
      //     //   });
      //     // });
      //   }.bind(this),
      //   error: function (oError) {
      //     console.error("Request failed", oError);
      //   }
      // });
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