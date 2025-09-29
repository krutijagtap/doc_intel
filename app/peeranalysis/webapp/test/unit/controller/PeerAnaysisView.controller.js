/*global QUnit*/

sap.ui.define([
	"peeranalysisv2/controller/PeerAnaysisView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("PeerAnaysisView Controller");

	QUnit.test("I should test the PeerAnaysisView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
