"use strict";
var BaseView = require('./BaseView'),
		LandscapeModel =  require('../Model/LandscapeModel');

module.exports = BaseView.extend({
	
	_template: require('../template/tab_template.html'),
	_template_info: require('../template/tab_info_template.html'),
	_template_loading: require('../template/loading_template.html'),

  initialize: function(options) {
  	 _.bindAll(this, '_onModelFetched');

  	this._collection = options.collection;
  	this.listenTo(this._collection,'reset',this._onModelFetching);
  	this._collection.attributesToArray();
  	this._model = new LandscapeModel({'collection':this._collection});
  },

  events: {
  	'click': '_closePanel',
  },

  render: function () {
    this.$el.html(this._template());
  	return this;
  },

  _closePanel:function(){
  	this.$('#tab').removeClass('active');
  },

  setCartoId:function(id){
    this._model.set({'id':id});
  },

  renderTab:function(){
  	this.$('.wrapper').html(this._template_loading());
  	this.$('#tab').addClass('active');
  	if(this._collection.length > 0)
	  	this._model.fetch({
	      success: this._onModelFetched
	    })
  },

  _onModelFetching:function(){
  	if(this._model.get('id'))
  		this._onModelFetched();
  },

  _onModelFetched:function(){
  	this.$('.wrapper').html(this._template_info());
  	var _this = this;
  	setTimeout(function(){ 
  		_this.$('.wrapper .info').addClass('active');
  	}, 100);
  }


});