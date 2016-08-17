"use strict";
var config = require('../Config.js'),
    BaseView = require('./BaseView'),
		IntroView = require('./IntroView'),
		CategoryCollection = require('../Collection/CategoryCollection'),
    CategoryView = require('./CategoryView'),
    AttributeView = require('./AttributeView'),
    AttributeCollection = require('../Collection/AttributeCollection'),
    TabView = require('./TabView'),
    TerritorialView = require('./TerritorialView'),
    NaturalSpacesView = require('./NaturalSpacesView'),
    LinearSystemView = require('./LinearSystemView')
;

module.exports = BaseView.extend({
	
	_template_info_window_landScape: require('../template/infoWindowLandScape_template.html'),
  _torque_cartocss: require('../template/cartoCss/torque_cartocss.html'),

  initialize: function(options) {
    $('body').addClass('notScroll');
  	this._introView = new IntroView();
  	this._categories = new CategoryCollection([
  		{
  			'title':'Paisajes Agricolas, Ganaderos y Forestales',
  			'enable':true
  		},
      {
        'title':'Paisajes Simbolicos',
        'enable':true
      },
  		{
  			'title':'Paisajes Industriales',
  			'enable':true
  		},
  		{
  			'title':'Paisajes Urbanos, Historicos y Defensivos',
  			'enable':true
  		}
  	]);
    this._categoryView = new CategoryView({'collection':this._categories});
    this.listenTo(this._categories,'change',this._filterLandscapes);

    this._attributes =  new AttributeCollection();
    this._attributeView = new AttributeView({'collection':this._attributes});

    this._tabView = new TabView({'collection':this._attributes});
  },

  events: {
    'click #intro': '_loadLandscapes',
    'click #intro .choose': '_openfilters',
    'click .mapbutton': '_mapbuttonClicked',
    'click #attributes .content li, #attributes .all': '_filterLandscapes'
  },

  remove: function(){
    $('body').removeClass('notScroll');
    Backbone.View.prototype.remove.call(this);

  	if(this._introView)
  		this._introView.remove();

    if(this._categoryView)
      this._categoryView.remove();

    if(this._attributeView)
      this._attributeView.remove();

    if(this._tabView)
      this._tabView.remove();

    if(this._territorialView)
      this._territorialView.remove();

  },

  render: function () {
  	this.$el.html('<div id="map"></div>');
  	this.$el.append(this._introView.render().$el);
    this.$el.append(this._categoryView.render().$el);
    this.$el.append(this._attributeView.render().$el);
    this.$el.append(this._tabView.render().$el);

  	this.map = new L.Map(this.$('#map')[0], {
      zoomControl : false,
      scrollWheelZoom: false
    });

    new L.Control.Zoom({ position: 'bottomleft' }).addTo(this.map);

    L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',{ attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>' })
    .addTo(this.map);

    this.map.setView(config.coordinates, config.zoom);

    var _this = this;
    setTimeout(function(){
       _this.map.invalidateSize();
    },100);

    this._territorialView = new TerritorialView({'map':this.map});
    this.$el.append(this._territorialView.render().$el);


    this._naturalSpacesView = new NaturalSpacesView({'map':this.map});
    this.$el.append(this._naturalSpacesView.render().$el);

    this._linearSystemView = new LinearSystemView({'map':this.map});
    this.$el.append(this._linearSystemView.render().$el);
	
  	return this;
  },

  _loadLandscapes:function(){
  	var _this = this;
    this.$('#categories').addClass('active');
    this.$('.mapbutton').addClass('enable');

  	// cartodb.createLayer(this.map, 'http://gipc-admin.carto.com/api/v2/viz/a629110e-598e-11e6-a374-0e3ff518bd15/viz.json', {'legends' : false})
   //  .addTo(this.map)
   //  .on('done', function(layer) {
    	
   //  	layer.setInteraction(true);
   //    var sublayer = layer.getSubLayer(0);
   //    sublayer.setInteraction(true);
   //    // sublayer.setInteractivity
      
   //    sublayer.setSQL('select * from table_100_paisajes_culturales where ' + _this._categories.getSQL());
   //   	// sublayer.infowindow.set('template', _this._template_info_window_landScape());

   //  })
   //  .on('error', function(err) {
      
   //  });

    cartodb.createLayer(this.map, {
      user_name: config.username,
      type: 'cartodb',
      sublayers: [{
        sql: "SELECT * FROM table_100_paisajes_culturales",
        cartocss: '#table_100_paisajes_culturales {   marker-fill-opacity: 1;   marker-line-color: #FFF;   marker-line-width: 0;   marker-line-opacity: 0.5;   marker-placement: point;   marker-type: ellipse;   marker-width: 10;   marker-allow-overlap: true;}#table_100_paisajes_culturales[cat_ipce="Paisajes Agricolas, Ganaderos y Forestales"] {   marker-fill: #23a880;}#table_100_paisajes_culturales[cat_ipce="Paisajes Industriales"] {   marker-fill: #c4ae4e;}#table_100_paisajes_culturales[cat_ipce="Paisajes Simbolicos"] {   marker-fill: #0a9bcd;}#table_100_paisajes_culturales[cat_ipce="Paisajes Urbanos, Historicos y Defensivos"] {   marker-fill: #ff4800;}',
        interactivity: ['cartodb_id', 'nombre', 'provincia','cat_color']
      }]
    })
    .addTo(this.map)
    .on('done', function(layer) {
      layer.setZIndex(999);
      _this.landscapeLayer = layer

      _this.infowindow = cartodb.vis.Vis.addInfowindow(_this.map, layer.getSubLayer(0), ['cartodb_id', 'nombre', 'provincia','cat_color','modo_narrativo'],{
        infowindowTemplate: _this._template_info_window_landScape(),
      });

      layer.on('featureClick', function(e, latlng, pos, data) {
          _this._tabView.setCartoId(data.cartodb_id);
      });

      $('.cartodb-infowindow').on('click', '#info_landScape .interactive', function(){
        if($(this).find('.navigate').length > 0){
          var App = this.App = require('../App');
          App.router.navigate($(this).find('.navigate').attr('href'),{trigger: true})
        }else{
          _this._tabView.renderTab();
          _this.infowindow.model.set('visibility', false);
        }
      });

    })
    .on('error', function(err) {
      console.log(err);
    });

    cartodb.createLayer(this.map, {
        type: "torque",
        options: {
          query: "SELECT (CASE WHEN cat_ipce='Paisajes Agricolas, Ganaderos y Forestales' THEN 1 WHEN cat_ipce='Paisajes Industriales' THEN 2 WHEN cat_ipce='Paisajes Simbolicos' THEN 3 WHEN cat_ipce='Paisajes Urbanos, Historicos y Defensivos' THEN 4 END) as cat_ipce_v, the_geom_webmercator, cartodb_id,generate_series(1,26,1) as t FROM table_100_paisajes_culturales where modo_narrativo is not null",
          user_name: config.username,
          tile_style: this._torque_cartocss()
          }
      },{time_slider: false}).addTo(this.map)
      .done(function(layer) {
        layer.setZIndex(998);
        _this.torqueLayer = layer
      }).
      on('error', function(err) {
        console.log(err);
      });

  },

  _filterLandscapes:function(){
    var sql = 'SELECT * FROM table_100_paisajes_culturales where ' + this._categories.getSQL();
    var sql_torque = "SELECT (CASE WHEN cat_ipce='Paisajes Agricolas, Ganaderos y Forestales' THEN 1 WHEN cat_ipce='Paisajes Industriales' THEN 2 WHEN cat_ipce='Paisajes Simbolicos' THEN 3 WHEN cat_ipce='Paisajes Urbanos, Historicos y Defensivos' THEN 4 END) as cat_ipce_v, the_geom_webmercator, cartodb_id,generate_series(1,26,1) as t FROM table_100_paisajes_culturales where modo_narrativo is not null AND " + this._categories.getSQL();
    if(this._attributes.toJSON().length > 0){
      sql += ' AND ' + this._attributes.getSQL();
      sql_torque += ' AND ' + this._attributes.getSQL();
    }

    this.landscapeLayer.getSubLayer(0).setSQL(sql);
    this.torqueLayer.setSQL(sql_torque);
    this.torqueLayer.setStep(1);
  },

  _mapbuttonClicked:function(e){
    var _this = this;
    $(e.currentTarget).toggleClass('active');
    var others = this.$('.mapbutton.active').not(e.currentTarget);
    _.each(others, function(el) {
      $(el).removeClass('active');
      _this.$('div[id=' + $(el).attr('panel') + ']').removeClass('active');
    });
  },

  _openfilters:function(){
    this.$('.mapbutton.attributes').trigger('click');
  }

});