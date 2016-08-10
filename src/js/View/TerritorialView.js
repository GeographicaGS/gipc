"use strict";
var BaseView = require('./BaseView'),
		config = require('../Config.js');

module.exports = BaseView.extend({
	
	_template: require('../template/territorial_template.html'),

  initialize: function(options) {
  	this.map = options.map
  	this._collection = new Backbone.Collection([
  	{
  		'id':0,
  		'title':'Prerromanos',
  		'enable':false,
  		'vis':'https://' + config.username +'.carto.com/api/v2/viz/d5b30104-598f-11e6-a374-0e3ff518bd15/viz.json'
  	},
  	{
  		'id':1,
  		'title':'Dominio cartaginés',
  		'enable':false,
  		'vis':'https://' + config.username +'.carto.com/api/v2/viz/dd4934dc-5990-11e6-a069-0ecd1babdde5/viz.json'
  	},
  	{
  		'id':2,
  		'title':'Dominio cartaginés',
  		'enable':false,
  		'vis':'https://' + config.username +'.carto.com/api/v2/viz/8a447d74-598f-11e6-9ef8-0ecd1babdde5/viz.json'
  	},
  	{
  		'id':3,
  		'title':'Siglo VI',
  		'enable':false,
  		'vis':'https://' + config.username +'.carto.com/api/v2/viz/6a173352-598f-11e6-abad-0e05a8b3e3d7/viz.json'
  	},
  	{
  		'id':4,
  		'title':'814',
  		'enable':false,
  		'vis':'https://' + config.username +'.carto.com/api/v2/viz/31256562-5991-11e6-9d0d-0e3ff518bd15/viz.json'
  	},
  	{
  		'id':5,
  		'title':'1210',
  		'enable':false,
  		'vis':'https://' + config.username +'.carto.com/api/v2/viz/057e6378-5991-11e6-a78a-0e3ebc282e83/viz.json'
  	},
  	{
  		'id':6,
  		'title':'1360',
  		'enable':false,
  		'vis':'https://' + config.username +'.carto.com/api/v2/viz/f2ba1f96-598d-11e6-8d23-0e3ebc282e83/viz.json'
  	},
  	{
  		'id':7,
  		'title':'1715',
  		'enable':false,
  		'vis':'https://' + config.username +'.carto.com/api/v2/viz/84c23e52-5991-11e6-bfe1-0e3ebc282e83/viz.json'
  	},
  	{
  		'id':8,
  		'title':'1833',
  		'enable':false,
  		'vis':'https://' + config.username +'.carto.com/api/v2/viz/38f8f0fc-5990-11e6-b303-0ecd1babdde5/viz.json'
  	}
		]);
  },

  events: {
  	'click .mapbutton': '_togglePanel',
  	'click svg circle': '_toggleTerritory'
  },

  render: function () {
    this.$el.html(this._template());
  	return this;
  },

  _togglePanel:function(){
  	this.$('#territorial').toggleClass('active');
  },

  _toggleTerritory:function(e){
  	var _this = this;
  	var id = parseInt($(e.currentTarget).attr('index'));
  	
  	var model = this._collection.where({'enable':true})[0];
  	if(model && model.get('id') != id)
  		model.set('enable',false);

  	model = this._collection.get(id);
  	model.set('enable', !model.get('enable'))

  	this.$('svg #marcadores_interior circle').attr('fill','#1F252C')
  	this.$('svg #textos >g').attr('class','');

  	if(this.currentLayer)
  		this.currentLayer.remove()

  	if(model.get('enable')){

  		var color = $(this.$('svg #marcadores_borde path')[model.get('id')]).attr('fill');	
  		$(e.currentTarget).attr('fill', color);
  		$(this.$('svg #textos >g')[model.get('id')]).attr('class','active');

  		cartodb.createLayer(this.map, model.get('vis'), {'legends' : false})
	    .addTo(this.map)
	    .on('done', function(layer) {
	    	_this.currentLayer = layer.setZIndex(1);
	    	layer.setInteraction(true);
	    })
	    .on('error', function(err) {
	      console.log(err);
	    });

  	}
  }

});