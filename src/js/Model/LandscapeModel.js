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
    return 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT ' + this._attributesCollection.attributesToArray().toString() + ', ST_X(the_geom) as lng, ST_Y(the_geom) as lat, cartodb_id as id,bibliograf,cat_color,cat_ipce,descripcio,local_punt,nombre,provincia FROM table_100_paisajes_culturales where cartodb_id =' + this.get('id')
  },

  parse: function(response) {
    return response.rows[0];
  },

  generateFilters:function(){
    var filters = [];
    var _this = this;
    _.each(this._attributesCollection.toJSON(), function(f) {
      var attributes = 
      _.filter(
        _.map(f.attributes, function(a){ 
          if(_this.get(a.name_column))
            return a;
          else
            return null
        }),
      function(obj){ return obj != null });
      if(attributes.length > 0)
        filters.push({'grupo':f.grupo, 'attributes':attributes})
    });

    return filters;
  }

});