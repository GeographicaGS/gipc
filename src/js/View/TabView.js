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
  	'click .info': '_preventClose',
  	'click .info .close': '_closePanel'
  },

  render: function () {
    this.$el.html(this._template());
  	return this;
  },

  _closePanel:function(){
  	this.$('#tab').removeClass('active');
  },

  _preventClose:function(e){
  	e.stopPropagation();
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
  	var _this = this;

  	// var filters = [];
  	// _.each(this._collection.toJSON(), function(f) {
  	// 	var attributes = 
  	// 	_.filter(
  	// 		_.map(f.attributes, function(a){ 
	  // 			if(_this._model.get(a.name_column))
	  // 				return a;
	  // 			else
	  // 				return null
	  // 		}),
  	// 	function(obj){ return obj != null });
  	// 	if(attributes.length > 0)
  	// 		filters.push({'grupo':f.grupo, 'attributes':attributes})
  	// });

  	this.$('.wrapper').html(this._template_info({'m':this._model.toJSON(), 'filters':this._model.generateFilters()}));
  	this._drawMap();
  	
  	setTimeout(function(){ 
  		_this.$('.wrapper .info').addClass('active');
  	}, 100);
  },

  _drawMap:function(){
  	
  	var location = [this._model.get('lat'),this._model.get('lng')];

    var map = new L.Map(this.$('.location_image')[0], {
      zoomControl : false,
      doubleClickZoom:false,
      dragging:false,
      scrollWheelZoom:false
    });

    L.tileLayer('https://1.maps.nlp.nokia.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8?lg=es&token=A7tBPacePg9Mj_zghvKt9Q&app_id=KuYppsdXZznpffJsKT24', {
    }).addTo(map);


    map.setView(location, 18);

    var color;
    if(this._model.get('cat_color') == 'yellow')
    	color = '#c4ae4e';
    else if(this._model.get('cat_color') == 'green')
    	color = '#23a880';
    else if(this._model.get('cat_color') == 'red')
    	color = '#ff4800';
    else if(this._model.get('cat_color') == 'blue')
    	color = '#0a9bcd';

    var circleOptions = {
        radius: 5,
        weight: 0,
        fillOpacity: 1,
        clickable:false,
        color: color
    };
    
    L.circleMarker(location, circleOptions).addTo(map);

  }


});