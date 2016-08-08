"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		App = require('./App'),
		MapView = require('./View/MapView') 
		;


Backbone.$ = $;

module.exports = Backbone.Router.extend({

    routes: {
        "": "home",
    },

    initialize: function(options) {
    	this._App = options.App
  	},

    home: function () {
     this._App.showView(new MapView().render());
    }
});