"use strict";
var BaseView = require('./BaseView');

module.exports = BaseView.extend({
	
	_template: require('../template/category_template.html'),

  initialize: function(options) {
  	this._collection = options.collection;
  },

  events: {
  	'click li:not(.outstanding)':'_toggleCategory'
  },

  render: function () {
  	this.setElement(this._template({'categories':this._collection.toJSON()}));
  	return this;
  },

  _toggleCategory:function(e){
  	$('li[index=' + $(e.currentTarget).attr('index') + ']').toggleClass('active');
  	var model = this.collection.findWhere({'title':$(e.currentTarget).text()});
  	model.set('enable',!model.get('enable'));
  }

});