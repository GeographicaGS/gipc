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
    return 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT color from sistemaslineales where tipo=\'' + this.options.type + '\'' + (this.options.road ? 'and subcategor=\'' + this.options.road + '\'':'');
  },

  parse: function(response) {
    return response.rows[0];
  }

});