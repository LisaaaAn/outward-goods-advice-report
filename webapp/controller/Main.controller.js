sap.ui.define([
  "ui5/ogarpt/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/ui/model/odata/v2/ODataModel"
], function (BaseController, JSONModel, MessageBox, ODataModel) {
  "use strict";

  var submitData = {
    ZTYPE_MOVEMENT: 'Auction item',
    Plant: "",
    VendorNumber: "",
    VendorName: "",
    ZFREIGHT_CHARGED_TO: "",
    ZFREIGHT_METHOD: "",
    PurchasingDoc: "",
    PoItem: "",
    MaterialDoc: "",
    MaterialItem: "",
    ZSTORED_ENERGY: "N",
    ZDANGEROUS_GOODS: "N",
    radianceClearance: "N",
    year: new Date().getFullYear(),
    Date: new Date().toLocaleDateString('de-DE'),
    VendorAddress1: "",
    VendorAddress2: "",
    VendorAddress3: "",
    ZGM3_CONTACT: "",
    ZGM3_TELEPHONE: "",
    ZGM3_FAX: "",
    ZGM3_EMAIL: "",
    ZCARRIER_NAME: "",
    plantAddress1: "",
    plantAddress2: "",
    plantAddress3: "",
    plantAddress4: "",
    ZVENDOR_CONTACT: "",
    ZVENDOR_TELEPHONE: "",
    ZVENDOR_FAX: "",
    ZVENDOR_EMAIL: "",
    ZCARRIER_CONSIGN: "",
    ZCARRIER_CONSIGN: "",
    CustomsLetterAttached:"N",
    MSDS_Attached:"N",
    ZTHIRD_PARTY: "",
    ZVENDOR_RETREF: "",
    ZSENDER_NAME: "",
    ZWEIGHT: "",
    ZMSDS_ATTACHED: "",
    ZCARRIER_NAME: "",
    // 表格数据
    NP_ASH2DLVTI: [],
    // 日期数据
    NP_ASH2DATES: [{
      Timetype: "WS GOODS ISSUE  LIKP",
      TimestampUtc: Math.floor(new Date().getTime() / 1000)
    }],
    // 退货数据
    NP_ASH2RETURN: [{}]
  };
  return BaseController.extend("ui5.ogarpt.controller.Main", {
    onInit: function () {
      this.getView().setModel(new sap.ui.model.json.JSONModel(submitData), "submitData");
      // 初始化 OData 模型
      const oPlantModel = new ODataModel("/sap/opu/odata/sap/ZIM_OGA_SRV/");
      // this.getView().setModel(oPlantModel, "plantModel");
      const that = this;

      // 测试获取工厂数据
      oPlantModel.read("/PLANTSet", {
        success: function (oData) {
          that.getView().setModel(new sap.ui.model.json.JSONModel(oData), "plantModel");
        },
        error: function (oError) {
          sap.m.MessageToast.show("Failed to get Plant Data:" + oError.message);
        }
      });
      //获取供应商数据
      oPlantModel.read("/VENDORSet", {
        success: function (oData) {
          that.getView().setModel(new sap.ui.model.json.JSONModel(oData), "VendorModel");
        },
        error: function (oError) {
          sap.m.MessageToast.show("Failed to get Vendor Data:" + oError.message);
        }
      });

      // 获取物料数据
      oPlantModel.read("/MATNRSet", {
        success: function (oData) {
          const aResultList = that._groupList(oData?.results, 'Matnr');
          that.getView().setModel(new sap.ui.model.json.JSONModel({ results: aResultList }), "MaterialModel");
        },
        error: function (oError) {
          sap.m.MessageToast.show("Failed to get Material Data:" + oError.message);
        }
      });

      // 获取 PO 数据
      oPlantModel.read("/PurNoDocSet", {
        success: function (oData) {
          // const oGroupedData = (oData?.results || []).reduce((acc, item) => {
          //   const key = item.Ebeln;
          //   if (!acc[key]) acc[key] = [];
          //   acc[key].push(item);
          //   return acc;
          // }, {});
          // const aResultList = Object.entries(oGroupedData).map(([Ebeln, items]) => ({ Ebeln, items }));
          const aResultList = that._groupList(oData?.results, 'Ebeln');
          that.getView().setModel(new sap.ui.model.json.JSONModel({ results: aResultList }), "PurchaseModel");
        },
        error: function (oError) {
          sap.m.MessageToast.show("Failed to get PO Data:" + oError.message);
        }
      });
    },

    onBeforeRendering: function () {
      // 创建日期模型
      // https://vhicwds4ci.sap.gm3global.com:44300/sap/opu/odata/sap/ZIM_OGA_SRV?saml2=disabled
      // https://vhicwws1wd01.sap.gm3global.com:44380/sap/bc/ui2/flp?sap-client=110&sap-language=EN&saml2=disabled
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
      const oParameterContext = oModel.createEntry('/HEADSet', {
        properties: {
          "ZTYPE_MOVEMENT": "Auction item"
        }
      })
      this.getView().setBindingContext(oParameterContext);
    },
    handleNavigate: function (evt) {
      const navCon = this.byId("navCon");
      const target = evt.getSource().data("target");
      const oModel = this.getView().getModel("formState");
      const step = oModel.getProperty("/currentStep");
      if (target) {   
        if (target === 'p2') {
          // 获取表单中的所有必填字段
          const form = this.byId('_IDGenXMLView').byId('_IDGenForm');
          const requiredFields = form.getFormContainers()[0].getFormElements().filter(element => {
            const field = element.getFields()[0];
            return field && field.getRequired && field.getRequired();
          });
          const requiredFields2 = form.getFormContainers()[1].getFormElements().filter(element => {
            const field = element.getFields()[0];
            return field && field.getRequired && field.getRequired();
          });
          // 检查必填字段是否都已填写，并收集未填写的字段
          const emptyFields = [...requiredFields, ...requiredFields2].filter(element => {
            const field = element.getFields()[0];
            return field && field.getValue && !field.getValue();
          }).map(element => element.getLabel());
          
          if (emptyFields.length === 0) {
            oModel.setProperty("/currentStep", 2);
            navCon.to(this.byId(target), 'slide');
          } else {
            sap.m.MessageToast.show("Not Filled:  " + emptyFields.join("、"));
          }
        }
      } else {
        if (step) {
          oModel.setProperty("/currentStep", step - 1);
        }
        navCon.back();
      }
    },
    handleSubmit: function () {
      // const oModel = this.getView().getModel();
      // const oSubmitModel = this.getView().getModel("submitData");
      // const submitData = oSubmitModel.getData();

      // // 构建提交数据
      // const oData = {
      //   "DistrChan": "00",
      //   "Division": "00",
      //   "DlvType": "ZLO",
      //   "Salesorg": " ",
      //   "ShipPoint": "AU99",
      //   "ShipTo": submitData.VendorNumber,

      //   "ZTYPE_MOVEMENT": submitData.ZTYPE_MOVEMENT || "1234567",
      //   "ZGM3_CONTACT": submitData.ZGM3_CONTACT || "1234567",
      //   "ZGM3_TELEPHONE": submitData.ZGM3_TELEPHONE || "1234567",
      //   "NP_ASH2DLVTI": submitData.NP_ASH2DLVTI.map(item => ({
      //     "RefItem": item.Vbeln || "",
      //     "DlvQty": item.Quantity || "",
      //     // "ZDOC_NO": item.PurchaseOrderNo || "",
      //     // "ZDOC_ITEM": item.POItemNo || "",
      //     "Material": item.MaterialNo || "",
      //     // "Weight": item.Weight || "",
      //     // "MaterialDesc": item.MaterialDesc || "",
      //     // "AAC": item.AAC || "",
      //     // "AccountAssign": item.AccountAssign || "",
      //     "SalesUnit": item.Unit1 || "",
      //     // "Unit2": item.Unit2 || "",
      //     "Plant": submitData.Plant || ""
      //   })),
      //   "NP_ASH2DATES": [{
      //     "Timetype": "WS GOODS ISSUE  LIKP",
      //     "Timezone": "UTC+8",
      //     "TimestampUtc": new Date()
      //   }],
      //   "NP_ASH2RETURN": [{}]
      // };

      // console.log('提交数据:', JSON.stringify(oData, null, 2));
      // const that = this;
      // oModel.create("/HEADSet", oData, {
      //   success: function (data) {
      //     console.log('提交成功:', data);
      //     if (data.Delivery) {
      //       MessageBox.success(`Save successfully! \n Document No: ${data.Delivery}`, {
      //         actions: MessageBox.Action.OK,
      //         onClose: function (action) {
      //           if (action === MessageBox.Action.OK) {
      //             console.log('OK');
      //             // 重置表单数据
      //             oSubmitModel.setData({
      //               ZTYPE_MOVEMENT: '',
      //               Plant: "",
      //               VendorNumber: "",
      //               VendorName: "",
      //               ZFREIGHT_CHARGED_TO: "",
      //               ZFREIGHT_METHOD: "",
      //               PurchasingDoc: "",
      //               PoItem: "",
      //               MaterialDoc: "",
      //               MaterialItem: "",
      //               ZSTORED_ENERGY: "N",
      //               ZDANGEROUS_GOODS: "N",
      //               radianceClearance: "N",
      //               year: new Date().getFullYear(),
      //               Date: new Date().toLocaleDateString('de-DE'),
      //               VendorAddress1: "",
      //               VendorAddress2: "",
      //               VendorAddress3: "",
      //               VendorAddress4: "",
      //               ZGM3_CONTACT: "",
      //               ZGM3_TELEPHONE: "",
      //               ZGM3_FAX: "",
      //               ZGM3_EMAIL: "",
      //               ZCARRIER_NAME: "",
      //               plantAddress1: "",
      //               plantAddress2: "",
      //               plantAddress3: "",
      //               plantAddress4: "",
      //               ZVENDOR_CONTACT: "",
      //               ZVENDOR_TELEPHONE: "",
      //               ZVENDOR_FAX: "",
      //               ZVENDOR_EMAIL: "",
      //               ZCARRIER_CONSIGN: "",
      //               NP_ASH2DLVTI: [],
      //               NP_ASH2DATES: [{
      //                 Timetype: "WS GOODS ISSUE  LIKP"
      //               }],
      //               NP_ASH2RETURN: [{}]
      //             });

      //             // 重置步骤到第一步
      //             const oFormStateModel = that.getView().getModel("formState");
      //             oFormStateModel.setProperty("/currentStep", 1);

      //             // 返回到第一个页面
      //             const navCon = that.byId("navCon");
      //             navCon.to(that.byId("p1"), "slide");
      //           }
      //         }
      //       });
      //     } else {
      //       let sMessage = '';
      //       (data.NP_ASH2RETURN?.results || []).forEach(oItem => {
      //         if (oItem.Message) {
      //           sMessage += '\n' + oItem.Message;
      //         }
      //       });
      //       MessageBox.error(sMessage, {
      //         actions: MessageBox.Action.OK,
      //         onClose: function (action) {
      //           if (action === MessageBox.Action.OK) {
      //             console.log('OK');
      //           }
      //         }
      // 获取所有表单的必填字段
      const formIds = ['headerForm', 'mainForm', 'otherDetailForm'];
      let allEmptyFields = [];
      
      // 验证表单字段
      formIds.forEach(sId => {
        const form = this.byId('_IDGenXMLView2').byId(sId);
        if (form) {
          // 检查表单类型
          if (form instanceof sap.ui.layout.form.Form) {
            // 处理标准表单
            const containers = form.getFormContainers();
            containers.forEach(container => {
              const requiredFields = container.getFormElements().filter(element => {
                const field = element.getFields()[0];
                return field && field.getRequired && field.getRequired();
              });
              
              const emptyFields = requiredFields.filter(element => {
                const field = element.getFields()[0];
                return field && field.getValue && !field.getValue();
              }).map(element => element.getLabel());
              
              allEmptyFields = [...allEmptyFields, ...emptyFields];
            });
          }
        }
      });

      // 验证表格数据
      const oSubmitModel = this.getView().getModel("submitData");
      const tableData = oSubmitModel.getProperty("/NP_ASH2DLVTI") || [];
      
      if (tableData.length === 0) {
        allEmptyFields.push("The table data cannot be left blank");
      } else {
        tableData.forEach((item, index) => {
          // 检查必填字段
          if (!item.ZDOCUMENT_NO) {
            allEmptyFields.push(`Line${index + 1}: Document No`);
          }
          if (!item.Quantity || (item.Quantity && Number(item.Quantity) === 0)) {
            allEmptyFields.push(`Line${index + 1}: Quantity`);
          }
          if (!item.Unit) {
            allEmptyFields.push(`Line${index + 1}: Unit`);
          }
        });
      }
      
      if (allEmptyFields.length === 0) {
        const oModel = this.getView().getModel();
        const submitData = oSubmitModel.getData();
  
        // 构建提交数据
        const oData = {
          "DistrChan": "00",
          "Division": "00",
          "DlvType": "ZLO",
          "Salesorg": " ",
          "ShipPoint": "AU99",
          "ShipTo": submitData.VendorNumber,
          "ZTYPE_MOVEMENT": submitData.ZTYPE_MOVEMENT,
          "ZGM3_CONTACT": submitData.ZGM3_CONTACT,
          "ZGM3_TELEPHONE": submitData.ZGM3_TELEPHONE,
          "ZGM3_FAX": submitData.ZGM3_FAX,
          "ZGM3_EMAIL": submitData.ZGM3_EMAIL,
          "ZVENDOR_CONTACT": submitData.ZVENDOR_CONTACT,
          "ZVENDOR_FAX": submitData.ZVENDOR_FAX,
          "ZVENDOR_EMAIL": submitData.ZVENDOR_EMAIL,
          "ZFREIGHT_CHARGED_TO": submitData.ZFREIGHT_CHARGED_TO,
          "ZFREIGHT_METHOD": submitData.ZFREIGHT_METHOD,
          "ZTHIRD_PARTY": submitData.ThirdParty,
          "ZVENDOR_RETREF": submitData.Vendor_Return_Reference,
          "ZSENDER_NAME": submitData.SenderName,
          "ZWEIGHT": String(submitData.Weight || 0),
          "ZMSDS_ATTACHED": submitData.MSDS_Attached,
          "ZCARRIER_NAME": submitData.ZCARRIER_CONSIGN,
          "ZCUSTOM_LETTER": submitData.CustomsLetterAttached,
          "ZDANGEROUS_GOODS": submitData.ZDANGEROUS_GOODS,
          "ZSTORED_ENERGY": submitData.ZSTORED_ENERGY,
          "ZSPEC_INST": submitData.ZSPEC_INST,
          "ZCARRIER_CONSIGN": submitData.ZCARRIER_CONSIGN,
          "NP_ASH2DLVTI": submitData.NP_ASH2DLVTI.map(item => ({
            "ZDOC_NO": item.ZDOCUMENT_NO,
            "ZDOC_ITEM": item.ZDOCUMENT_ITEM,
            "RefItem": item.Vbeln || "",
            "DlvQty": item.Quantity || "",
            // "ZDOC_NO": item.PurchaseOrderNo || "",
            // "ZDOC_ITEM": item.POItemNo || "",
            "Material": item.MaterialNo || "",
            // "Weight": item.Weight || "",
            // "MaterialDesc": item.MaterialDesc || "",
            // "AAC": item.AAC || "",
            // "AccountAssign": item.AccountAssign || "",
            "SalesUnit": item.Unit || "",
            // "Unit2": item.Unit2 || "",
            "Plant": submitData.Plant || "",
            "Brgew": String(item.Weight || 0),
            // "ZDOCUMENT_ITEM": item.ZDOCUMENT_ITEM || "",
            // "ZDOCUMENT_NO": item.ZDOCUMENT_NO || "" 
          })),
          "NP_ASH2DATES": [{
            "Timetype": "WS GOODS ISSUE  LIKP",
            "Timezone": "UTC+8",
            "TimestampUtc": new Date()
          }],
          "NP_ASH2RETURN": [{}]
        };
  
        console.log('提交数据:', JSON.stringify(oData, null, 2));
        const that = this;
        oModel.create("/HEADSet", oData, {
          success: function (data) {
            console.log('提交成功:', data);
            if (data.Delivery) {
              MessageBox.success(`Save successfully! \n Document No: ${data.Delivery}`, {
                actions: MessageBox.Action.OK,
                onClose: function (action) {
                  if (action === MessageBox.Action.OK) {
                    // MessageBox.close()
                    console.log('OK');
                    // 重置表单数据
                    oSubmitModel.setData({
                      // 第一屏数据开始
                      ZTYPE_MOVEMENT: 'Auction item',
                      Plant: "",
                      VendorNumber: "",
                      VendorName: "",
                      ZFREIGHT_CHARGED_TO: "",
                      ZFREIGHT_METHOD: "",
                      PurchasingDoc: "",
                      PoItem: "",
                      MaterialDoc: "",
                      MaterialItem: "",
                      ZSTORED_ENERGY: "N",
                      ZDANGEROUS_GOODS: "N",
                      radianceClearance: "N",
                      year: new Date().getFullYear(),
                      Date: new Date().toLocaleDateString('de-DE'),
                      VendorAddress1: "",
                      VendorAddress2: "",
                      VendorAddress3: "",
                      ZGM3_CONTACT: "",
                      ZGM3_TELEPHONE: "",
                      ZGM3_FAX: "",
                      ZGM3_EMAIL: "",
                      ZCARRIER_NAME: "",
                      plantAddress1: "",
                      plantAddress2: "",
                      plantAddress3: "",
                      plantAddress4: "",
                      ZVENDOR_CONTACT: "",
                      ZVENDOR_TELEPHONE: "",
                      ZVENDOR_FAX: "",
                      ZVENDOR_EMAIL: "",
                      ZCARRIER_CONSIGN: "",
                      ZCARRIER_CONSIGN: "",
                      CustomsLetterAttached:"N",
                      MSDS_Attached:"N",
                      ZTHIRD_PARTY: "",
                      ZVENDOR_RETREF: "",
                      ZSENDER_NAME: "",
                      ZWEIGHT: "",
                      ZMSDS_ATTACHED: "",
                      ZCARRIER_NAME: "",
                      // 表格数据
                      NP_ASH2DLVTI: [],
                      // 日期数据
                      NP_ASH2DATES: [{
                        Timetype: "WS GOODS ISSUE  LIKP",
                        TimestampUtc: Math.floor(new Date().getTime() / 1000)
                      }],
                      // 退货数据
                      NP_ASH2RETURN: [{}]
                    });
  
                    // 重置步骤到第一步
                    const oFormStateModel = that.getView().getModel("formState");
                    oFormStateModel.setProperty("/currentStep", 1);
  
                    // 返回到第一个页面
                    const navCon = that.byId("navCon");
                    navCon.to(that.byId("p1"), "slide");
                  }
                }
              });
            } else {
              let sMessage = '';
              (data.NP_ASH2RETURN?.results || []).forEach(oItem => {
                if (oItem.Message) {
                  sMessage += '\n' + oItem.Message;
                }
              });
              MessageBox.error(sMessage, {
                actions: MessageBox.Action.OK,
                onClose: function (action) {
                  if (action === MessageBox.Action.OK) {
                    console.log('OK');
                  }
                }
              });
            }
          }.bind(this),
          error: function (oError) {
            console.error("Error:", oError);
            MessageBox.error("Save failed：" + oError.message);
          }
        });
      } else {
        sap.m.MessageToast.show("Not Filled:  " + allEmptyFields.join("、"));
      }
    },
    _groupList(list = [], name) {
         const oGroupedData = list.reduce((acc, item) => {
          const key = item[name];
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});
      return Object.entries(oGroupedData).map(([value, items]) => ({ [name]: value, items }));
    }
  });
});