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
    return response.rows;
  }

});