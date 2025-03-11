sap.ui.define([
	"sap/ui/core/ComponentContainer"
], (ComponentContainer) => {
	"use strict";

	new ComponentContainer({
		name: "ui5.ogarpt",
		settings : {
			id : "ogarpt"
		},
		async: true
	}).placeAt("content");
});

