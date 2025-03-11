sap.ui.define([
    "ui5/ogarpt/controller/BaseController"
], function (BaseController) {
    "use strict";
    return BaseController.extend("ui5.ogarpt.controller.ListDemo", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("listDemo").attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
            // var oArgs = oEvent.getParameter("arguments");
            // debugger
        }
    });
});