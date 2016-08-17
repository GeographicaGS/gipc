"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		_ = require('underscore');

		Backbone.$ = $;

module.exports = Backbone.Collection.extend({ 

	parse: function(response) {
    return response.rows;
  }

});