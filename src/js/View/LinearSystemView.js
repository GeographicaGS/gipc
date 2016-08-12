"use strict";
var BaseView = require('./BaseView'),
    LinearSystemCollection = require('../Collection/LinearSystemCollection'),
    LinearSystemModel = require('../Model/LinearSystemModel'),
    config = require('../Config.js');

module.exports = BaseView.extend({
	
	_template: require('../template/linear_system_template.html'),
  _template_list: require('../template/linear_system_list_template.html'),
  _template_carto_css: require('../template/cartoCss/linear_system.html'),

  initialize: function(options) {
  	this.map = options.map
    this._collection = new LinearSystemCollection();
    this.listenTo(this._collection,'reset',this._drawLinearSystem);

    var _this = this;
    cartodb.createLayer(this.map, 'https://' + config.username +'.carto.com/api/v2/viz/74de9e62-5fcd-11e6-8df3-0e05a8b3e3d7/viz.json', {'legends' : false})
    .on('done', function(layer) {
      layer.setInteraction(false);
      _this._layer_buffer_20 = layer
    })
    .on('error', function(err) {
      console.log(err);
    });

    cartodb.createLayer(this.map, 'https://' + config.username +'.carto.com/api/v2/viz/c13240e8-5fcd-11e6-a625-0ecd1babdde5/viz.json', {'legends' : false})
    .on('done', function(layer) {
      layer.setInteraction(false);
      _this._layer_buffer_40 = layer
    })
    .on('error', function(err) {
      console.log(err);
    });

  },

  events: {
    'click .mapbutton': '_togglePanel',
  	'click li.type': '_expandType',
    'click li.road': '_toggleRoad',
    'click li.type >.check': '_toggleType',
    'click .proximity li':'_changeProximity',
    'click ul li .selector': '_selectRoad',
    'click #linear_system_popup .area a': '_toggleArea'
  },

  render: function () {
  	this.$el.html(this._template());
    this._collection.fetch({'reset':true});
  	return this;
  },

  _togglePanel:function(){
    this.$('#linear_system').toggleClass('active');
  },

  _drawLinearSystem:function(){
    this.$('.content').html(this._template_list({'types':this._collection.toJSON()}));
  },

  _expandType:function(e){
    if($(e.currentTarget).find('ul li').length > 0){
      $(e.currentTarget).toggleClass('expand');
    }else{
      $(e.currentTarget).toggleClass('active');
      var type = $(e.currentTarget).find('>span').text();
      var active = $(e.currentTarget).hasClass('active') ? true:false;
      this._collection.findWhere({'tipo':type}).set('enable',active);
      if(active)
        this.map.setView(config.coordinates, config.zoom);
      this._loadLayer();
    }
  },

  _toggleRoad:function(e){
    e.stopPropagation();
    $(e.currentTarget).toggleClass('active');

    var type = $(e.currentTarget).closest('.type').find('>span').text();
    var active = $(e.currentTarget).hasClass('active') ? true:false;

    if($(e.currentTarget).closest('ul').find('li').not('.active').length > 0)
      $(e.currentTarget).closest('.type').removeClass('active');
    else
      $(e.currentTarget).closest('.type').addClass('active');

    var model = _.findWhere(this._collection.findWhere({'tipo':type}).get('caminos'), {camino: $(e.currentTarget).find('span').text()});
    model.enable = active;
    if(active)
      this.map.setView(model.centroid);

    this._loadLayer();
  },

  _toggleType:function(e){
    e.stopPropagation();
    var li = $(e.currentTarget).closest('li');
    var type = li.find('>span').text();
    li.toggleClass('active');
    var active = li.hasClass('active') ? true:false;
    if(active)
      li.find('.road').addClass('active')
    else
      li.find('.road').removeClass('active')

    var model = this._collection.findWhere({'tipo':type});
    if(model.get('caminos').length > 0){
      _.map(model.get('caminos'), function(c){ 
        c.enable = active;
        return c; 
      });
    }else{
      model.set('enable',active);
    }

    if(active)
      this.map.setView(config.coordinates, config.zoom);

    this._loadLayer();
  },

  _loadLayer:function(){
    if(this._layer){
      this._layer.setSQL('SELECT * FROM sistemaslineales where ' + this._collection.getSQL());
      if($('ul li .selector.active').length > 0){
        $('ul li .selector.active').removeClass('active');
        this._resetCartoCss();
        this._removeBuffer();
      }
    }else{
      var _this = this;
      cartodb.createLayer(this.map, 'https://' + config.username +'.carto.com/api/v2/viz/5b21585e-5990-11e6-8026-0e3ff518bd15/viz.json', {'legends' : false})
      .addTo(this.map)
      .on('done', function(layer) {
        layer.setZIndex(3);
        layer.setInteraction(true);
        _this._layer = layer.getSubLayer(0).setSQL('SELECT * FROM sistemaslineales where ' + _this._collection.getSQL());
      })
      .on('error', function(err) {
        console.log(err);
      });

    }
  },

  _changeProximity:function(e){
    this.$('.proximity span').text($(e.currentTarget).text());
    this._collection['buffer'] = parseInt($(e.currentTarget).attr('prox'));
  },

  _selectRoad:function(e){
    e.stopPropagation();
    var _this = this;
    $('ul li .selector').not(e.currentTarget).removeClass('active');
    
    this.$('#linear_system_popup .area a').removeClass('active');
    this.$('#linear_system_popup .area a:not([buffer])').addClass('active');
    this._removeBuffer();

    $(e.currentTarget).toggleClass('active');
    var type = $(e.currentTarget).attr('type');
    var road = $(e.currentTarget).attr('road');
    if($(e.currentTarget).hasClass('active')){
      this._layer.setCartoCSS(this._template_carto_css({'opacity':'0.25', 'type':type, 'road':road}));
      var model = new LinearSystemModel({'type':type, 'road':road});
      model.fetch(
        {
          success: function(data){
            _this.$('#linear_system_popup .type').text(type);
            _this.$('#linear_system_popup .road').text(road);
            _this.$('#linear_system_popup .longitude').text(Math.floor(parseFloat(data.get('longitud')) * 100) / 100 + ' Km');
            _this.$('#linear_system_popup').removeClass();
            _this.$('#linear_system_popup').addClass('active');
            _this.$('#linear_system_popup').addClass(data.get('color'));
            _this.map.fitBounds(L.latLngBounds(data.get('bbox')[1].reverse(), data.get('bbox')[3].reverse()));
        }
      });
    }else{
      this._resetCartoCss();
    }
  },

  _resetCartoCss:function(){
    this._layer.setCartoCSS(this._template_carto_css({'opacity':'0.7','type':null}));
    this.$('#linear_system_popup').removeClass('active');
  },

  _toggleArea:function(e){
    e.preventDefault();
    this.$('#linear_system_popup .area a').not(e.currentTarget).removeClass('active');
    this.$(e.currentTarget).toggleClass('active');
    var buffer = $(e.currentTarget).attr('buffer')
    var type = $('#linear_system_popup .type').text();
    var road = $('#linear_system_popup .road').text()

    this._removeBuffer(); 
    if(buffer == 'buffer_20'){
      this._layer_buffer_20.getSubLayer(0).setSQL('SELECT * FROM buffer_20km WHERE tipo=\'' + type + '\'' + (road ? 'and subcategor=\'' + road + '\'':''));
      this._layer_buffer_20.addTo(this.map);

    }else if(buffer == 'buffer_40'){
      this._layer_buffer_40.getSubLayer(0).setSQL('SELECT * FROM Buffer_40km WHERE tipo=\'' + type + '\'' + (road ? 'and subcategor=\'' + road + '\'':''));
      this._layer_buffer_40.addTo(this.map);
    }

  },

  _removeBuffer:function(){
    this._layer_buffer_20.remove();
    this._layer_buffer_40.remove();
  }

});