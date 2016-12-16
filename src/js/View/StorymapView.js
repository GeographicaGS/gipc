"use strict";
var StorylineView = require('./StorylineView'),
    HeaderView = require('./HeaderView'),
    AttributeCollection = require('../Collection/AttributeCollection'),
    StoryMapModel = require('../Model/StoryMapModel'),
    StoryInfoPanelView = require('./StoryInfoPanelView'),
    ArticleButtonView = require('./ArticleButtonView'),
    config = require('../Config.js')
    ;

module.exports = StorylineView.extend({
	
	_template: require('../template/storymap_template.html'),
  _template_content: require('../template/storymap_content_template.html'),
  _template_loading: require('../template/loading_template.html'),

  initialize: function(options) {
    _.bindAll(this,'_onModelFetched');
    var _this = this;
    this._headerView = new HeaderView();
    this._attributes =  new AttributeCollection();
    this._model = new StoryMapModel({'id':options.id, 'collection':this._attributes});
    
    this.listenTo(this._attributes,'reset',function(){
      _this._model.fetch({
        success: _this._onModelFetched
      })
    });

    this._attributes.fetch({'reset':true});

  },

  events: {
    'click .intro .next':'_nextIntro',
    'click .description .back':'_backIntro',
    'click .description .next':'_closeIntro',
    'click .info_button': '_fullInfo',
    'click .full_info .panel .close': '_closeFullInfo',
    'click .media .close': '_closeVideo',
  },

  render: function () {
    this.$el.html(this._template());
    this.$('#storymap').prepend(this._headerView.render().el);

    this._articleButtonView = new ArticleButtonView({paisaje_id:this._model.get('id')});
    this.$('.header').append(this._articleButtonView.render().$el);

    this.$el.append(this._template_loading());
    return this;
  },

  _onModelFetched:function(){
    var _this = this;
    this._storyInfoPanelView = new StoryInfoPanelView({'model':this._model, 'thumbnail':true})
    this.$('.loading').remove();
    this.$('#storymap').addClass('active');
    this.$('.content').addClass(this._model.get('cat_color'));

    this.$('.content').html(this._template_content({'m':this._model.toJSON()}));
    this.$('.content').append(this._storyInfoPanelView.render().el);

    this.map = new L.Map(this.$('.map')[0], {
      zoomControl : false,
      scrollWheelZoom: true,
    });

    L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',{ attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>' })
      .addTo(this.map);

    _this.map.fitBounds(L.latLngBounds(this._model.get('bbox')[1].reverse(), this._model.get('bbox')[3].reverse()));

    new L.Control.Zoom({ position: 'bottomleft' }).addTo(this.map);

    cartodb.createLayer(this.map, 'https://' + config.username +'.carto.com/api/v2/viz/' + this._model.get('url_visualizacion') + '/viz.json', {'legends' : false, 'infowindow':false})
    .addTo(this.map)
    .on('done', function(layer) {
      if(layer.type == "namedmap"){
        layer = layer.getSubLayer(layer.layers.length-1);
        layer.setInteraction(true);
      }else{
        // layer.setInteraction(true);
        layer.getSubLayer(1).setInteraction(true);
        layer.setInteractivity('cartodb_id')
      }

      layer.on('mouseover', function(e, latlng, pos, data) {
        $(_this.map._container).css('cursor', 'pointer');
      });

      layer.on('mouseout', function(e, latlng, pos, data) {
        $(_this.map._container).css('cursor', 'auto');
      });

      layer.on('featureClick', function(e, latlng, pos, data) {
        _this.$('.media').html(_this._template_loading());
        _this.$('.media').addClass('active');
        var model = new Backbone.Model()
        model.url = 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT media_url,tipo_media,titulo_video,descripcion_video FROM modos_narrativos_point WHERE cartodb_id =' + data.cartodb_id;
        model.fetch({
          success: function(data){
            if(data.get('rows')[0].tipo_media == 'video'){
              _this.$('.media').html('<div class="video"><div class="close"></div><iframe src="//player.vimeo.com/video/' + data.get('rows')[0].media_url + '?autoplay=1&color=2b2f35&loop=1" height="100%" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>');
              
              if(data.get('rows')[0].titulo_video || data.get('rows')[0].descripcion_video)
                _this.$('.media').append('<div class="video_info"><h5>' + data.get('rows')[0].titulo_video + '</h5><p>' + data.get('rows')[0].descripcion_video + '</p></div>');

            }else{
              var bgImg = new Image();
              bgImg.onload = function(){
                _this.$('.media').html('<div class="video"><div class="close"></div><img src="' + bgImg.src + '"></div>');
                if(data.get('rows')[0].titulo_video || data.get('rows')[0].descripcion_video)
                  _this.$('.media').append('<div class="video_info"><h5>' + data.get('rows')[0].titulo_video + '</h5><p>' + data.get('rows')[0].descripcion_video + '</p></div>');
              };
              bgImg.src = data.get('rows')[0].media_url;
            }
          }
        });
      });

    })
    .on('error', function(err) {
      console.log(err);
    });
  },

  _nextIntro:function(){
  	this.$('.intro .title').addClass('go_left');
  	this.$('.intro .description').removeClass('go_right');
  },

  _backIntro:function(){
  	this.$('.intro .title').removeClass('go_left');
  	this.$('.intro .description').addClass('go_right');
  },

  _closeIntro:function(){
  	this.$('.intro').addClass('inactive');
  	this.$('.map_content').addClass('active');
  },

  _fullInfo:function(e){
    $(e.currentTarget).toggleClass('active');
    this.$('.full_info').toggleClass('active');
  },

  _closeFullInfo:function(){
    this.$('.info_button').removeClass('active');
  },

  _closeVideo:function(){
  	this.$('.media .video iframe').attr('src','');
    this.$('.media').removeClass('active');
    this.$('.map').html();
  }

});