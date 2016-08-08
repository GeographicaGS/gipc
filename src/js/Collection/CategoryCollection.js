"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		_ = require('underscore');

		Backbone.$ = $;

module.exports = Backbone.Collection.extend({ 

	getSQL:function(){
		var sql = '(',
				categories = this.where({'enable':true});

		if(categories.length == 0)
			return 'false';

		_.each(categories, function(el) {
			sql += 'cat_ipce=\'' + el.get('title') + '\' or '
		});
		return sql.slice(0,-3) + ')';
	}

});