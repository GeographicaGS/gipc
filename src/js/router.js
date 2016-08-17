"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		MapView = require('./View/MapView'),
    StorytellingView = require('./View/StorytellingView')
		;


Backbone.$ = $;

module.exports = Backbone.Router.extend({

    routes: {
        "": "home",
        "storytelling/:id": "storytelling",
    },

    initialize: function(options) {
    	this._App = options.App
  	},

    home: function () {
     this._App.showView(new MapView().render());
    },

    storytelling:function(id){
      this._App.showView(new StorytellingView({'id':id}).render());
    }
});