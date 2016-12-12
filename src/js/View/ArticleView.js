"use strict";
var BaseView = require('./BaseView'),
    HeaderView = require('./HeaderView'),
    config = require('../Config.js')
;

module.exports = BaseView.extend({
	
	_template: require('../template/article_template.html'),
  _template_loading: require('../template/loading_template.html'),

  initialize: function(options) {
    this._headerView = new HeaderView({type:"article"});
    this._id = options.id;
  },

  render: function () {
    var _this = this;
  	this.$el.html('<div id="article"></div>');
    this.$('#article').prepend(this._headerView.render().el);
    this.$el.append(this._template_loading());
    var article = new Backbone.Model();
    article.url = 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT a.paisaje_id, a.autor,a.titulo,a.extracto,a.info_autor,a.contenido, t.modo_narrativo FROM articulos a left join table_100_paisajes_culturales t on t.cartodb_id = a.paisaje_id where a.cartodb_id=' + this._id;
    article.fetch({
      success: function(data){
        _this.$('.loading').remove();
        _this.$('#article').append(_this._template({'article':data.get('rows')[0]}));
        _this.$('#article').addClass('active');
        if(data.get('rows')[0].modo_narrativo){
        	_this.$('.header').append('<a class="land ' + data.get('rows')[0].modo_narrativo + '" jslink href="/' + data.get('rows')[0].modo_narrativo + '/' + data.get('rows')[0].paisaje_id + '">Ver paisaje</a>')
        }
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