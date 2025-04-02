sap.ui.define([
    "ui5/ogarpt/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/Dialog",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Button",
    "sap/m/Input",
    "sap/ui/table/Table",
    "sap/ui/table/Column",
    "sap/m/Text",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, ODataModel, Dialog, List, StandardListItem, Button, Input, Table, Column, Text, Filter, FilterOperator) {
    "use strict";
    return BaseController.extend("ui5.ogarpt.controller.formSections.SectionA", {
        formatter: {
            toRadioButtonIndex: function(sValue) {
                // 确保返回整数类型
                if (sValue === "Y" || sValue === "1") {
                    return 0;
                } else if (sValue === "N" || sValue === "0") {
                    return 1;
                }
                return -1; // 默认值
            }
        },
        onInit: function () {
            

        },

        onValueHelpRequest: function (oEvent) {
            const oInput = oEvent.getSource();
            var that = this;
            const createTable = function() {
                return new sap.m.Table({
                    mode: "SingleSelectMaster",
                    items: {
                        path: "VendorModel>/results",
                        template: new sap.m.ColumnListItem({
                            cells: [
                                new sap.m.Text({text: "{VendorModel>Kunnr}"}),
                                new sap.m.Text({text: "{VendorModel>Name1}"}),
                                new sap.m.Text({text: "{VendorModel>Land1}"}),
                                new sap.m.Text({text: "{VendorModel>Stras}"})
                            ]
                        })
                    },
                    columns: [
                        new sap.m.Column({
                            header: new Text({ text: "No" })
                        }),
                        new sap.m.Column({
                            header: new Text({ text: "Name" })
                        }),
                        new sap.m.Column({
                            header: new Text({ text: "Country" })
                        }),
                        new sap.m.Column({
                            header: new Text({ text: "Address" })
                        })
                    ],
                    selectionChange: function(oEvent2) {
                        var selectItems = oEvent2.getParameter("listItem");
                        var selectCells = selectItems.getCells();
                        oInput.setValue(selectCells[0].getText());
                        // 获取选中的供应商数据并设置相关信息
                        const oContext = selectItems.getBindingContext("VendorModel");
                        const oSubmitModel = that.getView().getModel("submitData");
                        const VendorName = oContext.getProperty("Name1");                                
                        oSubmitModel.setProperty("/VendorName", VendorName);
                        const VendorAddress1 = oContext.getProperty("Stras");
                        oSubmitModel.setProperty("/VendorAddress1", VendorAddress1);
                        const ZVENDOR_TELEPHONE = oContext.getProperty("Telf1");
                        oSubmitModel.setProperty("/ZVENDOR_TELEPHONE", ZVENDOR_TELEPHONE);
                        const ZVENDOR_FAX = oContext.getProperty("Telfx");
                        oSubmitModel.setProperty("/ZVENDOR_FAX", ZVENDOR_FAX);                                
                        that._VendorValueHelpDialog.close();
                    }
                })
            }
            // 创建对话框
            if (!this._VendorValueHelpDialog) {
                this._oTable = createTable();
                this._VendorValueHelpDialog = new Dialog({
                    title: "Select Vendor",
                    type: "Standard",
                    state: "None",
                    stretchOnPhone: true,
                    contentWidth: "600px",
                    contentHeight: "400px",
                    buttons: [
                        new Button({
                            text: "Confirm",
                            press: function () {
                                const oTable = this._VendorValueHelpDialog.getContent()[1];
                                const oSelectedItem = oTable.getSelectedItem();
                                if (oSelectedItem) {
                                    const oContext = oSelectedItem.getBindingContext("VendorModel");
                                    const sValue = oContext.getProperty("lifnr");
                                    oInput.setValue(sValue);
                                    // 获取供应商名称信息并设置到 submitData
                                    
                                    const oSubmitModel = this.getView().getModel("submitData");
                                    const plantAddress = oContext.getProperty("Name1"); // 使用工厂名称作为地址
                                    oSubmitModel.setProperty("/VendorName", plantAddress);
                                }
                                this._VendorValueHelpDialog.close();
                            }.bind(this)
                        }),
                        new Button({
                            text: "Cancel",
                            press: function () {
                                this._VendorValueHelpDialog.close();
                            }.bind(this)
                        })
                    ],
                    content: [
                        new Input({
                            placeholder: "Enter Vendor number or name",
                            liveChange: function (oEvent) {
                                const sValue = oEvent.getSource().getValue();
                                this._filterVendors(sValue);
                            }.bind(this)
                        }),
                        this._oTable
                    ]
                });

                // 添加数据加载事件处理
                // const oTable = this._plantValueHelpDialog.getContent()[1];
                // oTable.attachRowsUpdated(function() {
                //     console.log("表格数据已更新");
                //     const iRowCount = oTable.getRows().length;
                //     console.log("当前行数:", iRowCount);
                // });
                this.getView().addDependent(this._VendorValueHelpDialog);
            }

            // 打开对话框
            this._VendorValueHelpDialog.open();
        },

        onPlantValueHelpRequest: function (oEvent) {
            const oInput = oEvent.getSource();
            var that = this;
            // 创建对话框
            if (!this._plantValueHelpDialog) {
                this._plantValueHelpDialog = new Dialog({
                    title: "Choose Plant",
                    type: "Standard",
                    state: "None",
                    stretchOnPhone: true,
                    contentWidth: "600px",
                    contentHeight: "400px",
                    buttons: [
                        new Button({
                            text: "Confirm",
                            press: function () {
                                const oTable = this._plantValueHelpDialog.getContent()[1];
                                const oSelectedItem = oTable.getSelectedItem();
                                if (oSelectedItem) {
                                    const oContext = oSelectedItem.getBindingContext("plantModel");
                                    const sValue = oContext.getProperty("Werks");
                                    oInput.setValue(sValue);
                                }
                                this._plantValueHelpDialog.close();
                            }.bind(this)
                        }),
                        new Button({
                            text: "Cancel",
                            press: function () {
                                this._plantValueHelpDialog.close();
                            }.bind(this)
                        })
                    ],
                    content: [
                        new Input({
                            placeholder: "Enter plant number or name",
                            liveChange: function (oEvent) {
                                const sValue = oEvent.getSource().getValue();
                                this._filterPlants(sValue);
                            }.bind(this)
                        }),
                        new sap.m.Table({
                            mode: "SingleSelectMaster",
                            items: {
                                path: "plantModel>/results",
                                template: new sap.m.ColumnListItem({
                                    cells: [
                                        new sap.m.Text({text: "{plantModel>Werks}"}),
                                        new sap.m.Text({text: "{plantModel>Name1}"}),
                                        new sap.m.Text({text: "{plantModel>Stras}"})
                                    ]
                                })
                            },
                            columns: [
                                new sap.m.Column({
                                    header: new Text({ text: "No" })
                                }),
                                new sap.m.Column({
                                    header: new Text({ text: "Name" })
                                }),
                                new sap.m.Column({
                                    header: new Text({ text: "Address" })
                                })
                            ],
                            selectionChange: function(oEvent2) {
                                var selectItems = oEvent2.getParameter("listItem");
                                var selectCells = selectItems.getCells();
                                oInput.setValue(selectCells[0].getText());
                                // 获取选中的工厂数据并设置地址
                                const oContext = selectItems.getBindingContext("plantModel");
                                const oSubmitModel = that.getView().getModel("submitData");
                                const plantAddress = oContext.getProperty("Stras");                               
                                oSubmitModel.setProperty("/plantAddress1", plantAddress);

                                that._plantValueHelpDialog.close();
                            }
                        })
                    ]
                });

                // 添加数据加载事件处理
                // const oTable = this._plantValueHelpDialog.getContent()[1];
                // oTable.attachRowsUpdated(function() {
                //     console.log("表格数据已更新");
                //     const iRowCount = oTable.getRows().length;
                //     console.log("当前行数:", iRowCount);
                // });
                this.getView().addDependent(this._plantValueHelpDialog);
            }

            // 打开对话框
            this._plantValueHelpDialog.open();
        },

        _filterPlants: function (sValue) {
            debugger
            const oModel = this.getView().getModel("plantModel");
            
            if (!sValue) {
                return;
            }

            // 构建 OData 查询
            const sPath = "/PLANTSet";
            const aFilters = [];
            
            if (sValue) {
                aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, sValue));
                aFilters.push(new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue));
            }

            const oFilter = new sap.ui.model.Filter({
                filters: aFilters,
                and: false
            });

            // 执行查询
            oModel.read(sPath, {
                filters: [oFilter],
                success: function (oData) {
                    console.log("过滤后的工厂数据:", oData);
                    oModel.setProperty("/result", oData.results);
                }.bind(this),
                error: function (oError) {
                    console.error("获取工厂数据失败:", oError);
                    sap.m.MessageToast.show("获取工厂数据失败: " + oError.message);
                }
            });
        },

        _filterVendors: function (sValue) {
            const aFilter = [];
            if (sValue) {
                aFilter.push(new Filter("Name1", FilterOperator.Contains, sValue))
            }
            this._oTable.getBinding("items").filter(aFilter)
        },
        handleAdd: function () {
            const oModel = this.getView().getModel('items');
            const aData = oModel.getProperty("/results");
            const oNewRow = {
                Vbeln: ""
            };

            aData.push(oNewRow);
            oModel.setProperty("/results", aData);
        },
        handleDelete: function () {
            const oModel = this.getView().getModel('items');
            const oTable = this.byId("EditableTable");
            const iIndex = oTable.getItems().indexOf(oTable.getSelectedItem())
            const aData = oModel.getProperty("/results")
            aData.splice(iIndex, 1);
            oModel.setProperty("/results", aData);
        }
    });
});