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
      onVendorValueHelpRequest: function (oEvent) {
        const oInput = oEvent.getSource();
        const that = this;
        const createTable = function () {
          return new Table({
            mode: 'SingleSelectMaster',
            items: {
              path: 'VendorModel>/results',
              template: new ColumnListItem({
                cells: [
                  new Text({ text: '{VendorModel>Kunnr}' }),
                  new Text({ text: '{VendorModel>Name1}' }),
                  new Text({ text: '{VendorModel>Land1}' }),
                  new Text({ text: '{VendorModel>Stras}' }),
                ],
              }),
            },
            columns: [
              new Column({
                header: new Text({ text: 'No' }),
              }),
              new Column({
                header: new Text({ text: 'Name' }),
              }),
              new Column({
                header: new Text({ text: 'Country' }),
              }),
              new Column({
                header: new Text({ text: 'Address' }),
              }),
            ],
            selectionChange: function (oEvent2) {
              const selectItems = oEvent2.getParameter('listItem');
              const selectCells = selectItems.getCells();
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
              that._oVendorValueHelpDialog.close();
            },
          });
        };
        // 创建对话框
        if (!this._oVendorValueHelpDialog) {
          this._oVendorVHTable = createTable();
          this._oVendorValueHelpDialog = new Dialog({
            title: 'Choose Vendor',
            type: 'Standard',
            state: 'None',
            stretchOnPhone: true,
            contentWidth: '600px',
            contentHeight: '400px',
            buttons: [
              new Button({
                text: 'Confirm',
                press: function () {
                  const oTable = this._oVendorValueHelpDialog.getContent()[1];
                  const oSelectedItem = oTable.getSelectedItem();
                  if (oSelectedItem) {
                    const oContext =
                      oSelectedItem.getBindingContext('VendorModel');
                    const oSubmitModel = that.getView().getModel('submitData');
                    const VendorName = oContext.getProperty('Name1');
                    oSubmitModel.setProperty('/VendorName', VendorName);
                    const VendorAddress1 = oContext.getProperty('Stras');
                    oSubmitModel.setProperty('/VendorAddress1', VendorAddress1);
                    const ZVENDOR_TELEPHONE = oContext.getProperty('Telf1');
                    oSubmitModel.setProperty(
                      '/ZVENDOR_TELEPHONE',
                      ZVENDOR_TELEPHONE
                    );
                    const ZVENDOR_FAX = oContext.getProperty('Telfx');
                    oSubmitModel.setProperty('/ZVENDOR_FAX', ZVENDOR_FAX);
                  }
                  this._oVendorValueHelpDialog.close();
                }.bind(this),
              }),
              new Button({
                text: 'Cancel',
                press: function () {
                  this._oVendorValueHelpDialog.close();
                }.bind(this),
              }),
            ],
            content: [
              new Input({
                placeholder: 'Enter Vendor No or Name',
                liveChange: function (oEvent) {
                  const sValue = oEvent.getSource().getValue();
                  this._filterVendors(sValue);
                }.bind(this),
              }),
              this._oVendorVHTable,
            ],
          });

          this.getView().addDependent(this._oVendorValueHelpDialog);
        }

        // 打开对话框
        this._oVendorValueHelpDialog.open();
      },

      onPlantValueHelpRequest: function (oEvent) {
        const oInput = oEvent.getSource();
        var that = this;
        const createTable = function () {
          return new Table({
            mode: 'SingleSelectMaster',
            items: {
              path: 'plantModel>/results',
              template: new ColumnListItem({
                cells: [
                  new Text({ text: '{plantModel>Werks}' }),
                  new Text({ text: '{plantModel>Name1}' }),
                  new Text({ text: '{plantModel>Stras}' }),
                ],
              }),
            },
            columns: [
              new Column({
                header: new Text({ text: 'No' }),
              }),
              new Column({
                header: new Text({ text: 'Name' }),
              }),
              new Column({
                header: new Text({ text: 'Address' }),
              }),
            ],
            selectionChange: function (oEvent2) {
              const aSelectItems = oEvent2.getParameter('listItem');
              const aSelectCells = aSelectItems.getCells();
              oInput.setValue(aSelectCells[0].getText());

              // 回显地址信息
              const oData = aSelectItems
                .getBindingContext('plantModel')
                .getObject();
              const oSubmitModel = that.getView().getModel('submitData');
              oSubmitModel.setProperty('/plantAddress1', oData.Name1);
              oSubmitModel.setProperty('/plantAddress2', oData.Stras);
              oSubmitModel.setProperty(
                '/plantAddress3',
                `${oData.Pstlz}/${oData.Ort01}`
              );
              oSubmitModel.setProperty(
                '/plantAddress4',
                `${oData.Land1}/${oData.Regio}`
              );
              that._oPlantValueHelpDialog.close();
            },
          });
        };

        // 创建对话框
        if (!this._oPlantValueHelpDialog) {
          this._oPlantVHTable = createTable();
          this._oPlantValueHelpDialog = new Dialog({
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
                  const oTable = this._oPlantValueHelpDialog.getContent()[1];
                  const oSelectedItem = oTable.getSelectedItem();
                  if (oSelectedItem) {
                    // 回显地址信息
                    const oData = oSelectedItem
                      .getBindingContext('plantModel')
                      .getObject();
                    const oSubmitModel = this.getView().getModel('submitData');
                    oSubmitModel.setProperty('/plantAddress1', oData.Name1);
                    oSubmitModel.setProperty('/plantAddress2', oData.Stras);
                    oSubmitModel.setProperty(
                      '/plantAddress3',
                      `${oData.Pstlz}/${oData.Ort01}`
                    );
                    oSubmitModel.setProperty(
                      '/plantAddress4',
                      `${oData.Land1}/${oData.Regio}`
                    );
                  }
                  this._oPlantValueHelpDialog.close();
                }.bind(this),
              }),
              new Button({
                text: 'Cancel',
                press: function () {
                  this._oPlantValueHelpDialog.close();
                }.bind(this),
              }),
            ],
            content: [
              new Input({
                placeholder: 'Enter Plant No or Name',
                liveChange: function (oEvent) {
                  const sValue = oEvent.getSource().getValue();
                  this._filterPlants(sValue);
                }.bind(this),
              }),
              this._oPlantVHTable,
            ],
          });
          this.getView().addDependent(this._oPlantValueHelpDialog);
        }

        // 打开对话框
        this._oPlantValueHelpDialog.open();
      },
      onPurchasingDocValueHelpRequest: function () {
        const that = this;
        const createTable = function () {
          return new Table({
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
                    Gewei: oItem.Gewei,
                  });
                });
              }
              that
                .getView()
                .getModel('submitData')
                .setProperty('/PurchasingDoc', oSelectedData.Ebeln);
              that.onWeightChange();
              that._oPurchasingDocValueHelpDialog.close();
            },
          });
        };
        // 创建对话框
        if (!this._oPurchasingDocValueHelpDialog) {
          this._oPurchasingDocVHTable = createTable();
          this._oPurchasingDocValueHelpDialog = new Dialog({
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
                  const aSelectedContexts =
                    this._oPurchasingDocVHTable.getSelectedContexts();
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
                        Gewei: oItem.Gewei,
                      });
                    });
                    this.getView()
                      .getModel('submitData')
                      .setProperty('/PurchasingDoc', oSelectedData.Ebeln);
                    this.onWeightChange();
                  }
                  this._oPurchasingDocValueHelpDialog.close();
                }.bind(this),
              }),
              new Button({
                text: 'Cancel',
                press: function () {
                  this._oPurchasingDocValueHelpDialog.close();
                }.bind(this),
              }),
            ],
            content: [
              new Input({
                placeholder: 'Enter Purchase Order No',
                liveChange: function (oEvent) {
                  const sValue = oEvent.getSource().getValue();
                  this._filterPurchasingDocs(sValue);
                }.bind(this),
              }),
              this._oPurchasingDocVHTable,
            ],
          });
          this.getView().addDependent(this._oPurchasingDocValueHelpDialog);
        }

        // 打开对话框
        this._oPurchasingDocValueHelpDialog.open();
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
                    Gewei: oItem.Gewei,
                  });
                });
              }
              that
                .getView()
                .getModel('submitData')
                .setProperty('/MaterialDoc', oSelectedData.Mblnr);
              that.onWeightChange();
              that._oMaterialDocValueHelpDialog.close();
            },
          });
        };
        // 创建对话框
        if (!this._oMaterialDocValueHelpDialog) {
          this._oMaterialDocVHTable = createTable();
          this._oMaterialDocValueHelpDialog = new Dialog({
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
                  const aSelectedContexts =
                    this._oMaterialDocVHTable.getSelectedContexts();
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
                          Gewei: oItem.Gewei,
                        });
                      });
                    }
                    this.getView()
                      .getModel('submitData')
                      .setProperty('/MaterialDoc', oSelectedData.Mblnr);
                    this.onWeightChange();
                  }
                  this._oMaterialDocValueHelpDialog.close();
                }.bind(this),
              }),
              new Button({
                text: 'Cancel',
                press: function () {
                  this._oMaterialDocValueHelpDialog.close();
                }.bind(this),
              }),
            ],
            content: [
              new Input({
                placeholder: 'Enter Material Doc No',
                liveChange: function (oEvent) {
                  const sValue = oEvent.getSource().getValue();
                  this._filterMaterialDocs(sValue);
                }.bind(this),
              }),
              this._oMaterialDocVHTable,
            ],
          });
          this.getView().addDependent(this._oMaterialDocValueHelpDialog);
        }

        // 打开对话框
        this._oMaterialDocValueHelpDialog.open();
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
                const Gewei = oContext.getProperty('Gewei');
                oItemsModel.setProperty(sPath + '/Gewei', Gewei);
              }

              const aInput = oEvent.getSource();
              const oBindingContext = aInput.getBindingContext('items');
              const aPath = oBindingContext.getPath();
              const oData = oItemsModel.getProperty(aPath);
              const weight = that._computeWeight(oData.Quantity, oData.Brgew);
              oItemsModel.setProperty(aPath + '/Weight', weight);
              that._oMaterialValueHelpDialog.close();
            },
          });
        };
        // 创建对话框
        if (!this._oMaterialValueHelpDialog) {
          this._oMaterialVHTable = createTable();
          this._oMaterialValueHelpDialog = new Dialog({
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
                  this._oMaterialValueHelpDialog.close();
                }.bind(this),
              }),
              new Button({
                text: 'Cancel',
                press: function () {
                  this._oMaterialValueHelpDialog.close();
                }.bind(this),
              }),
            ],
            content: [
              new Input({
                placeholder: 'Enter Material No',
                liveChange: function (oEvent) {
                  const sValue = oEvent.getSource().getValue();
                  this._filterMaterials(sValue);
                }.bind(this),
              }),
              this._oMaterialVHTable,
            ],
          });
          this.getView().addDependent(this._oMaterialValueHelpDialog);
        }

        // 打开对话框
        this._oMaterialValueHelpDialog.open();
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
        this._oPlantVHTable.getBinding('items').filter(aFilters);
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
        this._oVendorVHTable.getBinding('items').filter(aFilters);
      },
      _filterPurchasingDocs: function (sValue) {
        const aFilter = this._buildFilter(sValue, 'Ebeln');
        this._oPurchasingDocVHTable
          .getBinding('items')
          .filter(aFilter ? [aFilter] : []);
      },
      _filterMaterialDocs: function (sValue) {
        const aFilter = this._buildFilter(sValue, 'Mblnr');
        this._oMaterialDocVHTable
          .getBinding('items')
          .filter(aFilter ? [aFilter] : []);
      },
      _filterMaterials: function (sValue) {
        const aFilter = this._buildFilter(sValue, 'Matnr');
        this._oMaterialVHTable
          .getBinding('items')
          .filter(aFilter ? [aFilter] : []);
      },
      /** 通过输入值和属性名构建 Filter */
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
