"use strict";
var BaseView = require('./BaseView');

module.exports = BaseView.extend({
	
	_template: require('../template/story_info_panel.html'),
  
  initialize: function(options) {
    this._thumbnail = options.thumbnail
  },

  events: {
    'click .close': '_closeFullInfo'
  },

  render: function () {
  	this.setElement(this._template({'m':this.model.toJSON(),'filters':this.model.generateFilters(), 'thumbnail':this._thumbnail}));
  	return this;
  },

  _closeFullInfo:function(){
    $(this.el).removeClass('active');
  }

});