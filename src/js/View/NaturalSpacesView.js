"use strict";
var BaseView = require('./BaseView'),
    NaturalSpacesCollection = require('../Collection/NaturalSpacesCollection'),
    config = require('../Config.js')
    ;

module.exports = BaseView.extend({
	
	_template: require('../template/natural_spaces_template.html'),

  initialize: function(options) {
  	this.map = options.map
    this._collection = new NaturalSpacesCollection([
    {
      'title':'Espacio Naturales Protegidos',
      'enable':false
    },
    {
      'title':'LIC',
      'enable':false
    },
    {
      'title':'Parque Nacional',
      'enable':false
    },
    // {
    //   'title':'Ramsar',
    //   'enable':false
    // },
    {
      'title':'Reserva Biosfera',
      'enable':false
    }
    // {
    //   'title':'ZEPA',
    //   'enable':false
    // }

    ]);
  },

  events: {
    'click .mapbutton': '_togglePanel',
    'click .spaces ul li': '_loadSpace',
    'click .header_natural .all': '_loadAll'
  },

  render: function () {
    this.$el.html(this._template({'spaces':this._collection.toJSON()}));
  	return this;
  },

  _togglePanel:function(){
    this.$('#natural_spaces').toggleClass('active');
  },

  _loadSpace:function(e){
    $(e.currentTarget).toggleClass('active');
    var model = this._collection.findWhere({'title':$(e.currentTarget).text()});
    model.set('enable', !model.get('enable'));
    if(this._collection.where({'enable':false}).length == 0){
      this.$('.header_natural .all').removeClass('unselect');
    }else{
      this.$('.header_natural .all').addClass('unselect');
    }
    this._loadLayer()
  },

  _loadAll:function(e){
    $(e.currentTarget).toggleClass('unselect');
    var enable = $(e.currentTarget).hasClass('unselect') ? false:true;
    if(enable){
      this.$('.spaces ul li').addClass('active');
      this._collection.enableAll();
    }else{
      this.$('.spaces ul li').removeClass('active');
      this._collection.disableAll();
    }

    this._loadLayer()
  },

  _loadLayer:function(){
    var _this = this;
    if(this._layer){

      this._layer.setSQL('SELECT * FROM espaciosprotegidos where ' + this._collection.getSQL())

    }else{
      cartodb.createLayer(this.map, 'https://' + config.username +'.carto.com/api/v2/viz/05d867e2-5a22-11e6-aa4f-0e05a8b3e3d7/viz.json', {'legends' : false})
      .addTo(this.map)
      .on('done', function(layer) {
        layer.setZIndex(2);
        layer.setInteraction(true);
        _this._layer = layer.getSubLayer(0).setSQL('SELECT * FROM espaciosprotegidos where ' + _this._collection.getSQL())
      })
      .on('error', function(err) {
        console.log(err);
      });
    }
  }

});