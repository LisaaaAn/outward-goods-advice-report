sap.ui.define(
  [
    'sap/ui/model/json/JSONModel',
    'sap/m/Dialog',
    'sap/m/Button',
    'sap/m/Input',
    'sap/m/Text',
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/m/Table',
    'sap/m/Column',
    'sap/m/ColumnListItem',
  ],
  function (
    JSONModel,
    Dialog,
    Button,
    Input,
    Text,
    Controller,
    Filter,
    FilterOperator,
    Table,
    Column,
    ColumnListItem
  ) {
    'use strict';
    return Controller.extend('ui5.ogarpt.controller.formSections.SectionC', {
      onInit: function () {
        const oItemsModel = new JSONModel({ results: [] });
        this.getView().setModel(oItemsModel, 'items');
      },
      onStoredEnergyChange: function (oEvent) {
        const selectedIndex = oEvent.getParameter('selectedIndex');
        const oModel = this.getView().getModel('submitData');
        // 将 0/1 转换为 "Y"/"N"
        oModel.setProperty('/ZSTORED_ENERGY', selectedIndex === 0 ? 'Y' : 'N');
      },
      onDangerousGoodsChange: function (oEvent) {
        const selectedIndex = oEvent.getParameter('selectedIndex');
        const oModel = this.getView().getModel('submitData');
        // 将 0/1 转换为 "Y"/"N"
        oModel.setProperty(
          '/ZDANGEROUS_GOODS',
          selectedIndex === 0 ? 'Y' : 'N'
        );
      },
      onMSDSAttachedChange: function (oEvent) {
        const selectedIndex = oEvent.getParameter('selectedIndex');
        const oModel = this.getView().getModel('submitData');
        // 将 0/1 转换为 "Y"/"N"
        oModel.setProperty('/MSDS_Attached', selectedIndex === 0 ? 'Y' : 'N');
      },
      onCustomsLetterAttachedChange: function (oEvent) {
        const selectedIndex = oEvent.getParameter('selectedIndex');
        const oModel = this.getView().getModel('submitData');
        // 将 0/1 转换为 "Y"/"N"
        oModel.setProperty(
          '/CustomsLetterAttached',
          selectedIndex === 0 ? 'Y' : 'N'
        );
      },
      onValueHelpRequest: function (oEvent) {
        const oInput = oEvent.getSource();
        var that = this;
        const createTable = function () {
          return new sap.m.Table({
            mode: 'SingleSelectMaster',
            items: {
              path: 'VendorModel>/results',
              template: new sap.m.ColumnListItem({
                cells: [
                  new sap.m.Text({ text: '{VendorModel>Kunnr}' }),
                  new sap.m.Text({ text: '{VendorModel>Name1}' }),
                  new sap.m.Text({ text: '{VendorModel>Land1}' }),
                  new sap.m.Text({ text: '{VendorModel>Stras}' }),
                ],
              }),
            },
            columns: [
              new sap.m.Column({
                header: new Text({ text: 'No' }),
              }),
              new sap.m.Column({
                header: new Text({ text: 'Name' }),
              }),
              new sap.m.Column({
                header: new Text({ text: 'Country' }),
              }),
              new sap.m.Column({
                header: new Text({ text: 'Address' }),
              }),
            ],
            selectionChange: function (oEvent2) {
              var selectItems = oEvent2.getParameter('listItem');
              var selectCells = selectItems.getCells();
              oInput.setValue(selectCells[0].getText());
              // 获取选中的供应商数据并设置相关信息
              const oContext = selectItems.getBindingContext('VendorModel');
              const oSubmitModel = that.getView().getModel('submitData');
              const VendorName = oContext.getProperty('Name1');
              oSubmitModel.setProperty('/VendorName', VendorName);
              const VendorAddress1 = oContext.getProperty('Stras');
              oSubmitModel.setProperty('/VendorAddress1', VendorAddress1);
              const ZVENDOR_TELEPHONE = oContext.getProperty('Telf1');
              oSubmitModel.setProperty('/ZVENDOR_TELEPHONE', ZVENDOR_TELEPHONE);
              const ZVENDOR_FAX = oContext.getProperty('Telfx');
              oSubmitModel.setProperty('/ZVENDOR_FAX', ZVENDOR_FAX);
              that._VendorValueHelpDialog.close();
            },
          });
        };
        // 创建对话框
        if (!this._VendorValueHelpDialog) {
          this._oTable = createTable();
          this._VendorValueHelpDialog = new Dialog({
            title: 'Select Vendor',
            type: 'Standard',
            state: 'None',
            stretchOnPhone: true,
            contentWidth: '600px',
            contentHeight: '400px',
            buttons: [
              new Button({
                text: 'Confirm',
                press: function () {
                  const oTable = this._VendorValueHelpDialog.getContent()[1];
                  const oSelectedItem = oTable.getSelectedItem();
                  if (oSelectedItem) {
                    const oContext =
                      oSelectedItem.getBindingContext('VendorModel');
                    const sValue = oContext.getProperty('lifnr');
                    oInput.setValue(sValue);
                    // 获取供应商名称信息并设置到 submitData
                    const oSubmitModel = this.getView().getModel('submitData');
                    const plantAddress = oContext.getProperty('Name1');
                    oSubmitModel.setProperty('/VendorName', plantAddress);
                  }
                  this._VendorValueHelpDialog.close();
                }.bind(this),
              }),
              new Button({
                text: 'Cancel',
                press: function () {
                  this._VendorValueHelpDialog.close();
                }.bind(this),
              }),
            ],
            content: [
              new Input({
                placeholder: 'Enter Vendor number or name',
                liveChange: function (oEvent) {
                  const sValue = oEvent.getSource().getValue();
                  this._filterVendors(sValue);
                }.bind(this),
              }),
              this._oTable,
            ],
          });

          this.getView().addDependent(this._VendorValueHelpDialog);
        }

        // 打开对话框
        this._VendorValueHelpDialog.open();
      },

      onPlantValueHelpRequest: function (oEvent) {
        const oInput = oEvent.getSource();
        var that = this;
        const createTable = function () {
          return new sap.m.Table({
            mode: 'SingleSelectMaster',
            items: {
              path: 'plantModel>/results',
              template: new sap.m.ColumnListItem({
                cells: [
                  new sap.m.Text({ text: '{plantModel>Werks}' }),
                  new sap.m.Text({ text: '{plantModel>Name1}' }),
                  new sap.m.Text({ text: '{plantModel>Stras}' }),
                ],
              }),
            },
            columns: [
              new sap.m.Column({
                header: new Text({ text: 'No' }),
              }),
              new sap.m.Column({
                header: new Text({ text: 'Name' }),
              }),
              new sap.m.Column({
                header: new Text({ text: 'Address' }),
              }),
            ],
            selectionChange: function (oEvent2) {
              var selectItems = oEvent2.getParameter('listItem');
              var selectCells = selectItems.getCells();
              oInput.setValue(selectCells[0].getText());
              // 获取选中的工厂数据并设置地址
              const oContext = selectItems.getBindingContext('plantModel');
              const oSubmitModel = that.getView().getModel('submitData');
              const plantAddress = oContext.getProperty('Stras');
              oSubmitModel.setProperty('/plantAddress1', plantAddress);
              that._plantValueHelpDialog.close();
            },
          });
        };

        // 创建对话框
        if (!this._plantValueHelpDialog) {
          this._oTable = createTable();
          this._plantValueHelpDialog = new Dialog({
            title: 'Choose Plant',
            type: 'Standard',
            state: 'None',
            stretchOnPhone: true,
            contentWidth: '600px',
            contentHeight: '400px',
            buttons: [
              new Button({
                text: 'Confirm',
                press: function () {
                  const oTable = this._plantValueHelpDialog.getContent()[1];
                  const oSelectedItem = oTable.getSelectedItem();
                  if (oSelectedItem) {
                    const oContext =
                      oSelectedItem.getBindingContext('plantModel');
                    const sValue = oContext.getProperty('Werks');
                    oInput.setValue(sValue);
                  }
                  this._plantValueHelpDialog.close();
                }.bind(this),
              }),
              new Button({
                text: 'Cancel',
                press: function () {
                  this._plantValueHelpDialog.close();
                }.bind(this),
              }),
            ],
            content: [
              new Input({
                placeholder: 'Enter Plant name',
                liveChange: function (oEvent) {
                  const sValue = oEvent.getSource().getValue();
                  this._filterPlants(sValue);
                }.bind(this),
              }),
              this._oTable,
            ],
          });
          this.getView().addDependent(this._plantValueHelpDialog);
        }

        // 打开对话框
        this._plantValueHelpDialog.open();
      },
      onPurchasingDocValueHelpRequest: function () {
        const that = this;
        const createTable = function () {
          return new Table({
            id: 'PurchasingDocValueHelpTable',
            mode: 'SingleSelectMaster',
            items: {
              path: 'PurchaseModel>/results',
              template: new ColumnListItem({
                cells: [new Text({ text: '{PurchaseModel>Ebeln}' })],
              }),
            },
            columns: [
              new Column({
                header: new Text({ text: 'Purchase Order No' }),
              }),
            ],
            selectionChange: function (oEvent2) {
              const selectItems = oEvent2.getParameter('listItem');
              const oContext = selectItems.getBindingContext('PurchaseModel');
              const oSelectedData = oContext.getObject();
              if (oSelectedData && oSelectedData.items) {
                (oSelectedData.items || []).forEach((oItem) => {
                  const weight = that._computeWeight(oItem.Menge, oItem.Brgew);
                  that.handleAdd({
                    ZDOCUMENT_NO: oItem.Ebeln,
                    ZDOCUMENT_ITEM: oItem.Ebelp,
                    Unit: oItem.Meins,
                    Quantity: oItem.Menge,
                    Brgew: oItem.Brgew,
                    Weight: weight,
                    MaterialNo: oItem.Matnr,
                    MaterialDesc: oItem.Txz01,
                  });
                });
              }
              that
                .getView()
                .getModel('submitData')
                .setProperty('/PurchasingDoc', oSelectedData.Ebeln);
              that.onWeightChange();
              that._purchaseValueHelpDialog.close();
            },
          });
        };
        // 创建对话框
        if (!this._purchaseValueHelpDialog) {
          this._oTable = createTable();
          this._purchaseValueHelpDialog = new Dialog({
            title: 'Choose Purchasing Doc',
            type: 'Standard',
            state: 'None',
            stretchOnPhone: true,
            contentWidth: '600px',
            contentHeight: '400px',
            buttons: [
              new Button({
                text: 'Confirm',
                press: function () {
                  const aSelectedContexts = this._oTable.getSelectedContexts();
                  if (aSelectedContexts && aSelectedContexts.length) {
                    const oSelectedData = aSelectedContexts[0].getObject();
                    (oSelectedData.items || []).forEach((oItem) => {
                      const weight = that._computeWeight(
                        oItem.Menge,
                        oItem.Brgew
                      );
                      that.handleAdd({
                        ZDOCUMENT_NO: oItem.Ebeln,
                        ZDOCUMENT_ITEM: oItem.Ebelp,
                        Unit: oItem.Meins,
                        Quantity: oItem.Menge,
                        Brgew: oItem.Brgew,
                        Weight: weight,
                        MaterialNo: oItem.Matnr,
                        MaterialDesc: oItem.Txz01,
                      });
                    });
                    this.getView()
                      .getModel('submitData')
                      .setProperty('/PurchasingDoc', oSelectedData.Ebeln);
                    this.onWeightChange();
                  }
                  this._purchaseValueHelpDialog.close();
                }.bind(this),
              }),
              new Button({
                text: 'Cancel',
                press: function () {
                  this._purchaseValueHelpDialog.close();
                }.bind(this),
              }),
            ],
            content: [
              new Input({
                placeholder: 'Enter Purchase Order No',
                liveChange: function (oEvent) {
                  const sValue = oEvent.getSource().getValue();
                  this._filterPO(sValue);
                }.bind(this),
              }),
              this._oTable,
            ],
          });
          this.getView().addDependent(this._purchaseValueHelpDialog);
        }

        // 打开对话框
        this._purchaseValueHelpDialog.open();
      },
      onMaterialDocValueHelpRequest: function () {
        const that = this;
        const createTable = function () {
          return new Table({
            mode: 'SingleSelectMaster',
            items: {
              path: 'MaterialDocModel>/results',
              template: new ColumnListItem({
                cells: [new Text({ text: '{MaterialDocModel>Mblnr}' })],
              }),
            },
            columns: [
              new Column({
                header: new Text({ text: 'Material Doc No' }),
              }),
            ],
            selectionChange: function (oEvent2) {
              const selectItems = oEvent2.getParameter('listItem');
              const oContext =
                selectItems.getBindingContext('MaterialDocModel');
              const oSelectedData = oContext.getObject();
              if (oSelectedData && oSelectedData.items) {
                (oSelectedData.items || []).forEach((oItem) => {
                  const weight = that._computeWeight(oItem.Menge, oItem.Brgew);
                  that.handleAdd({
                    ZDOCUMENT_NO: oItem.Mblnr,
                    ZDOCUMENT_ITEM: oItem.Zeile,
                    Unit: oItem.Meins,
                    Quantity: oItem.Menge,
                    Brgew: oItem.Brgew,
                    Weight: weight,
                    MaterialNo: oItem.Matnr,
                    MaterialDesc: oItem.Maktx,
                  });
                });
              }
              that
                .getView()
                .getModel('submitData')
                .setProperty('/MaterialDoc', oSelectedData.Mblnr);
              that.onWeightChange();
              that._materialDocValueHelpDialog.close();
            },
          });
        };
        // 创建对话框
        if (!this._materialDocValueHelpDialog) {
          this._oTable = createTable();
          this._materialDocValueHelpDialog = new Dialog({
            title: 'Choose Material Doc',
            type: 'Standard',
            state: 'None',
            stretchOnPhone: true,
            contentWidth: '600px',
            contentHeight: '400px',
            buttons: [
              new Button({
                text: 'Confirm',
                press: function () {
                  const aSelectedContexts = this._oTable.getSelectedContexts();
                  if (aSelectedContexts && aSelectedContexts.length) {
                    const oSelectedData = aSelectedContexts[0].getObject();
                    if (oSelectedData && oSelectedData.items) {
                      (oSelectedData.items || []).forEach((oItem) => {
                        const weight = this._computeWeight(
                          oItem.Menge,
                          oItem.Brgew
                        );
                        this.handleAdd({
                          ZDOCUMENT_NO: oItem.Mblnr,
                          ZDOCUMENT_ITEM: oItem.Zeile,
                          Unit: oItem.Meins,
                          Quantity: oItem.Menge,
                          Brgew: oItem.Brgew,
                          Weight: weight,
                          MaterialNo: oItem.Matnr,
                          MaterialDesc: oItem.Maktx,
                        });
                      });
                    }
                    this.getView()
                      .getModel('submitData')
                      .setProperty('/MaterialDoc', oSelectedData.Mblnr);
                    this.onWeightChange();
                  }
                  this._materialDocValueHelpDialog.close();
                }.bind(this),
              }),
              new Button({
                text: 'Cancel',
                press: function () {
                  this._materialDocValueHelpDialog.close();
                }.bind(this),
              }),
            ],
            content: [
              new Input({
                placeholder: 'Enter Material Doc No',
                liveChange: function (oEvent) {
                  const sValue = oEvent.getSource().getValue();
                  this._filterMaterialDoc(sValue);
                }.bind(this),
              }),
              this._oTable,
            ],
          });
          this.getView().addDependent(this._materialDocValueHelpDialog);
        }

        // 打开对话框
        this._materialDocValueHelpDialog.open();
      },

      onMaterialValueHelpRequest: function (oEvent) {
        const that = this;
        const oInput = oEvent.getSource();

        // 获取当前行并选中它
        const oTable = this.byId('EditableTable');
        const oRow = oInput.getParent();
        if (oRow) {
          oTable.setSelectedItem(oRow);
        }

        const createTable = function () {
          return new Table({
            mode: 'SingleSelectMaster',
            items: {
              path: 'MaterialModel>/results',
              template: new ColumnListItem({
                cells: [
                  new Text({ text: '{MaterialModel>Matnr}' }),
                  new Text({ text: '{MaterialModel>Maktx}' }),
                  new Text({ text: '{MaterialModel>Meins}' }),
                  new Text({ text: '{MaterialModel>Brgew}' }),
                ],
              }),
            },
            columns: [
              new Column({
                header: new Text({ text: 'Material No' }),
                width: '200px',
              }),
              new Column({
                header: new Text({ text: 'Description' }),
                width: '200px',
              }),
              new Column({
                header: new Text({ text: 'Base Unit' }),
              }),
              new Column({
                header: new Text({ text: 'Weight Unit' }),
              }),
            ],
            selectionChange: function (oEvent2) {
              const selectItems = oEvent2.getParameter('listItem');
              const oContext = selectItems.getBindingContext('MaterialModel');
              const oItemsModel = that.getView().getModel('items');
              const oTable = that.byId('EditableTable');
              const oSelectedItem = oTable.getSelectedItem();

              if (oSelectedItem) {
                const sPath = oSelectedItem
                  .getBindingContext('items')
                  .getPath();
                const Matnr = oContext.getProperty('Matnr');
                oItemsModel.setProperty(sPath + '/MaterialNo', Matnr);
                const meins = oContext.getProperty('Meins');
                oItemsModel.setProperty(sPath + '/Unit', meins);
                const Brgew = oContext.getProperty('Brgew');
                oItemsModel.setProperty(sPath + '/Brgew', Brgew);
                const Maktx = oContext.getProperty('Maktx');
                oItemsModel.setProperty(sPath + '/MaterialDesc', Maktx);
              }

              const aInput = oEvent.getSource();
              const oBindingContext = aInput.getBindingContext('items');
              const aPath = oBindingContext.getPath();
              const oData = oItemsModel.getProperty(aPath);
              const weight = that._computeWeight(oData.Quantity, oData.Brgew);
              oItemsModel.setProperty(aPath + '/Weight', weight);
              that._materialValueHelpDialog.close();
            },
          });
        };
        // 创建对话框
        if (!this._materialValueHelpDialog) {
          this._oTable = createTable();
          this._materialValueHelpDialog = new Dialog({
            title: 'Choose Material',
            type: 'Standard',
            state: 'None',
            stretchOnPhone: true,
            contentWidth: '600px',
            contentHeight: '400px',
            buttons: [
              new Button({
                text: 'Confirm',
                press: function () {
                  this._materialValueHelpDialog.close();
                }.bind(this),
              }),
              new Button({
                text: 'Cancel',
                press: function () {
                  this._materialValueHelpDialog.close();
                }.bind(this),
              }),
            ],
            content: [
              new Input({
                placeholder: 'Enter Material No',
                liveChange: function (oEvent) {
                  const sValue = oEvent.getSource().getValue();
                  this._filterMaterial(sValue);
                }.bind(this),
              }),
              this._oTable,
            ],
          });
          this.getView().addDependent(this._materialValueHelpDialog);
        }

        // 打开对话框
        this._materialValueHelpDialog.open();
      },

      _filterPlants: function (sValue) {
        const aFilters = [];
        if (sValue) {
          const oName1Filter = this._buildFilter(sValue, 'Name1');
          const oNoFilter = this._buildFilter(sValue, 'Werks');
          let aTempFilters = [];
          let oCombinedFilter = null;
          if (oName1Filter) {
            aTempFilters.push(oName1Filter);
          }
          if (oNoFilter) {
            aTempFilters.push(oNoFilter);
          }
          if (aTempFilters) {
            oCombinedFilter = new Filter({ filters: aTempFilters, and: false });
            aFilters.push(oCombinedFilter);
          }
        }
        this._oTable.getBinding('items').filter(aFilters);
      },

      _filterVendors: function (sValue) {
        const aFilters = [];
        if (sValue) {
          const oName1Filter = this._buildFilter(sValue, 'Name1');
          const oNoFilter = this._buildFilter(sValue, 'Kunnr');
          let aTempFilters = [];
          let oCombinedFilter = null;
          if (oName1Filter) {
            aTempFilters.push(oName1Filter);
          }
          if (oNoFilter) {
            aTempFilters.push(oNoFilter);
          }
          if (aTempFilters) {
            oCombinedFilter = new Filter({ filters: aTempFilters, and: false });
            aFilters.push(oCombinedFilter);
          }
        }
        this._oTable.getBinding('items').filter(aFilters);
      },
      _filterPO: function (sValue) {
        const aFilter = this._buildFilter(sValue, 'Ebeln');
        this._oTable.getBinding('items').filter(aFilter ? [aFilter] : []);
      },
      _filterMaterialDoc: function (sValue) {
        const aFilter = this._buildFilter(sValue, 'Mblnr');
        this._oTable.getBinding('items').filter(aFilter ? [aFilter] : []);
      },
      _filterMaterial: function (sValue) {
        const aFilter = this._buildFilter(sValue, 'Matnr');
        this._oTable.getBinding('items').filter(aFilter ? [aFilter] : []);
      },
      _buildFilter(sValue, sFieldName) {
        let aFilter = null;
        if (sValue) {
          let sResultValue = sValue;
          let sOperator = FilterOperator.Contains;
          if (sValue.startsWith('*') && sValue.endsWith('*')) {
            sOperator = FilterOperator.Contains;
            sResultValue = sValue.slice(1, -1);
          } else if (sValue.startsWith('*')) {
            sOperator = FilterOperator.EndsWith;
            sResultValue = sValue.slice(1);
          } else if (sValue.endsWith('*')) {
            sOperator = FilterOperator.StartsWith;
            sResultValue = sValue.slice(0, -1);
          }
          aFilter = new Filter(sFieldName, sOperator, sResultValue);
        }
        return aFilter;
      },
      handleAdd: function (oInitData = {}) {
        const oModel = this.getView().getModel('items');
        const aItemList = oModel.getProperty('/results') || [];
        const oNewRow = {
          Vbeln: '',
          Quantity: '',
          Unit: '',
          ZDOCUMENT_NO: '',
          ZDOCUMENT_ITEM: '',
          MaterialNo: '',
          MaterialDesc: '',
          Weight: '',
          ...oInitData,
        };
        aItemList.push(oNewRow);
        const aResultList = this._generateItemNo(aItemList);
        oModel.setProperty('/results', aResultList);
        const oSubmitModel = this.getView().getModel('submitData');
        oSubmitModel.setProperty('/NP_ASH2DLVTI', aResultList);
      },
      handleDelete: function () {
        const oModel = this.getView().getModel('items');
        const aItemList = oModel.getProperty('/results');
        const oTable = this.byId('EditableTable');
        const iIndex = oTable.getItems().indexOf(oTable.getSelectedItem());
        aItemList.splice(iIndex, 1);
        const aResultList = this._generateItemNo(aItemList);
        oModel.setProperty('/results', aResultList);
        const oSubmitModel = this.getView().getModel('submitData');
        oSubmitModel.setProperty('/NP_ASH2DLVTI', aResultList);
      },
      onQuantityChange: function (oEvent) {
        const oBindingContext = oEvent.getSource().getBindingContext('items');
        const sPath = oBindingContext.getPath();
        const oModel = this.getView().getModel('items');
        const oData = oModel.getProperty(sPath);
        const weight = this._computeWeight(oData.Quantity, oData.Brgew);
        oModel.setProperty(sPath + '/Weight', weight);
        this.onWeightChange();
      },
      onWeightChange() {
        const aItemList = this.getView()
          .getModel('submitData')
          .getProperty('/NP_ASH2DLVTI');
        const nTotalWeight = aItemList.reduce(
          (sum, item) => sum + Number(item.Weight || 0),
          0
        );
        this.getView()
          .getModel('submitData')
          .setProperty('/Weight', nTotalWeight);
      },
      _computeWeight(quantity = 0, brgew = 0) {
        return (parseFloat(quantity) || 0) * (parseFloat(brgew) || 0);
      },
      _generateItemNo(aList) {
        return aList.map((oItem, iIndex) => ({
          ...oItem,
          Vbeln: `${iIndex + 1}0`,
        }));
      },
    });
  }
);
