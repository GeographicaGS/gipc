"use strict";
var BaseView = require('./BaseView'),
    AttributeCollection = require('../Collection/AttributeCollection'),
    StorylineModel = require('../Model/StorylineModel'),
    StoryInfoPanelView = require('./StoryInfoPanelView'),
    config = require('../Config.js')
    ;

module.exports = BaseView.extend({
	
	_template: require('../template/storyline_template.html'),
  _template_content: require('../template/storyline_content_template.html'),
  _template_loading: require('../template/loading_template.html'),

  initialize: function(options) {
    _.bindAll(this,'_onModelFetched');
    var _this = this;
    this._attributes =  new AttributeCollection();
    this._model = new StorylineModel({'id':options.id, 'collection':this._attributes});
    
    this.listenTo(this._attributes,'reset',function(){
      _this._model.fetch({
        success: _this._onModelFetched
      })
    });

    this._attributes.fetch({'reset':true});

  },

  events: {
    'click .show_video':'_fullVideo',
    'click .show_info':'_showInfo',
    'click .info_button': '_fullInfo',
    'click .full_info .panel .close': '_closeFullInfo'
  },

  remove: function(){
    Backbone.View.prototype.remove.call(this);

    if(this._storyInfoPanelView)
      this._storyInfoPanelView.remove();
  },

  render: function () {
  	this.$el.html(this._template());
    this.$el.append(this._template_loading());
  	return this;
  },

  _onModelFetched:function(){
    var _this = this;
    this._storyInfoPanelView = new StoryInfoPanelView({'model':this._model})
    this.$('.loading').remove();
    this.$('#storyline').addClass('active');
    this.$('.content').addClass(this._model.get('cat_color'));
    this.$('.media').css({'background-image':'url("/img/gallery/thumbnail/' + this._model.get('id') + '.jpg")'});
    
    this.$('.content').html(this._template_content({'m':this._model.toJSON()}));
    this.$('.content').append(this._storyInfoPanelView.render().el);

    this.map = new L.Map(this.$('.map')[0], {
      zoomControl : false,
      scrollWheelZoom: false,
    });

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
        _this.$('.content .description span').remove();
        _this.$('.media').css({'background-image':''});
        _this.$('.media').html(_this._template_loading());
        var model = new Backbone.Model()
        model.url = 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT media_url FROM modos_narrativos_point WHERE cartodb_id =' + data.cartodb_id;
        model.fetch({
          success: function(data){
            _this.$('.show_video').addClass('active');
            _this.$('.media').html('<iframe src="//player.vimeo.com/video/' + data.get('rows')[0].media_url + '?autoplay=1&color=2b2f35&loop=1" height="100%" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
          }
        });
      });

    })
    .on('error', function(err) {
      console.log(err);
    });
  },

  _fullVideo:function(e){
    e.preventDefault();
    this.$('#storyline').addClass('full_video');
  },

  _showInfo:function(e){
    e.preventDefault();
    this.$('#storyline').removeClass('full_video');
  },

  _fullInfo:function(e){
    $(e.currentTarget).toggleClass('active');
    this.$('.full_info').toggleClass('active');
  },
  _closeFullInfo:function(){
    this.$('.info_button').removeClass('active');
  }

});