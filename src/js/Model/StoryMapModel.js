"use strict";

var StorylineModel = require('./StorylineModel'),
		config = require('../Config.js');

module.exports = StorylineModel.extend({ 

	url: function(){
    return 'https://' + config.username + '.carto.com/api/v2/sql?q=SELECT ST_AsGeoJSON(ST_Envelope(m.the_geom)) as bbox, ' + this._attributesCollection.attributesToArray().toString() + ',t.cartodb_id as id,t.bibliograf,t.cat_color,t.cat_ipce,t.descripcio,t.local_punt,t.nombre,t.provincia, pn.url_visualizacion FROM table_100_paisajes_culturales t LEFT JOIN modos_narrativos_polygon m on m.paisaje_id = t.cartodb_id LEFT JOIN paisajes_modos_narrativos pn on pn.id_paisaje = t.cartodb_id where t.cartodb_id =' + this.get('id')
  }

});