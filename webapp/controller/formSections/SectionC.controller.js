sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Text",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (JSONModel, Dialog, Button, Input, Text, Controller, Filter, FilterOperator) {
    "use strict";
    return Controller.extend("ui5.ogarpt.controller.formSections.SectionC", {
        onInit: function () {
            const oItemsModel = new JSONModel({ results: [] });
            this.getView().setModel(oItemsModel, "items");
        },

        onStoredEnergyChange: function (oEvent) {
            const selectedIndex = oEvent.getParameter("selectedIndex");
            const oModel = this.getView().getModel("submitData");
            // 将 0/1 转换为 "Y"/"N"
            oModel.setProperty("/ZSTORED_ENERGY", selectedIndex === 0 ? "Y" : "N");
        },
        onDangerousGoodsChange: function (oEvent) {
            const selectedIndex = oEvent.getParameter("selectedIndex");
            const oModel = this.getView().getModel("submitData");
            // 将 0/1 转换为 "Y"/"N"
            oModel.setProperty("/ZDANGEROUS_GOODS", selectedIndex === 0 ? "Y" : "N");
        },
        onMSDSAttachedChange: function (oEvent) {
            const selectedIndex = oEvent.getParameter("selectedIndex");
            const oModel = this.getView().getModel("submitData");
            // 将 0/1 转换为 "Y"/"N"
            oModel.setProperty("/MSDS_Attached", selectedIndex === 0 ? "Y" : "N");
        },
        onCustomsLetterAttachedChange: function (oEvent) {
            const selectedIndex = oEvent.getParameter("selectedIndex");
            const oModel = this.getView().getModel("submitData");
            // 将 0/1 转换为 "Y"/"N"
            oModel.setProperty("/CustomsLetterAttached", selectedIndex === 0 ? "Y" : "N");
        },
        onValueHelpRequest: function (oEvent) {
            const oInput = oEvent.getSource();
            var that = this;
            const createTable = function () {
                return new sap.m.Table({
                    mode: "SingleSelectMaster",
                    items: {
                        path: "VendorModel>/results",
                        template: new sap.m.ColumnListItem({
                            cells: [
                                new sap.m.Text({ text: "{VendorModel>Kunnr}" }),
                                new sap.m.Text({ text: "{VendorModel>Name1}" }),
                                new sap.m.Text({ text: "{VendorModel>Land1}" }),
                                new sap.m.Text({ text: "{VendorModel>Stras}" })
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
                    selectionChange: function (oEvent2) {
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
            const createTable = function () {
                return new sap.m.Table({
                    mode: "SingleSelectMaster",
                    items: {
                        path: "plantModel>/results",
                        template: new sap.m.ColumnListItem({
                            cells: [
                                new sap.m.Text({ text: "{plantModel>Werks}" }),
                                new sap.m.Text({ text: "{plantModel>Name1}" }),
                                new sap.m.Text({ text: "{plantModel>Stras}" })
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
                    selectionChange: function (oEvent2) {
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
            const that = this;
            const oInput = oEvent.getSource();
            const createTable = function () {
                return new sap.m.Table({
                    mode: "SingleSelectMaster",
                    items: {
                        path: "PurchaseModel>/results",
                        template: new sap.m.ColumnListItem({
                            cells: [
                                new sap.m.Text({ text: "{PurchaseModel>Ebeln}" })
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
                    selectionChange: function (oEvent2) {
                        const selectItems = oEvent2.getParameter("listItem");
                        const oContext = selectItems.getBindingContext("PurchaseModel");
                        const oSelectedData = oContext.getObject();
                        if (oSelectedData && oSelectedData.items) {
                            (oSelectedData.items || []).forEach(oItem => {
                                const weight = that._computeWeight(oItem.Menge, oItem.Brgew);
                                that.handleAdd({
                                    ZDOCUMENT_NO: oItem.Ebeln,
                                    ZDOCUMENT_ITEM: oItem.Ebelp,
                                    Unit: oItem.Meins,
                                    Quantity: oItem.Menge,
                                    Brgew: oItem.Brgew,
                                    Weight: weight,
                                    MaterialNo: oItem.Matnr
                                });
                            });
                        }
                        setTimeout(() => {
                            const aItemList = that.getView().getModel('submitData').getProperty('/NP_ASH2DLVTI');
                            const nTotalWeight = aItemList.reduce((sum, item) => sum + Number(item.Weight || 0), 0);
                            that.getView().getModel('submitData').setProperty('/Weight', nTotalWeight);
                        }, 800)
                        that.getView().getModel('submitData').setProperty('/PurchasingDoc', oSelectedData.Ebeln);
                        that._purchaseValueHelpDialog.close();
                    }
                })
            }
            // 创建对话框
            if (!this._purchaseValueHelpDialog) {
                this._oTable = createTable();
                this._purchaseValueHelpDialog = new Dialog({
                    title: "Choose Purchasing Doc",
                    type: "Standard",
                    state: "None",
                    stretchOnPhone: true,
                    contentWidth: "600px",
                    contentHeight: "400px",
                    buttons: [
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
            const that = this;
            const oInput = oEvent.getSource();

            const createTable = function () {
                return new sap.m.Table({
                    mode: "SingleSelectMaster",
                    items: {
                        path: "MaterialModel>/results",
                        template: new sap.m.ColumnListItem({
                            cells: [
                                new sap.m.Text({ text: "{MaterialModel>Matnr}" }),
                                // new sap.m.Text({text: "{MaterialModel>Maktx}"}),
                                // new sap.m.Text({text: "{MaterialModel>Meins}"}),
                                // new sap.m.Text({text: "{MaterialModel>Brgew}"})
                            ]
                        })
                    },
                    columns: [
                        new sap.m.Column({
                            header: new Text({ text: "Material No" })
                        }),
                        // new sap.m.Column({
                        //     header: new Text({ text: "Description" })
                        // }),
                        // new sap.m.Column({
                        //     header: new Text({ text: "Base Unit" })
                        // }),
                        // new sap.m.Column({
                        //     header: new Text({ text: "Weight Unit" })
                        // })
                    ],
                    selectionChange: function (oEvent2) {
                        const selectItems = oEvent2.getParameter("listItem");
                        const oContext = selectItems.getBindingContext("MaterialModel");
                        const oSelectedData = oContext.getObject();
                        if (oSelectedData && oSelectedData.items) {
                            (oSelectedData.items || []).forEach(oItem => {
                                const weight = that._computeWeight(oItem.Menge, oItem.Brgew);
                                that.handleAdd({
                                    ZDOCUMENT_NO: oItem.Mblnr,
                                    ZDOCUMENT_ITEM: oItem.Zeile,
                                    Unit: oItem.Meins,
                                    Quantity: oItem.Menge,
                                    Brgew: oItem.Brgew,
                                    Weight: weight,
                                    MaterialNo: oItem.Matnr
                                });
                            });
                        }
                        that.getView().getModel('submitData').setProperty('/MaterialDoc', oSelectedData.Matnr);
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

        handleAdd: function (oInitData = {}) {
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
                Weight: "",
                ...oInitData
            };

            aData.push(oNewRow);
            oModel.setProperty("/results", aData);
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
        onQuantityChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var oBindingContext = oInput.getBindingContext("items");
            var sPath = oBindingContext.getPath();
            var oModel = this.getView().getModel("items");
            var oData = oModel.getProperty(sPath);
            // 获取数量值
            var quantity = parseFloat(oData.Quantity) || 0;
            var brgew = parseFloat(oData.Brgew) || 0;
            // 计算重量
            var weight = quantity * brgew;
            // 更新重量字段
            oModel.setProperty(sPath + "/Weight", weight);
        },
        onWeightChange() {
            const aItemList = this.getView().getModel('submitData').getProperty('/NP_ASH2DLVTI');
            const nTotalWeight = aItemList.reduce((sum, item) => sum + Number(item.Weight || 0), 0);
            this.getView().getModel('submitData').setProperty('/Weight', nTotalWeight);
        },
        _computeWeight(quantity = 0, brgew = 0) {
            return (parseFloat(quantity) || 0) * (parseFloat(brgew) || 0);
        },
    });
});