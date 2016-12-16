"use strict";
var BaseView = require('./BaseView');

module.exports = BaseView.extend({
	
	_template: require('../template/attribute_template.html'),
  _template_list: require('../template/attribute_list_template.html'),

  initialize: function(options) {
    
    _.bindAll(this,'_drawAttributes');

  	this._collection = options.collection;
    this.listenTo(this._collection,'reset',this._drawAttributes);
  },

  events: {
  	'click .mapbutton': '_togglePanel',
    'click li': '_toggleAttribute',
    'click .all': '_toggleAll'
  },

  render: function () {
  	this.$el.html(this._template());
    this._collection.fetch({'reset':true});
  	return this;
  },

  _togglePanel:function(){
  	this.$('#attributes').toggleClass('active');
  },

  _drawAttributes:function(){
    // this.$('.content').html(this._template_list({'elements':this._collection}));
    this.$('.content').html(this._template_list({'elements':this._collection.toJSON()}));
  },

  _toggleAttribute:function(e){
    
    var column = $(e.currentTarget).attr('column');
    // _.each(this._collection.toJSON(),function(col) {
    //   var attribute = _.findWhere(col.attributes, {name_column: column});
    //   if(attribute)
    //     attribute.enable = !attribute.enable;
    // });
    var attribute = this._collection.findWhere({'name_column':column})
    if(this._collection.where({'enable':false}).length == 0){
      _.each(this._collection.models,function(a) {
        a.set('enable',false);
      });
      attribute.set('enable',true)
      this.$('li').not(e.currentTarget).removeClass('active');
    }else{
      $(e.currentTarget).toggleClass('active');
      if(attribute)
          attribute.set('enable',!attribute.get('enable'))
    }

    if(this.$('li').not('.active').length > 0){
      this.$('.all').addClass('unselect');
      this.$('.mapbutton').addClass('filter');
    }else{
      this.$('.all').removeClass('unselect');
      this.$('.mapbutton').removeClass('filter');
    }
  },

  _toggleAll:function(e){
    $(e.currentTarget).toggleClass('unselect');
    var enable = $(e.currentTarget).hasClass('unselect') ? false:true;
    // _.each(this._collection.toJSON(),function(col) {
    //   _.each(col.attributes, function(a) {
    //     a.enable = enable;
    //   });
    // });
    _.each(this._collection.models,function(a) {
      a.set('enable',enable);
    });

    if(enable)
      this.$('.mapbutton').removeClass('filter');
    else
      this.$('.mapbutton').addClass('filter');

    this._drawAttributes();
  }

});