sap.ui.define([
    "ui5/ogarpt/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/Text",
    "sap/m/ColumnListItem",
    "sap/ui/core/mvc/Controller"
], function (BaseController, JSONModel, Dialog, Button, Input, Table, Column, Text, ColumnListItem, Controller) {
    "use strict";
    return Controller.extend("ui5.ogarpt.controller.formSections.SectionC", {
        onInit:function(){
            var that = this
            setTimeout(function() {
                console.log(that.getView().getModel('plantModel'));
            }, 2000)
            
            // 初始化items模型
            var oItemsModel = new JSONModel({
                results: []
            });
            this.getView().setModel(oItemsModel, "items");
        },

        onValueHelpRequest: function (oEvent) {
            const oInput = oEvent.getSource();
            var that = this;
            // 创建对话框
            if (!this._VendorValueHelpDialog) {
                this._VendorValueHelpDialog = new Dialog({
                    title: "Choose Vendor",
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
                        new sap.m.Table({
                            mode: "SingleSelectMaster",
                            items: {
                                path: "VendorModel>/results",
                                template: new sap.m.ColumnListItem({
                                    cells: [
                                        new sap.m.Text({text: "{VendorModel>Lifnr}"}),
                                        new sap.m.Text({text: "{VendorModel>Name1}"}),
                                        new sap.m.Text({text: "{VendorModel>Land1}"}),
                                        new sap.m.Text({text: "{VendorModel>Adrnr}"})
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
                                that._VendorValueHelpDialog.close();
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
                                    // 获取工厂地址信息并设置到 submitData
                                    const oSubmitModel = this.getView().getModel("submitData");
                                    const plantAddress = oContext.getProperty("Name1"); // 使用工厂名称作为地址
                                    oSubmitModel.setProperty("/plantAddress1", plantAddress);
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
                                        new sap.m.Text({text: "{plantModel>Desc}"})
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
                                    header: new Text({ text: "Desc" })
                                })
                            ],
                            selectionChange: function(oEvent2) {
                                var selectItems = oEvent2.getParameter("listItem");
                                var selectCells = selectItems.getCells();
                                oInput.setValue(selectCells[0].getText());
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

        onMaterialValueHelpRequest: function (oEvent) {
            const oInput = oEvent.getSource();
            var that = this;
            // 创建对话框
            if (!this._materialValueHelpDialog) {
                this._materialValueHelpDialog = new Dialog({
                    title: "Choose Material",
                    type: "Standard",
                    state: "None",
                    stretchOnPhone: true,
                    contentWidth: "600px",
                    contentHeight: "400px",
                    buttons: [
                        new Button({
                            text: "Confirm",
                            press: function () {
                                const oTable = this._materialValueHelpDialog.getContent()[1];
                                const oSelectedItem = oTable.getSelectedItem();
                                if (oSelectedItem) {
                                    const oContext = oSelectedItem.getBindingContext("MaterialModel");
                                    const sValue = oContext.getProperty("Matnr");
                                    oInput.setValue(sValue);
                                    // 获取工厂地址信息并设置到 submitData
                                    const oSubmitModel = this.getView().getModel("submitData");
                                    const matrialUnit1 = oContext.getProperty("Gewei"); 
                                    oSubmitModel.setProperty("/plantAddress1", matrialUnit1);
                                }
                                this._materialValueHelpDialog.close();
                            }.bind(this)
                        }),
                        new Button({
                            text: "Cancel",
                            press: function () {
                                this._materialValueHelpDialog.close();
                            }.bind(this)
                        })
                    ],
                    content: [
                        new Input({
                            placeholder: "Enter Material No",
                            liveChange: function (oEvent) {
                                const sValue = oEvent.getSource().getValue();
                                this._filterPlants(sValue);
                            }.bind(this)
                        }),
                        new sap.m.Table({
                            mode: "SingleSelectMaster",
                            items: {
                                path: "MaterialModel>/results",
                                template: new sap.m.ColumnListItem({
                                    cells: [
                                        new sap.m.Text({text: "{MaterialModel>Matnr}"}),
                                        new sap.m.Text({text: "{MaterialModel>Brgew}"}),
                                        new sap.m.Text({text: "{MaterialModel>Ntgew}"}),
                                        new sap.m.Text({text: "{MaterialModel>Meins}"}),
                                    ]
                                })
                            },
                            columns: [
                                new sap.m.Column({
                                    header: new Text({ text: "No" })
                                }),
                                new sap.m.Column({
                                    header: new Text({ text: "Gross Weight" })
                                }),
                                new sap.m.Column({
                                    header: new Text({ text: "Net Weight" })
                                }),
                                new sap.m.Column({
                                    header: new Text({ text: "Unit" })
                                })
                            ],
                            selectionChange: function(oEvent2) {
                                var selectItems = oEvent2.getParameter("listItem");
                                var selectCells = selectItems.getCells();
                                oInput.setValue(selectCells[0].getText());
                                that._materialValueHelpDialog.close();
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
                this.getView().addDependent(this._materialValueHelpDialog);
            }

            // 打开对话框
            this._materialValueHelpDialog.open();
        },

        handleAdd: function () {
            const oModel = this.getView().getModel('items');
            const aData = oModel.getProperty("/results") || [];
            const oNewRow = {
                Vbeln: "",
                Quantity: "",
                PurchaseOrderNo: "",
                POItemNo: "",
                MaterialNo: "",
                Weight: "",
                MaterialDesc: "",
                AAC: "",
                AccountAssign: "",
                Unit1: "",
                Unit2: ""
            };

            aData.push(oNewRow);
            oModel.setProperty("/results", aData);
             // 同时更新submitModel中的NP_ASH2DLVTI
             const oSubmitModel = this.getView().getModel("submitData");
             oSubmitModel.setProperty("/NP_ASH2DLVTI", aData);
        },
        handleDelete: function () {
            const oModel = this.getView().getModel('items');
            const oTable = this.byId("EditableTable");
            const iIndex = oTable.getItems().indexOf(oTable.getSelectedItem())
            const aData = oModel.getProperty("/results")
            aData.splice(iIndex, 1);
            oModel.setProperty("/results", aData);
             // 同时更新submitModel中的NP_ASH2DLVTI
             const oSubmitModel = this.getView().getModel("submitData");
             oSubmitModel.setProperty("/NP_ASH2DLVTI", aData);
        }
    });
});