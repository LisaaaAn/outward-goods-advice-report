sap.ui.define(
  [
    'ui5/ogarpt/controller/BaseController',
    'sap/m/Dialog',
    'sap/m/Button',
    'sap/m/Input',
    'sap/m/Text',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/m/Table',
    'sap/m/Column',
    'sap/m/ColumnListItem',
  ],
  function (
    BaseController,
    Dialog,
    Button,
    Input,
    Text,
    Filter,
    FilterOperator,
    Table,
    Column,
    ColumnListItem
  ) {
    'use strict';
    return BaseController.extend(
      'ui5.ogarpt.controller.formSections.SectionA',
      {
        onStoredEnergyChange: function (oEvent) {
          const selectedIndex = oEvent.getParameter('selectedIndex');
          const oModel = this.getView().getModel('submitData');
          // 将 0/1 转换为 "Y"/"N"
          oModel.setProperty(
            '/ZSTORED_ENERGY',
            selectedIndex === 0 ? 'Y' : 'N'
          );
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
        onVendorValueHelpRequest: function (oEvent) {
          const oInput = oEvent.getSource();
          var that = this;
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
                oSubmitModel.setProperty(
                  '/ZVENDOR_TELEPHONE',
                  ZVENDOR_TELEPHONE
                );
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
                      const oSubmitModel = that
                        .getView()
                        .getModel('submitData');
                      const VendorName = oContext.getProperty('Name1');
                      oSubmitModel.setProperty('/VendorName', VendorName);
                      const VendorAddress1 = oContext.getProperty('Stras');
                      oSubmitModel.setProperty(
                        '/VendorAddress1',
                        VendorAddress1
                      );
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
                      const oSubmitModel =
                        this.getView().getModel('submitData');
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
        _filterPlants: function (sValue) {
          const aFilters = [];
          if (sValue) {
            const oName1Filter = this._buildFilter(sValue, 'Name1');
            const oNoFilter = this._buildFilter(sValue, 'Werks');
            const oCombinedFilter = new Filter({
              filters: [oName1Filter, oNoFilter],
              and: false,
            });
            aFilters.push(oCombinedFilter);
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
              oCombinedFilter = new Filter({
                filters: aTempFilters,
                and: false,
              });
              aFilters.push(oCombinedFilter);
            }
          }
          this._oVendorVHTable.getBinding('items').filter(aFilters);
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
      }
    );
  }
);
