"use strict";
var BaseView = require('./BaseView');

module.exports = BaseView.extend({
	
	_template: require('../template/credits_template.html'),


	events: {
    'click .close': '_closePanel',
  },

  render: function () {
  	this.setElement(this._template());
  	return this;
  },

  _closePanel:function(){
  	this.$el.removeClass('active');
  }

  


});