sap.ui.define([
    "ui5/ogarpt/controller/BaseController"
], function (BaseController) {
    "use strict";
    return BaseController.extend("ui5.ogarpt.controller.formSections.SectionB", {
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