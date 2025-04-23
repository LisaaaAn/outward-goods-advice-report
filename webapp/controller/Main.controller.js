sap.ui.define(
  [
    'ui5/ogarpt/controller/BaseController',
    'sap/ui/model/odata/v2/ODataModel',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
  ],
  function (BaseController, ODataModel, JSONModel, MessageBox, MessageToast) {
    'use strict';
    const oInitSubmitData = {
      ZTYPE_MOVEMENT: 'Auction item',
      Plant: '',
      VendorNumber: '',
      VendorName: '',
      ZFREIGHT_CHARGED_TO: 'SENDER',
      ZFREIGHT_METHOD: 'AirFreight',
      PurchasingDoc: '',
      PoItem: '',
      MaterialDoc: '',
      MaterialItem: '',
      ZSTORED_ENERGY: 'N',
      ZDANGEROUS_GOODS: 'N',
      radianceClearance: 'N',
      year: new Date().getFullYear(),
      Date: new Date().toLocaleDateString('de-DE'),
      VendorAddress1: '',
      VendorAddress2: '',
      VendorAddress3: '',
      ZGM3_CONTACT: '',
      ZGM3_TELEPHONE: '',
      ZGM3_FAX: '',
      ZGM3_EMAIL: '',
      ZCARRIER_NAME: '',
      plantAddress1: '',
      plantAddress2: '',
      plantAddress3: '',
      plantAddress4: '',
      ZVENDOR_CONTACT: '',
      ZVENDOR_TELEPHONE: '',
      ZVENDOR_FAX: '',
      ZVENDOR_EMAIL: '',
      ZCARRIER_CONSIGN: '',
      ZCARRIER_CONSIGN: '',
      CustomsLetterAttached: 'N',
      MSDS_Attached: 'N',
      ZTHIRD_PARTY: '',
      ZVENDOR_RETREF: '',
      ZSENDER_NAME: '',
      ZWEIGHT: '',
      ZMSDS_ATTACHED: '',
      ZCARRIER_NAME: '',
      // 表格数据
      NP_ASH2DLVTI: [],
      // 日期数据
      NP_ASH2DATES: [
        {
          Timetype: 'WS GOODS ISSUE  LIKP',
          TimestampUtc: Math.floor(new Date().getTime() / 1000),
        },
      ],
      // 退货数据
      NP_ASH2RETURN: [{}],
    };

    return BaseController.extend('ui5.ogarpt.controller.Main', {
      onInit: function () {
        const that = this;

        // JSONModel
        this.getView().setModel(
          new JSONModel(jQuery.extend(true, {}, oInitSubmitData)),
          'submitData'
        );

        // oDataModel
        const oDataModel = new ODataModel('/sap/opu/odata/sap/ZIM_OGA_SRV/');

        // 获取 Plant 数据
        oDataModel.read('/PLANTSet', {
          success: function (oData) {
            that.getView().setModel(new JSONModel(oData), 'plantModel');
          },
          error: function (oError) {
            MessageToast.show('Failed to get Plant Data:' + oError.message);
          },
        });

        // 获取 Vendor 数据
        oDataModel.read('/VENDORSet', {
          success: function (oData) {
            that.getView().setModel(new JSONModel(oData), 'VendorModel');
          },
          error: function (oError) {
            MessageToast.show('Failed to get Vendor Data:' + oError.message);
          },
        });

        // 获取 Material Doc 数据
        oDataModel.read('/MaterialSet', {
          success: function (oData) {
            const aResultList = that._groupList(oData?.results, 'Mblnr');
            that
              .getView()
              .setModel(
                new JSONModel({ results: aResultList }),
                'MaterialDocModel'
              );
          },
          error: function (oError) {
            MessageToast.show(
              'Failed to get Material Doc Data:' + oError.message
            );
          },
        });

        // 获取 Purchasing Doc 数据
        oDataModel.read('/PurNoDocSet', {
          success: function (oData) {
            const aResultList = that._groupList(oData?.results, 'Ebeln');
            that
              .getView()
              .setModel(
                new JSONModel({ results: aResultList }),
                'PurchaseModel'
              );
          },
          error: function (oError) {
            MessageToast.show('Failed to get PO Data:' + oError.message);
          },
        });

        // 获取 Material 数据
        oDataModel.read('/MATNRSet', {
          success: function (oData) {
            that.getView().setModel(new JSONModel(oData), 'MaterialModel');
          },
          error: function (oError) {
            MessageToast.show('Failed to get Material Data:' + oError.message);
          },
        });
      },

      onBeforeRendering: function () {
        const today = new Date();
        const dateModel = new JSONModel({
          currentYear: today.getFullYear(),
          currentDate:
            today.getDate().toString().padStart(2, '0') +
            '.' +
            (today.getMonth() + 1).toString().padStart(2, '0') +
            '.' +
            today.getFullYear(),
        });

        this.getView().setModel(dateModel, 'dateModel');
        this.getView().setModel(new JSONModel({ currentStep: 1 }), 'formState');

        // 打开空白表单页
        const oModel = this.getView().getModel();
        const oParameterContext = oModel.createEntry('/HEADSet', {
          properties: {
            ZTYPE_MOVEMENT: 'Auction item',
          },
        });
        this.getView().setBindingContext(oParameterContext);
      },
      handleNavigate: function (evt) {
        const navCon = this.byId('navCon');
        const target = evt.getSource().data('target');
        const oModel = this.getView().getModel('formState');
        const step = oModel.getProperty('/currentStep');
        if (target) {
          if (target === 'p2') {
            // 获取表单中的所有必填字段
            const form = this.byId('_IDGenXMLView').byId('_IDGenForm');
            const requiredFields = form
              .getFormContainers()[0]
              .getFormElements()
              .filter((element) => {
                const field = element.getFields()[0];
                return field && field.getRequired && field.getRequired();
              });
            const requiredFields2 = form
              .getFormContainers()[1]
              .getFormElements()
              .filter((element) => {
                const field = element.getFields()[0];
                return field && field.getRequired && field.getRequired();
              });
            // 检查必填字段是否都已填写，并收集未填写的字段
            const emptyFields = [...requiredFields, ...requiredFields2]
              .filter((element) => {
                const field = element.getFields()[0];
                return field && field.getValue && !field.getValue();
              })
              .map((element) => element.getLabel());

            if (emptyFields.length === 0) {
              oModel.setProperty('/currentStep', 2);
              navCon.to(this.byId(target), 'slide');
            } else {
              MessageToast.show('Not Filled:  ' + emptyFields.join('、'));
            }
          }
        } else {
          if (step) {
            oModel.setProperty('/currentStep', step - 1);
          }
          navCon.back();
        }
      },
      handleSubmit: function () {
        const that = this;

        // 获取所有表单的必填字段
        const aFormIds = ['headerForm', 'mainForm', 'otherDetailForm'];
        let aEmptyFields = [];

        // 验证表单字段
        aFormIds.forEach((sId) => {
          const form = this.byId('_IDGenXMLView2').byId(sId);
          if (form) {
            // 检查表单类型
            if (form instanceof sap.ui.layout.form.Form) {
              // 处理标准表单
              const containers = form.getFormContainers();
              containers.forEach((container) => {
                const requiredFields = container
                  .getFormElements()
                  .filter((element) => {
                    const field = element.getFields()[0];
                    return field && field.getRequired && field.getRequired();
                  });

                const emptyFields = requiredFields
                  .filter((element) => {
                    const field = element.getFields()[0];
                    return field && field.getValue && !field.getValue();
                  })
                  .map((element) => element.getLabel());

                aEmptyFields = [...aEmptyFields, ...emptyFields];
              });
            }
          }
        });

        // 验证表格数据
        const oSubmitModel = this.getView().getModel('submitData');
        const aTableData = oSubmitModel.getProperty('/NP_ASH2DLVTI') || [];

        if (aTableData.length === 0) {
          aEmptyFields.push('The table data cannot be left blank');
        } else {
          aTableData.forEach((item, index) => {
            // 检查必填字段
            if (
              !item.Quantity ||
              (item.Quantity && Number(item.Quantity) === 0)
            ) {
              aEmptyFields.push(`Line${index + 1}: Quantity`);
            }
            if (!item.Unit) {
              aEmptyFields.push(`Line${index + 1}: Unit`);
            }
          });
        }

        if (aEmptyFields.length === 0) {
          const oModel = this.getView().getModel();
          const submitData = oSubmitModel.getData();

          // 构建提交数据
          const oData = {
            DistrChan: '00',
            Division: '00',
            DlvType: 'ZLO',
            Salesorg: ' ',
            ShipPoint: 'AU99',
            ShipTo: submitData.VendorNumber,
            ZTYPE_MOVEMENT: submitData.ZTYPE_MOVEMENT,
            ZGM3_CONTACT: submitData.ZGM3_CONTACT,
            ZGM3_TELEPHONE: submitData.ZGM3_TELEPHONE,
            ZGM3_FAX: submitData.ZGM3_FAX,
            ZGM3_EMAIL: submitData.ZGM3_EMAIL,
            ZVENDOR_CONTACT: submitData.ZVENDOR_CONTACT,
            ZVENDOR_TELEPHONE: submitData.ZVENDOR_TELEPHONE,
            ZVENDOR_FAX: submitData.ZVENDOR_FAX,
            ZVENDOR_EMAIL: submitData.ZVENDOR_EMAIL,
            ZFREIGHT_CHARGED_TO: submitData.ZFREIGHT_CHARGED_TO,
            ZFREIGHT_METHOD: submitData.ZFREIGHT_METHOD,
            ZTHIRD_PARTY: submitData.ThirdParty,
            ZVENDOR_RETREF: submitData.Vendor_Return_Reference,
            ZSENDER_NAME: submitData.SenderName,
            ZWEIGHT: String(submitData.Weight || 0),
            ZMSDS_ATTACHED: submitData.MSDS_Attached,
            ZCUSTOM_LETTER: submitData.CustomsLetterAttached,
            ZDANGEROUS_GOODS: submitData.ZDANGEROUS_GOODS,
            ZSTORED_ENERGY: submitData.ZSTORED_ENERGY,
            ZSPEC_INST: submitData.ZSPEC_INST,
            ZCARRIER_NAME: submitData.ZCARRIER_NAME,
            ZCARRIER_CONSIGN: submitData.ZCARRIER_CONSIGN,
            NP_ASH2DLVTI: submitData.NP_ASH2DLVTI.map((item) => ({
              ZDOC_NO: item.ZDOCUMENT_NO,
              ZDOC_ITEM: item.ZDOCUMENT_ITEM,
              RefItem: item.Vbeln || '',
              DlvQty: item.Quantity || '',
              Material: item.MaterialNo || '',
              SalesUnit: item.Unit || '',
              Plant: submitData.Plant || '',
              Brgew: String(item.Weight || 0),
            })),
            NP_ASH2DATES: [
              {
                Timetype: 'WS GOODS ISSUE  LIKP',
                Timezone: 'UTC+8',
                TimestampUtc: new Date(),
              },
            ],
            NP_ASH2RETURN: [{}],
          };

          console.log('Submit Data:', JSON.stringify(oData, null, 2));

          oModel.create('/HEADSet', oData, {
            success: function (data) {
              if (data.Delivery) {
                MessageBox.success(
                  `Save successfully! \n Document No: ${data.Delivery}`,
                  {
                    actions: MessageBox.Action.OK,
                    onClose: function (action) {
                      if (action === MessageBox.Action.OK) {
                        // 重置表单数据
                        oSubmitModel.setData(oInitSubmitData);
                        that
                          .byId('_IDGenXMLView2')
                          .getModel('items')
                          .setProperty('/results', []);
                        // 回到第一页
                        const oFormStateModel = that
                          .getView()
                          .getModel('formState');
                        oFormStateModel.setProperty('/currentStep', 1);
                        window.location.reload();
                      }
                    },
                  }
                );
              } else {
                let sMessage = '';
                (data.NP_ASH2RETURN?.results || []).forEach((oItem) => {
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
                  },
                });
              }
            }.bind(this),
            error: function (oError) {
              console.error('Error:', oError);
              MessageBox.error('Save failed：' + oError.message);
            },
          });
        } else {
          MessageToast.show('Not Filled:  ' + aEmptyFields.join('、'));
        }
      },
      _groupList(list = [], name) {
        const oGroupedData = list.reduce((acc, item) => {
          const key = item[name];
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});
        return Object.entries(oGroupedData).map(([value, items]) => ({
          [name]: value,
          items,
        }));
      },
    });
  }
);
