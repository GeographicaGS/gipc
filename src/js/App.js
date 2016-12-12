"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		Router = require('./router'),
		CreditsView = require('./View/CreditsView')
		;


Backbone.$ = $;

var App = module.exports = {
	ini: function () {
		this.$main = $('main');
		this.router = new Router({'App':this});
		this.creditsView = new CreditsView();
		$('body').append(this.creditsView.render().$el);
		Backbone.history.start({pushState: true});
	},

	showView:function(view) {
	  var oldView = this.currentView;
	  this.currentView = view;

	  this.$main.html(view.el);

	  if (oldView)
	    oldView.remove();

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

$('body').on('click','a',function(e){
  var attr = $(this).attr('jslink'),
      href = $(this).attr('href');

  if (attr!= undefined && attr!='undefined'){
    e.preventDefault();
    App.router.navigate(href,{trigger: true});
  }
  
});

$('footer .credit_button').on('click',function(e){
  App.creditsView.$el.toggleClass('active')
});