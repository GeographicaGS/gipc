"use strict";
var BaseView = require('./BaseView');

module.exports = BaseView.extend({
	
	_template: require('../template/header_template.html'),

	initialize: function(options) {
		options = options || {};
		this._options = _.defaults(options, {
      type:null
    });
	},

  render: function () {
  	this.setElement(this._template({type:this._options.type}));
  	return this;
  }
});