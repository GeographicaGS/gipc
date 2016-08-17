"use strict";
var BaseView = require('./BaseView'),
    CartoCollection = require('../Collection/CartoCollection'),
    AttributeCollection = require('../Collection/AttributeCollection'),
    StorytellingModel = require('../Model/StorytellingModel'),
    config = require('../Config.js')
    ;

module.exports = BaseView.extend({
	
	_template: require('../template/storytelling_template.html'),
  _template_content: require('../template/storytelling_content_template.html'),
  _template_loading: require('../template/loading_template.html'),

  initialize: function(options) {
    _.bindAll(this,'_onModelFetched');
    var _this = this;
    this._attributes =  new AttributeCollection();
    this._secuences =  new CartoCollection();
    this._secuences.url = 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT sec.id_paisaje,atr.cartodb_id as id, atr.nombre_opcion, atr.url_secuencia, atr.modo_secuencia  FROM storytelling_secuencia sec INNER JOIN storytelling_secuencia_atributos atr on sec.cartodb_id = atr.id_secuencia where sec.id_paisaje=' + options.id + ' order by orden_opcion'
    this._model = new StorytellingModel({'id':options.id, 'collection':this._attributes});
    
    this.listenTo(this._secuences,'reset',function(){
      _this._attributes.fetch({'reset':true});
    });

    this.listenTo(this._attributes,'reset',function(){
      _this._model.fetch({
        success: _this._onModelFetched
      })
    });

    this._secuences.fetch({'reset':true});

  },

  events: {
    'click .video_wrapper .close': '_closeVideo',
    'click .secuence_list li': '_selectSecuence'
  },

  render: function () {
  	this.$el.html(this._template());
    this.$el.append(this._template_loading());
  	return this;
  },

  _onModelFetched:function(){
    var _this = this;
    this.$('.loading').remove();
    this.$('.content').addClass(this._model.get('cat_color'));
    var filters = [];
    _.each(this._attributes.toJSON(), function(f) {
      var attributes = 
      _.filter(
        _.map(f.attributes, function(a){ 
          if(_this._model.get(a.name_column))
            return a;
          else
            return null
        }),
      function(obj){ return obj != null });
      if(attributes.length > 0)
        filters.push({'grupo':f.grupo, 'attributes':attributes})
    });
    this.$('.content').html(this._template_content({'m':this._model.toJSON(), 'filters':filters, 'secuences':this._secuences.toJSON()}));

    var _this = this;

    setTimeout(function(){
       _this.$('.gallery img').addClass('active');
    },2000);

    if(this._model.get('url_visualizacion')){
      this.map = new L.Map(this.$('.map')[0], {
        zoomControl : false,
        scrollWheelZoom: false,
        doubleClickZoom:false,
        dragging:false
      });

      L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',{ attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>' })
      .addTo(this.map);

      if(this._model.get('bbox'))
        _this.map.fitBounds(L.latLngBounds(this._model.get('bbox')[1].reverse(), this._model.get('bbox')[3].reverse()));

      cartodb.createLayer(this.map, 'https://' + config.username +'.carto.com/api/v2/viz/' + this._model.get('url_visualizacion') + '/viz.json', {'legends' : false, 'infowindow':false})
      .addTo(this.map)
      .on('done', function(layer) {
        if(layer.type == "namedmap"){
          layer = layer.getSubLayer(layer.layers.length-1);
          layer.setInteraction(true);
        }else{
          layer.setInteraction(true);
          layer.getSubLayer(0).setInteraction(true);
          layer.setInteractivity('cartodb_id')
        }

        layer.on('mouseover', function(e, latlng, pos, data) {
          $(_this.map._container).css('cursor', 'pointer');
        });

        layer.on('mouseout', function(e, latlng, pos, data) {
          $(_this.map._container).css('cursor', 'auto');
        });

        layer.on('featureClick', function(e, latlng, pos, data) {
          var model = new Backbone.Model()
          _this.$('.map .video_wrapper').addClass('active');
          _this.$('.map .video_wrapper .video').html(_this._template_loading());
          model.url = 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT media_url FROM modos_narrativos_point WHERE cartodb_id =' + data.cartodb_id;
          model.fetch({
            success: function(data){
              _this.$('.map .video_wrapper .video').html('<iframe src="//player.vimeo.com/video/' + data.get('rows')[0].media_url + '?autoplay=1&color=2b2f35&loop=1" height="600" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
            }
          });
        });

      })
      .on('error', function(err) {
        console.log(err);
      });
    }

    if(this._secuences.length > 0){
      this._loadSecuence(this._secuences.toJSON()[0].id)
    }

    this.$('.content').addClass('active');
    _.bindAll(this, '_scrolling');
    $(window).scroll(this._scrolling);

  },

  _scrolling:function(){
    this.$('.gallery').removeClass('full_height');
    // if(this.map)
    //   this.map.invalidateSize();
  },

  _closeVideo:function(){
    this.$('.map .video_wrapper iframe').attr('src','');
    this.$('.map .video_wrapper').removeClass('active');
    this.$('.map .video_wrapper .video').html();
  },

  _selectSecuence:function(e){
    this.$('.secuence_list li').removeClass('active');
    $(e.currentTarget).addClass('active');
    this._loadSecuence(parseInt($(e.currentTarget).attr('carto_id')));
  },

  _loadSecuence:function(id){
    var model = this._secuences.get(id);
    var _this = this;
    this.$('#sec_vis').addClass('mask');
    if(model.get('modo_secuencia') == 'mapa'){
      this.$('#sec_vis').removeClass('image')
      setTimeout(function(){
        _this.$('#sec_vis').children().remove()
        cartodb.createVis(_this.$('#sec_vis')[0], 'http://gipc-admin.carto.com/api/v2/viz/' + model.get('url_secuencia') + '/viz.json', {'legends' : true, 'search':false, 'zoomControl':false, 'shareable':false, 'infowindow':true, 'scrollWheelZoom':false})
        .done(function(vis, layers) {
          new L.Control.Zoom({ position: 'bottomleft' }).addTo(vis.getNativeMap());
          _this.$('#sec_vis').removeClass('mask');
         }).on('error', function(err) {
          console.log(err);
        });

      },200);

    }else{
      setTimeout(function(){
        _this.$('#sec_vis').addClass('image')
        _this.$('#sec_vis').css({'background-image':'url("/img/secuences/' + model.get('id_paisaje') + '/' + model.get('url_secuencia') + '"'})
          _this.$('#sec_vis').removeClass('mask');
      },200);
    }
  }

});