var urls = [
    "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
    "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
    "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
];

var map = new OpenLayers.Map({
    div: "map",
    layers: [
        new OpenLayers.Layer.XYZ("OSM (with buffer)", urls, {
            transitionEffect: "resize", buffer: 2, sphericalMercator: true,
            attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
        }),
        new OpenLayers.Layer.XYZ("OSM (without buffer)", urls, {
            transitionEffect: "resize", buffer: 0, sphericalMercator: true,
            attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
        })
    ],
    controls: [
        new OpenLayers.Control.Navigation({
            dragPanOptions: {
                enableKinetic: true
            }
        }),
        new OpenLayers.Control.PanZoom(),
        new OpenLayers.Control.Attribution()
    ],
    center: [711287,6937523],
    zoom: 9
});

map.addControl(new OpenLayers.Control.LayerSwitcher());

 var myStyles = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    pointRadius: "20", // sized according to type attribute
                    fillColor: "#ffcc66",
                    strokeColor: "#ff9933",
                    strokeWidth: 2,
                    graphicZIndex: 1
                }),
                "select": new OpenLayers.Style({
                    fillColor: "#66ccff",
                    strokeColor: "#3399ff",
                    graphicZIndex: 2
                })
            });
var geojson_format = new OpenLayers.Format.GeoJSON();

var vector_layer = new OpenLayers.Layer.Vector('Outdoor', myStyles );


map.addLayer(vector_layer);
vector_layer.addFeatures(geojson_format.read(featurecollection));


var sel_feature = new OpenLayers.Control.SelectFeature(
	vector_layer,
	{
		clickout: false, toggle: false,
		multiple: false, hover: false,
		toggleKey: "ctrlKey", // ctrl key removes from selection
		multipleKey: "shiftKey", // shift key adds to selection
		box: false
	}  );

map.addControl ( sel_feature );

sel_feature.activate();

vector_layer.events.on({
"featureselected": function(e) {


  var x=document.getElementById("text");
  var this_content  = "<h1 id='title'>Outdoor Locatie: " + e.feature.attributes['locNaam'] + "</h1>" +  e.feature.attributes['locOmschri']  ;

  this_content += "<table width=100%><td><input type=checkbox CHECKED id=a1/>Activiteit 1: Zwemmen";
  this_content += "<br/><input type=checkbox CHECKED id=a2/>Activiteit 2: Fietsen";

  this_content += "</td><td><img src=test.jpg></td></table>";

x.innerHTML = this_content + "<br/>";


 // <div id="text">
 //             <h1 id="title">Outdoor Locaties</h1>




}
} );




