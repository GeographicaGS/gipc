"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		_ = require('underscore'),
		config = require('../Config.js');

		Backbone.$ = $;

module.exports = Backbone.Model.extend({ 

	initialize: function(options){
    this.options = options;
  },

	url: function(){
    return 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT color, longitud, ST_AsGeoJSON(ST_Envelope(the_geom)) as bbox from sistemaslineales where tipo=\'' + this.options.type + '\'' + (this.options.road ? 'and subcategor=\'' + this.options.road + '\'':'');
  },

  parse: function(response) {
  	var response = response.rows[0]
  	response.bbox = JSON.parse(response.bbox).coordinates[0];
    return response;
  }

});