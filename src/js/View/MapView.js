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
    if(options.intro)
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
    this._currentMap = 1;
    this.App = require('../App');
  },

  events: {
    // 'click #intro': '_loadLandscapes',
    'click #intro': '_showHtmlElements',
    'click #intro .choose': '_openfilters',
    'click .mapbutton': '_mapbuttonClicked',
    'click #attributes .content li, #attributes .all': '_filterLandscapes',
    'click .map_selector .peninsula': '_goToPeninsula',
    'click .map_selector .canary': '_goToCanary'
  },

  remove: function(){
    this.App.lastBound = this.map.getBounds();
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
    var _this = this;
  	this.$el.html('<div id="map"><img class="logo" src="/img/logo-narrando-paisajes.svg"><div class="map_selector"><a class="peninsula" href="#"></a><a class="canary" href="#"></a></div><a class="articles_link" href="/articles" jslink>Artículos relacionados</a></div>');
    
    // if(this._introView)
  	 // this.$el.append(this._introView.render().$el);
    // else
    //   this._loadLandscapes();

    this.$el.append(this._categoryView.render().$el);
    this.$el.append(this._attributeView.render().$el);
    this.$el.append(this._tabView.render().$el);

  	this.map = new L.Map(this.$('#map')[0], {
      zoomControl : false,
      scrollWheelZoom: true
    });

    new L.Control.Zoom({ position: 'bottomleft' }).addTo(this.map);

    this._baseLayer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',{ attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>' });
    this._baseLayer.addTo(this.map);

    // https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png
    // this._baseDark._url = 'https://4.maps.nlp.nokia.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/jpg?lg=eng&token=A7tBPacePg9Mj_zghvKt9Q&app_id=KuYppsdXZznpffJsKT24';
    // this._baseDark.redraw();

    this.map.setView(config.coordinates, config.zoom);

    setTimeout(function(){
       _this.map.invalidateSize();
      if(_this.App.lastBound)
        _this.map.fitBounds(_this.App.lastBound);
      else
        _this.map.fitBounds([[27.6378, -18.1612],[43.7924, 4.32778]]);

    },100);

    this.map.on('zoomend', function() {
      if(_this._currentMap == 1 && _this.map.getZoom() >= 14){
        _this._currentMap = 2;
        _this._baseLayer._url = 'https://1.maps.nlp.nokia.com/maptile/2.1/maptile/newest/hybrid.day/{z}/{x}/{y}/256/png8?lg=eng&token=A7tBPacePg9Mj_zghvKt9Q&app_id=KuYppsdXZznpffJsKT24';
        _this._baseLayer.redraw();
      }else if(_this._currentMap == 2 && _this.map.getZoom() < 14){
        _this._currentMap = 1;
        _this._baseLayer._url = 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';
        _this._baseLayer.redraw();
      }
    });

    this._territorialView = new TerritorialView({'map':this.map});
    this.$el.append(this._territorialView.render().$el);


    this._naturalSpacesView = new NaturalSpacesView({'map':this.map});
    this.$el.append(this._naturalSpacesView.render().$el);

    this._linearSystemView = new LinearSystemView({'map':this.map});
    this.$el.append(this._linearSystemView.render().$el);

    if(this._introView){
     this.$el.append(this._introView.render().$el);
    }else{
      this._showHtmlElements();
    }

   this._loadLandscapes();

    // if(this._introView)
    //  this.$el.append(this._introView.render().$el);
    // else
    //   this._loadLandscapes();
	
  	return this;
  },

  _showHtmlElements:function(){
    this.$('#categories').addClass('active');
    this.$('.mapbutton').addClass('enable');
    this.$('.articles_link').addClass('enable');
    this.$('#map').addClass('active');
  },

  _loadLandscapes:function(){
  	var _this = this;

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
        cartocss: '#table_100_paisajes_culturales {   marker-fill-opacity: 1;   marker-line-color: #FFF;   marker-line-width: 0;   marker-line-opacity: 0.5;   marker-placement: point;   marker-type: ellipse;   marker-width: 10;   marker-allow-overlap: true;}#table_100_paisajes_culturales[zoom<=5]{marker-width: 6;}#table_100_paisajes_culturales[cat_ipce="Paisajes Agricolas, Ganaderos y Forestales"] {   marker-fill: #23a880;}#table_100_paisajes_culturales[cat_ipce="Paisajes Industriales"] {   marker-fill: #c4ae4e;}#table_100_paisajes_culturales[cat_ipce="Paisajes Simbolicos"] {   marker-fill: #0a9bcd;}#table_100_paisajes_culturales[cat_ipce="Paisajes Urbanos, Historicos y Defensivos"] {   marker-fill: #ff4800;}',
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
          // var App = this.App = require('../App');
          _this.App.router.navigate($(this).find('.navigate').attr('href'),{trigger: true})
        }else{
          _this._tabView.renderTab();
          _this.infowindow.model.set('visibility', false);
        }
      });

      var sql_torque = 'SELECT cat_color, ST_AsGeoJSON(the_geom) as geom FROM table_100_paisajes_culturales where modo_narrativo is not null'
      _this._loadTorque(sql_torque);

    })
    .on('error', function(err) {
      console.log(err);
    });

    // cartodb.createLayer(this.map, {
    //     type: "torque",
    //     options: {
    //       query: "SELECT (CASE WHEN cat_ipce='Paisajes Agricolas, Ganaderos y Forestales' THEN 1 WHEN cat_ipce='Paisajes Industriales' THEN 2 WHEN cat_ipce='Paisajes Simbolicos' THEN 3 WHEN cat_ipce='Paisajes Urbanos, Historicos y Defensivos' THEN 4 END) as cat_ipce_v, the_geom_webmercator, cartodb_id,generate_series(1,26,1) as t FROM table_100_paisajes_culturales where modo_narrativo is not null",
    //       user_name: config.username,
    //       tile_style: this._torque_cartocss()
    //       }
    //   },{time_slider: false}).addTo(this.map)
    //   .done(function(layer) {
    //     layer.setZIndex(998);
    //     _this.torqueLayer = layer
    //   }).
    //   on('error', function(err) {
    //     console.log(err);
    //   });

  },

  _loadTorque:function(sql){
    var _this = this;
    var outstanding = new Backbone.Model()
    outstanding.url = 'https://' + config.username + '.carto.com/api/v2/sql?q=' + sql;
    outstanding.fetch({
      success: function(data){
        var geoms = [];
        data = data.toJSON().rows;
        for(var i=0; i<data.length; i++){
          geoms.push({
            'type': 'Feature',
            'properties': {'color': data[i].cat_color},
            "geometry": JSON.parse(data[i].geom)
          });
        }


        var geojsonMarkerOptions = {
            radius: 1.2,
            weight: 0,
            fillOpacity: 0,
            className:'outstanding_map',
            clickable:false
        };

        _this.torqueLayer = L.geoJson(geoms,{
          pointToLayer: function (feature, latlng) {
            if(feature.properties.color == 'red')
              geojsonMarkerOptions.color = '#ff4800';
            else if(feature.properties.color == 'blue')
              geojsonMarkerOptions.color = '#0a9bcd';
            else if(feature.properties.color == 'green')
              geojsonMarkerOptions.color = '#23a880';
            else if(feature.properties.color == 'yellow')
              geojsonMarkerOptions.color = '#c4ae4e';

              return L.circleMarker(latlng, geojsonMarkerOptions);
          }
        }).addTo(_this.map);
      }
    });
  },

  _filterLandscapes:function(){
    var sql = 'SELECT * FROM table_100_paisajes_culturales where ' + this._categories.getSQL();
    var sql_torque = 'SELECT cat_color, ST_AsGeoJSON(the_geom) as geom FROM table_100_paisajes_culturales where modo_narrativo is not null and ' + this._categories.getSQL()
    // var sql_torque = "SELECT (CASE WHEN cat_ipce='Paisajes Agricolas, Ganaderos y Forestales' THEN 1 WHEN cat_ipce='Paisajes Industriales' THEN 2 WHEN cat_ipce='Paisajes Simbolicos' THEN 3 WHEN cat_ipce='Paisajes Urbanos, Historicos y Defensivos' THEN 4 END) as cat_ipce_v, the_geom_webmercator, cartodb_id,generate_series(1,26,1) as t FROM table_100_paisajes_culturales where modo_narrativo is not null AND " + this._categories.getSQL();
    if(this._attributes.toJSON().length > 0){
      sql += ' AND ' + this._attributes.getSQL();
      sql_torque += ' AND ' + this._attributes.getSQL();
    }

    this.landscapeLayer.getSubLayer(0).setSQL(sql);
    this.map.removeLayer(this.torqueLayer);
    this._loadTorque(sql_torque);
    // this.torqueLayer.clearLayers();
    // this.torqueLayer.setSQL(sql_torque);
    // this.torqueLayer.setStep(1);
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
  },

  _goToPeninsula:function(e){
    this.map.fitBounds(config.peninsula);
  },

  _goToCanary:function(e){
    this.map.fitBounds(config.canary);
  }

});