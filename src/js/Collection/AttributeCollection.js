"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		_ = require('underscore'),
		config = require('../Config.js');

		Backbone.$ = $;

module.exports = Backbone.Collection.extend({ 

	url: function(){
    // return 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT grupo, json_agg(json_build_object(\'description\',description,\'name_column\',name_column)) as attributes FROM diccionario_paisajes where grupo is not null group by grupo order by grupo'
    return 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT description, name_column FROM diccionario_atributos_paisajes order by description'
  },

  parse: function(response) {
  	var response = response.rows;
  	_.each(response, function(r) {
  		// _.each(r.attributes, function(a) {
  			// a['enable'] = true;
  		// });
  		r['enable'] = true;
  	});
    return response;
  },

  getSQL:function(){

		// var sql = '(';

		// _.each(this.toJSON(), function(el) {
		// 	_.each(el.attributes,function(a) {
		// 		if(a.enable)
		// 			sql += a.name_column + ' or '
		// 	});
		// });
		// if(sql.length <= 1)
		// 	return false;

		// return sql.slice(0,-4) + ')';
		var sql = '(';

		_.each(this.toJSON(), function(a) {
			if(a.enable)
				sql += a.name_column + ' or '
		});
		if(sql.length <= 1)
			return false;

		return sql.slice(0,-4) + ')';
	},

	attributesToArray:function(){
		// var result = [];
		// _.each(this.toJSON(), function(col) {
		// 	_.each(col.attributes, function(a) {
		// 		result.push(a.name_column);
		// 	});
		// });
		// return result;
		var result = [];
		_.each(this.toJSON(), function(a) {
			result.push(a.name_column);
		});
		return result;
	},

});