"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		Router = require('./router');


Backbone.$ = $;

var App = module.exports = {
	ini: function () {
		this.$main = $('main');
		this.router = new Router({'App':this});
		Backbone.history.start({pushState: true});
	},

	showView:function(view) {
	  var oldView = this.currentView;
	  this.currentView = view;

	  this.$main.html(view.el);

	  if (oldView)
	    oldView.close();

	  this.scrollTop();
	},

	scrollTop:function(){
  	var body = $('html, body');
	  body.animate({scrollTop:0}, '500', 'swing', function() {});
	},

	getClassByFilter:function(filter){
		if(filter == 'Asentamientos')
			return 'settlement';
		if(filter == 'Declaración')
			return 'declaration';
		if(filter == 'Infraestructuras')
			return 'infrastructure';
		if(filter == 'Manifestaciónes religiosas')
			return 'religion';
		if(filter == 'Normativa')
			return 'normative';
		if(filter == 'Sistema de explotación')
			return 'explotation';
		if(filter == 'Referentes geográficos')
			return 'geograph';
	}

};


App.ini();