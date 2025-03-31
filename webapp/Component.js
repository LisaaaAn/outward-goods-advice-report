sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel"
], (UIComponent) => {
   "use strict";

   return UIComponent.extend("ui5.ogarpt.Component", {
      metadata: {
         interfaces: ["sap.ui.core.IAsyncContentCreation"],
         manifest: "json"
      },
      init() {
         // call the init function of the parent
         UIComponent.prototype.init.apply(this, arguments);
         /***
          * name
          * age
          * se
          */
   
         // create the views based on the url/hash
         this.getRouter().initialize();
      },
   });
});
