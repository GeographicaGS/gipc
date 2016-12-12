"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		MapView = require('./View/MapView'),
    StorytellingView = require('./View/StorytellingView'),
    StorylineView = require('./View/StorylineView'),
    StorymapView = require('./View/StorymapView'),
    ArticlesView = require('./View/ArticlesView'),
    ArticleView = require('./View/ArticleView')
		;


Backbone.$ = $;

module.exports = Backbone.Router.extend({

    routes: {
        "": "home",
        "map": "map",
        "storytelling/:id": "storytelling",
        "storyline/:id": "storyline",
        "storymap/:id": "storymap",
        "articles": "articles",
        "article/:id": "article"
    },

    initialize: function(options) {
    	this._App = options.App;
  	},

    home: function () {
     this._App.showView(new MapView({'intro':true}).render());
    },

    map: function () {
     this._App.showView(new MapView({'intro':false}).render());
    },

    storytelling:function(id){
      this._App.showView(new StorytellingView({'id':id}).render());
    },

    storyline:function(id){
      this._App.showView(new StorylineView({'id':id}).render());
    },

    storymap:function(id){
      this._App.showView(new StorymapView({'id':id}).render());
    },

    articles:function(){
      this._App.showView(new ArticlesView().render());
    },

    article:function(id){
      this._App.showView(new ArticleView({'id':id}).render());
    }

});