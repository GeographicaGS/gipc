"use strict";
var BaseView = require('./BaseView'),
    LinearSystemCollection = require('../Collection/LinearSystemCollection'),
    config = require('../Config.js');;

module.exports = BaseView.extend({
	
	_template: require('../template/linear_system_template.html'),
  _template_list: require('../template/linear_system_list_template.html'),

  initialize: function(options) {
  	this.map = options.map
    this._collection = new LinearSystemCollection();
    this.listenTo(this._collection,'reset',this._drawLinearSystem);
  },

  events: {
    'click .mapbutton': '_togglePanel',
  	'click li.type': '_expandType',
    'click li.road': '_toggleRoad',
    'click li.type >.check': '_toggleType'
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

    _.findWhere(this._collection.findWhere({'tipo':type}).get('caminos'), {camino: $(e.currentTarget).find('span').text()}).enable = active;

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
    if(!(model.get('caminos').length  == 0 || model.get('caminos').length == 1 &&  model.get('caminos')[0].camino == null)){
      _.map(model.get('caminos'), function(c){ 
        c.enable = active;
        return c; 
      });
    }else{
      model.set('enable',active);
    }

    this._loadLayer();
  },

  _loadLayer:function(){
    // var _this = this;
    // cartodb.createLayer(this.map, 'https://' + config.username +'.carto.com/api/v2/viz/5b21585e-5990-11e6-8026-0e3ff518bd15/viz.json', {'legends' : false})
    //   .addTo(this.map)
    //   .on('done', function(layer) {
    //     _this.layer = layer.setZIndex(3);
    //     layer.setInteraction(true);
    //   })
    //   .on('error', function(err) {
    //     console.log(err);
    //   });
  }

});