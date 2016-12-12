"use strict";
var BaseView = require('./BaseView'),
    config = require('../Config.js')
;

module.exports = BaseView.extend({
	
	className:'inlblock',
	_template: require('../template/article_button_template.html'),

  initialize: function(options) {
    this._model = new Backbone.Model();
    this._model.url = 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT cartodb_id as id, titulo FROM articulos WHERE paisaje_id=' + options.paisaje_id 
  },

  render: function () {
  	var _this =  this;
    
    this._model.fetch({
      success: function(data){
      	if(data.get('rows').length > 0)
        	_this.$el.html(_this._template({articles:data.get('rows')}));
      }
    });
  	return this;
  }
});