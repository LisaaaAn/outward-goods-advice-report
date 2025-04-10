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
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, Dialog, Button, Input, Table, Column, Text, ColumnListItem, Controller, Filter, FilterOperator,MessageToast) {
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

        onStoredEnergyChange: function(oEvent) {
            const selectedIndex = oEvent.getParameter("selectedIndex");
            const oModel = this.getView().getModel("submitData");
            // 将 0/1 转换为 "Y"/"N"
            oModel.setProperty("/ZSTORED_ENERGY", selectedIndex === 0 ? "Y" : "N");
        },
        onDangerousGoodsChange: function(oEvent) {
            const selectedIndex = oEvent.getParameter("selectedIndex");
            const oModel = this.getView().getModel("submitData");
            // 将 0/1 转换为 "Y"/"N"
            oModel.setProperty("/ZDANGEROUS_GOODS", selectedIndex === 0 ? "Y" : "N");
        },
        onMSDSAttachedChange: function(oEvent) {
            const selectedIndex = oEvent.getParameter("selectedIndex");
            const oModel = this.getView().getModel("submitData");
            // 将 0/1 转换为 "Y"/"N"
            oModel.setProperty("/MSDS_Attached", selectedIndex === 0 ? "Y" : "N");
        },
        onCustomsLetterAttachedChange: function(oEvent) {
            const selectedIndex = oEvent.getParameter("selectedIndex");
            const oModel = this.getView().getModel("submitData");
            // 将 0/1 转换为 "Y"/"N"
            oModel.setProperty("/CustomsLetterAttached", selectedIndex === 0 ? "Y" : "N");
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
                                    const plantAddress = oContext.getProperty("Name1"); 
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

                this.getView().addDependent(this._VendorValueHelpDialog);
            }

            // 打开对话框
            this._VendorValueHelpDialog.open();
        },

        onPlantValueHelpRequest: function (oEvent) {
            const oInput = oEvent.getSource();
            var that = this;
            const createTable = function() {
                return new sap.m.Table({
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
            }

            // 创建对话框
            if (!this._plantValueHelpDialog) {
                this._oTable = createTable();
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
                            placeholder: "Enter Plant name",
                            liveChange: function (oEvent) {
                                const sValue = oEvent.getSource().getValue();
                                this._filterPlants(sValue);
                            }.bind(this)
                        }),
                        this._oTable
                        
                    ]
                });
                this.getView().addDependent(this._plantValueHelpDialog);
            }

            // 打开对话框
            this._plantValueHelpDialog.open();
        },
        onPurchaseValueHelpRequest: function (oEvent) {
            const oInput = oEvent.getSource();
            var that = this;
             // 获取当前行并选中它
             const oTable = this.byId("EditableTable");
             const oRow = oInput.getParent();
             if (oRow) {
                 oTable.setSelectedItem(oRow);
             }
            const createTable = function() {
                return new sap.m.Table({
                    mode: "SingleSelectMaster",
                    items: {
                        path: "PurchaseModel>/results",
                        template: new sap.m.ColumnListItem({
                            cells: [
                                new sap.m.Text({text: "{PurchaseModel>Ebeln}"})
                                // new sap.m.Text({text: "{PurchaseModel>Ebelp}"})
                            ]
                        })
                    },
                    columns: [
                        new sap.m.Column({
                            header: new Text({ text: "Purchase Order No" })
                        })
                        // new sap.m.Column({
                        //     header: new Text({ text: "PO Item No" })
                        // })
                    ],
                    selectionChange: function(oEvent2) {
                        var selectItems = oEvent2.getParameter("listItem");
                        var selectCells = selectItems.getCells();
                        // oInput.setValue(selectCells[0].getText());
                        // 获取选中的物料数据并设置相关信息
                        const oContext = selectItems.getBindingContext("PurchaseModel");
                        const oItemsModel = that.getView().getModel("items");
                        const oTable = that.byId("EditableTable");
                        const oSelectedItem = oTable.getSelectedItem();

                        if (oSelectedItem) {
                            const sPath = oSelectedItem.getBindingContext("items").getPath();
                            const PurchaseOrderNo = oContext.getProperty("Ebeln");
                            oItemsModel.setProperty(sPath + "/PurchaseOrderNo", PurchaseOrderNo);
                        }

                        that._purchaseValueHelpDialog.close();
                    }
                })
            }
            // 创建对话框
            if (!this._purchaseValueHelpDialog) {
                this._oTable = createTable();
                this._purchaseValueHelpDialog = new Dialog({
                    title: "Choose Purchase Order No",
                    type: "Standard",
                    state: "None",
                    stretchOnPhone: true,
                    contentWidth: "600px",
                    contentHeight: "400px",
                    buttons: [
                        new Button({
                            text: "Confirm",
                            press: function () {
                                const oTable = this._purchaseValueHelpDialog.getContent()[1];
                                const oSelectedItem = oTable.getSelectedItem();
                                if (oSelectedItem) {
                                    const oContext = oSelectedItem.getBindingContext("PurchaseModel");
                                    const sValue = oContext.getProperty("Ebeln");
                                    oInput.setValue(sValue);
                                    
                                    // 获取当前表格的选中行
                                    const oItemsTable = that.byId("EditableTable");
                                    const oItemsSelectedItem = oItemsTable.getSelectedItem();
                                    if (oItemsSelectedItem) {
                                        const oItemsModel = that.getView().getModel("items");
                                        
                                        // 同时更新submitModel中的NP_ASH2DLVTI
                                        const oSubmitModel = that.getView().getModel("submitData");
                                        const aData = oItemsModel.getProperty("/results");
                                        oSubmitModel.setProperty("/NP_ASH2DLVTI", aData);
                                    }
                                }
                                this._purchaseValueHelpDialog.close();
                            }.bind(this)
                        }),
                        new Button({
                            text: "Cancel",
                            press: function () {
                                this._purchaseValueHelpDialog.close();
                            }.bind(this)
                        })
                    ],
                    content: [
                        new Input({
                            placeholder: "Enter Purchase Order No",
                            liveChange: function (oEvent) {
                                const sValue = oEvent.getSource().getValue();
                                this._filterPO(sValue);
                            }.bind(this)
                        }),
                        this._oTable
                    ]
                });
                this.getView().addDependent(this._purchaseValueHelpDialog);
            }

            // 打开对话框
            this._purchaseValueHelpDialog.open();
        },
        onMaterialValueHelpRequest: function (oEvent) {
            const oInput = oEvent.getSource();
            var that = this;
             // 获取当前行并选中它
             const oTable = this.byId("EditableTable");
             const oRow = oInput.getParent();
             if (oRow) {
                 oTable.setSelectedItem(oRow);
             }
            const createTable = function() {
                return new sap.m.Table({
                    mode: "SingleSelectMaster",
                    items: {
                        path: "MaterialModel>/results",
                        template: new sap.m.ColumnListItem({
                            cells: [
                                new sap.m.Text({text: "{MaterialModel>Matnr}"}),
                                new sap.m.Text({text: "{MaterialModel>Maktx}"}),
                                new sap.m.Text({text: "{MaterialModel>Meins}"}),
                                new sap.m.Text({text: "{MaterialModel>Brgew}"})
                            ]
                        })
                    },
                    columns: [
                        new sap.m.Column({
                            header: new Text({ text: "Material No" })
                        }),
                        new sap.m.Column({
                            header: new Text({ text: "Description" })
                        }),
                        new sap.m.Column({
                            header: new Text({ text: "Base Unit" })
                        }),
                        new sap.m.Column({
                            header: new Text({ text: "Weight Unit" })
                        })
                    ],
                    selectionChange: function(oEvent2) {
                        var selectItems = oEvent2.getParameter("listItem");
                        var selectCells = selectItems.getCells();
                        // oInput.setValue(selectCells[0].getText());
                        // 获取选中的物料数据并设置相关信息
                        const oContext = selectItems.getBindingContext("MaterialModel");
                        const oItemsModel = that.getView().getModel("items");
                        const oTable = that.byId("EditableTable");
                        const oSelectedItem = oTable.getSelectedItem();

                        if (oSelectedItem) {
                            const sPath = oSelectedItem.getBindingContext("items").getPath();
                            const Matnr = oContext.getProperty("Matnr");
                            oItemsModel.setProperty(sPath + "/MaterialNo", Matnr);
                            const meins = oContext.getProperty("Meins");
                            oItemsModel.setProperty(sPath + "/Unit", meins);                          
                            const Brgew = oContext.getProperty("Brgew");
                            oItemsModel.setProperty(sPath + "/Brgew2", Brgew);
                        }
                        var aInput = oEvent.getSource();
                        var oBindingContext = aInput.getBindingContext("items");
                        var aPath = oBindingContext.getPath();
                        var oData = oItemsModel.getProperty(aPath);
                        // 获取数量值
                        var quantity = parseFloat(oData.Quantity) || 0;
                        var brgew = parseFloat(oData.Brgew2) || 0;
                        // 计算重量
                        var weight = quantity * brgew;
                        // 更新重量字段
                        oItemsModel.setProperty(aPath + "/Weight", weight);
                        that._materialValueHelpDialog.close();
                    }
                })
            }
            // 创建对话框
            if (!this._materialValueHelpDialog) {
                this._oTable = createTable();
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
                                    
                                    // 获取当前表格的选中行
                                    const oItemsTable = that.byId("EditableTable");
                                    const oItemsSelectedItem = oItemsTable.getSelectedItem();
                                    if (oItemsSelectedItem) {
                                        const oItemsModel = that.getView().getModel("items");
                                        const sPath = oItemsSelectedItem.getBindingContext("items").getPath();
                                        
                                        // 从MaterialModel中获取单位和描述
                                        const brgew = oContext.getProperty("Brgew");
                                        const meins = oContext.getProperty("Meins");
                                        const maktx = oContext.getProperty("Maktx");
                                        
                                        // 设置值到items模型
                                        oItemsModel.setProperty(sPath + "/Unit", meins);
                                        oItemsModel.setProperty(sPath + "/MaterialDesc", maktx);
                                        
                                        // 同时更新submitModel中的NP_ASH2DLVTI
                                        const oSubmitModel = that.getView().getModel("submitData");
                                        const aData = oItemsModel.getProperty("/results");
                                        oSubmitModel.setProperty("/NP_ASH2DLVTI", aData);
                                    }
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
                                this._filterMaterial(sValue);
                            }.bind(this)
                        }),
                        this._oTable
                    ]
                });
                this.getView().addDependent(this._materialValueHelpDialog);
            }

            // 打开对话框
            this._materialValueHelpDialog.open();
        },

        _filterPlants: function (sValue) {
            const aFilter = [];
            if (sValue) {
                const oName1Filter = new Filter("Name1", FilterOperator.Contains, sValue);
                const oNoFilter = new Filter("Werks", FilterOperator.Contains, sValue);
                const oCombinedFilter = new Filter({
                    filters: [oName1Filter, oNoFilter],
                    and: false
                });
                aFilter.push(oCombinedFilter);
            }
            this._oTable.getBinding("items").filter(aFilter);
        },

        _filterVendors: function (sValue) {
            const aFilter = [];
            if (sValue) {
                const oName1Filter = new Filter("Name1", FilterOperator.Contains, sValue);
                const oNoFilter = new Filter("Kunnr", FilterOperator.Contains, sValue);
                const oCombinedFilter = new Filter({
                    filters: [oName1Filter, oNoFilter],
                    and: false
                });
                aFilter.push(oCombinedFilter);
            }
            this._oTable.getBinding("items").filter(aFilter);
        },

        _filterPO: function (sValue) {
            const aFilter = [];
            if (sValue) {
                aFilter.push(new Filter("Ebeln", FilterOperator.Contains, sValue))
            }
            this._oTable.getBinding("items").filter(aFilter)
        },
        _filterMaterial: function (sValue) {
            const aFilter = [];
            if (sValue) {
                aFilter.push(new Filter("Matnr", FilterOperator.Contains, sValue))
            }
            this._oTable.getBinding("items").filter(aFilter)
        },

        handleAdd: function () {
            const oModel = this.getView().getModel('items');
            const aData = oModel.getProperty("/results") || [];
            let sNewNo = '10';
            if (aData.length) {
                const sLastNo = aData[aData.length - 1].Vbeln;
                sNewNo = String(Number(sLastNo) + 10);
            }
            const oNewRow = {
                Vbeln: sNewNo,
                Quantity: "",
                Unit: "",
                PurchaseOrderNo: "",
                POItemNo: "",
                MaterialNo: "",
                MaterialDesc: "",
                Weight: ""
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
        },
        onQuantityChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var oBindingContext = oInput.getBindingContext("items");
            var sPath = oBindingContext.getPath();
            var oModel = this.getView().getModel("items");
            var oData = oModel.getProperty(sPath);
            // 获取数量值
            var quantity = parseFloat(oData.Quantity) || 0;
            var brgew = parseFloat(oData.Brgew2) || 0;
                        // 计算重量
                        var weight = quantity * brgew;
                        // 更新重量字段
                        oModel.setProperty(sPath + "/Weight", weight);
            
        }
    });
});