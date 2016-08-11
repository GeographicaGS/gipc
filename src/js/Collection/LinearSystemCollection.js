"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		_ = require('underscore'),
		config = require('../Config.js');

		Backbone.$ = $;

module.exports = Backbone.Collection.extend({ 

	url: function(){
    return 'https://' + config.username + '.carto.com/api/v2/sql?q=with q as (SELECT distinct tipo,subcategor FROM sistemaslineales)SELECT tipo, json_agg(json_build_object(\'camino\',subcategor,\'enable\',false)) as caminos FROM q group by tipo order by tipo'
  },

  parse: function(response) {
  	var response = response.rows;

  	_.map(response, function(r){
  		r.caminos = _.filter(r.caminos, function(c){ return c.camino != null;})
  		return r;
  	});


    return response;
  },

  getSQL:function(){
  	var sql = '';
  	_.each(this.toJSON(),function(t){
  		if(_.where(t.caminos,{'enable':true}).length >= 1 || (t.caminos.length == 0 && t.enable)){
  			sql += '(tipo=\'' + t.tipo + '\' ';  

  			if(_.where(t.caminos,{'enable':false}).length == 0){
  				sql += ') or ';
	  		}else{
	  			sql += 'and ('
	  			_.each(t.caminos,function(c,i) {
	  				if(c.enable){
	  					sql += 'subcategor=\'' + c.camino + '\' or '
	  				}
	  			});
	  			sql = sql.slice(0,-3) + ')) or ';
	  		}
  		}
  	});
		
		return sql.length == 0 ? false : sql.slice(0, -3);

	}

});