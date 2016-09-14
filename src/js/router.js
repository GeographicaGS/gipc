"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		MapView = require('./View/MapView'),
    StorytellingView = require('./View/StorytellingView'),
    StorylineView = require('./View/StorylineView'),
    StorymapView = require('./View/StorymapView')
		;


Backbone.$ = $;

module.exports = Backbone.Router.extend({

    routes: {
        "": "home",
        "storytelling/:id": "storytelling",
        "storyline/:id": "storyline",
        "storymap/:id": "storymap",
    },

    initialize: function(options) {
    	this._App = options.App
  	},

    home: function () {
     this._App.showView(new MapView().render());
    },

    storytelling:function(id){
      this._App.showView(new StorytellingView({'id':id}).render());
    },

    storyline:function(id){
      this._App.showView(new StorylineView({'id':id}).render());
    },

    storymap:function(id){
      this._App.showView(new StorymapView({'id':id}).render());
    }

});