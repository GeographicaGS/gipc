"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		_ = require('underscore'),
		config = require('../Config.js');

		Backbone.$ = $;

module.exports = Backbone.Model.extend({ 

	initialize: function(options){
    this._attributesCollection = options.collection;
  },

	url: function(){
    return 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT ' + this._attributesCollection.attributesToArray().toString() + ', cartodb_id as id,bibliograf,cat_color,cat_ipce,descripcio,local_punt,nombre,provincia FROM table_100_paisajes_culturales where cartodb_id =' + this.get('id')
  },

  parse: function(response) {
    return response.rows[0];
  }

});