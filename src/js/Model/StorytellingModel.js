"use strict";

var LandscapeModel = require('./LandscapeModel'),
		config = require('../Config.js');

module.exports = LandscapeModel.extend({ 

	url: function(){
    return 'https://' + config.username + '.carto.com/api/v2/sql?q=with m as(SELECT paisaje_id, ST_AsGeoJSON(ST_Envelope(ST_Union (the_geom))) as bbox FROM modos_narrativos_point where paisaje_id=' + this.get('id') + ' group by paisaje_id) SELECT ' + this._attributesCollection.attributesToArray().toString() + ',m.bbox,t.cartodb_id as id,t.bibliograf,t.cat_color,t.cat_ipce,t.descripcio,t.local_punt,t.nombre,t.provincia, pn.url_visualizacion, sec.titulo_secuencia FROM table_100_paisajes_culturales t LEFT JOIN m on m.paisaje_id = t.cartodb_id LEFT JOIN paisajes_modos_narrativos pn on pn.id_paisaje = t.cartodb_id LEFT JOIN storytelling_secuencia sec on sec.id_paisaje = t.cartodb_id  where t.cartodb_id =' + this.get('id')
  },

  parse: function(response) {
  	var response = response.rows[0]
  	if(response.bbox)
  		response.bbox = JSON.parse(response.bbox).coordinates[0];
    return response;
  }

});