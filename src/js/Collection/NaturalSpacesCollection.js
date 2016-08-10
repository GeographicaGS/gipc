"use strict";

var $ = require('jquery'),
		Backbone = require('backbone'),
		_ = require('underscore')
		;

		Backbone.$ = $;

module.exports = Backbone.Collection.extend({ 

  getSQL:function(){
		var sql = '(';

		_.each(this.toJSON(), function(el) {
			if(el.enable)
					sql += 'tipo=\'' + el.title + '\' or '
		});
		if(sql.length <= 1)
			return false;

		return sql.slice(0,-4) + ')';
	},

	enableAll:function(){
		_.each(this.models, function(m) {
			m.set('enable',true);
		});
	},

	disableAll:function(){
		_.each(this.models, function(m) {
			m.set('enable',false);
		});
	}


});