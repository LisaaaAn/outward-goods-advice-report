sap.ui.define([
    "ui5/ogarpt/controller/BaseController",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/m/ColumnListItem",
    "sap/m/Input"
], function (BaseController) {
    "use strict";
    return BaseController.extend("ui5.ogarpt.controller.formSections.SectionA", {
        handleAdd: function () {},
        handleEdit: function () {
            this.rebindTable();
        },
        rebindTable: function (oTemplate) {
            // this.byId("EditableTable").bindItems({
            //     path: "/ProductItems",
            //     key: "ProductId",
            //     template: oTemplate,
            //     templateShareable: true
            // });
        },
    });
});