"use strict";
var BaseView = require('./BaseView'),
    HeaderView = require('./HeaderView'),
    config = require('../Config.js')
;

module.exports = BaseView.extend({
	
	_template: require('../template/articles_template.html'),
  _template_loading: require('../template/loading_template.html'),

  initialize: function(options) {
    this._headerView = new HeaderView();
  },

  render: function () {
    var _this = this;
  	this.$el.html('<div id="articles"></div>');
    this.$('#articles').prepend(this._headerView.render().el);
    this.$el.append(this._template_loading());
    var articles = new Backbone.Model();
    articles.url = 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT a.cartodb_id as id,a.autor,a.titulo,a.extracto,t.cat_color,a.paisaje_id FROM articulos a left join table_100_paisajes_culturales t on t.cartodb_id = a.paisaje_id ORDER BY CASE WHEN a.paisaje_id IS NULL THEN 0 ELSE 1 END, a.titulo ASC';
    articles.fetch({
      success: function(data){
        _this.$('.loading').remove();
        _this.$('#articles').append(_this._template({'articles':data.get('rows')}));
        _this.$('#articles').addClass('active');
      }
    });
  	return this;
  },

  remove: function(){
    Backbone.View.prototype.remove.call(this);
    if(this._headerView)
      this._headerView.remove();
  }
});