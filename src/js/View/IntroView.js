"use strict";
var BaseView = require('./BaseView');

module.exports = BaseView.extend({
	
	_template: require('../template/intro_template.html'),

  initialize: function(options) {
  	
  },

  events: {
    'click': '_closeView',
    'click a': '_begin'
  },

  render: function () {
    this.$el.html(this._template());
  	return this;
  },

  _closeView:function(){
    this.$('#intro').addClass('hiden');
  },

  _begin:function(e){
    e.preventDefault();
  }

});