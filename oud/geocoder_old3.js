var map;
var vector_layerLL;
var vector_layer;
var gg = new OpenLayers.Projection("EPSG:900913");
var sm = new OpenLayers.Projection("EPSG:4326");
//Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.040,49.910,465.840,-0.40939,0.35971,-1.86849,4.0772";
var rd = new OpenLayers.Projection("EPSG:28992");
var labelKolom = "";
var debugOnOff = false;
var startKolom = 5;
var xKolom = 1;


function import_excel()
{
    if (debugOnOff)
    {
        startKolom = 6;
        xKolom = 2;
    }
    else
    {
        startKolom = 5;
        xKolom = 1;    
    }
    var veld_type_array = new Array('Kies datatype', 'volledig adres', 'straat', 'huisnummer', 'toevoeging', 'postcode', 'woonplaats', 'land', 'label');

    var batch_content = "<h2>Upload Data met GeometrieProvider<div style='display:inline' id=import_exec></div></h2><div id=upload_result_table></div><div id=tekst_upload_eerste_regel>Kopieer vanuit Excel de data hierin:&nbsp;&nbsp;&nbsp;<input id=check_eerste_regel type=checkbox />Eerste regel bevat kolomnamen<br/><textarea style=\"width:98%;\" rows=15 id=batch_upload></textarea><br/><button id=upload_check_button class=\"more-space\">Data interpreteren</button><br/></div><input id=settings_menu type=hidden value=\"12\" /><br>";
 
    $("#upload_check_button").click(function()
    {
        var eerste_regel_checked = $("input[name='check_eerste_regel']").is(':checked');

        var all_data = new Array();
 
        // Haal nu de attributen op die bij deze Layer/Functie horen

        var regels = $("#batch_upload").val().split("\n");

        var clean_data = "";
        if (regels.length > 0)
        {
            var top_row = "";
            $("#tekst_upload_eerste_regel").hide();
            var split_type = 1;
            var array_eerste_regel = regels[0].split("\t");
            var nr_columns = array_eerste_regel.length;
            if (nr_columns == 1)
            {
                var array_eerste_regel = regels[0].split(";");
                var nr_columns = array_eerste_regel.length;
                split_type = 2;
            }

            top_row = "<tr>";
            top_row += "<th>Kies</th>";
            if (debugOnOff)
            {
                top_row += "<th>Provider</th>";
            }
            top_row += "<th>X</th><th>Y</th><th>Lat</th><th>Lon</th>";

            var extra_kol_keuzes = "";
            for ( j = 0; j < veld_type_array.length; j++)
            {
                extra_kol_keuzes += "<option value='" + j + "'>" + veld_type_array[j] + "</option>";
            }

            for ( i = 0; i < array_eerste_regel.length; i++)
            {

                if ((array_eerste_regel[i] != "" ) && (eerste_regel_checked))
                {

                    top_row += "<th>" + array_eerste_regel[i] + "<br/>";
                    top_row += "<select id='excel_" + i + "'>" + extra_kol_keuzes + "</select></th>";

                } else
                {
                    top_row += "<th><select id='excel_" + i + "'>" + extra_kol_keuzes + "</select></th>";

                }
            }
            top_row += "</tr>";

            var content = "";
            var start = 0;
            if (eerste_regel_checked)
            {
                start = 1;
            }
            for ( j = start; j < regels.length; j++)
            {

                if (split_type == 1)
                {
                    var array_regel = regels[j].split("\t");

                } else
                {
                    var array_regel = regels[j].split(";");

                }

                if (nr_columns == array_regel.length)
                {
                    var deze_regel = "";
                    content += "<tr>";
                    content += "<td>" + j + "</td>";
                    if (debugOnOff)
                    {
                        content += '<td id="prov' + j + '"></td>';
                    }
                    content += '<td id="x' + j + '"></td>';
                    content += '<td id="y' + j + '"></td>';
                    content += '<td id="lat' + j + '"></td>';
                    content += '<td id="lon' + j + '"></td>';

                    for ( i = 0; i < array_regel.length; i++)
                    {
                        content += "<td>" + array_regel[i] + "</td>";

                        if (deze_regel != "")
                        {
                            deze_regel += ";";
                        }
                        deze_regel += array_regel[i];
                    }

                    content += "</tr>";

                    all_data[j] = deze_regel;
                }

            }
            $("#outputTab").html("<table cellspacing=\"5\" cellpadding=\"5\" border=\"0\"><tr><td width=\"200px\"><button id=execute_import class=\"more-space\">Geocoding uitvoeren</button></td><td>Zoeken in: </td><td>&nbsp;</td><td>&nbsp</td></tr></table><br /><table id=gridtable>" + top_row + content + "</table>");
            $("#tabs a[name='outputTab']").trigger('click');
            $("#execute_import").click(function()
            {
                $(this).css("background-color", "#D9D9D9");
                labelKolom = "";

                var data_post =
                {
                };

                var new_regel = "";
                $("[id^=excel]").each(function(i)
                {

                    if (new_regel != "")
                    {
                        new_regel += ";";
                    }
                    new_regel += $(this).val();
                    if ($(this).val() == 8)
                    {
                        labelKolom = i + startKolom;
                    }

                });

                data_post["excel_attributen"] = new_regel;

                data_post['ts'] = new Date().getTime();

                var url_send_excel_data = "send_excel_data.php";

                var start = 0;
                if (eerste_regel_checked)
                {
                    start = 1;
                }
                for ( k = start; k < all_data.length; k++)
                {
                   data_post["excel_data"] = all_data[k];
//                   data_post["zoekRegio"] = $('input[name=radRegio]:checked').val();
					
					var search = "";
					var fields = all_data[k].split(";");
					var allowed = new_regel.split(";");
					for( var i = 0; i < fields.length; i++)
						if(allowed[i] > 0)
							search += fields[i] + " ";
							
					console.log("Attempt Bag");
                    GetBagGeocoder(search, function(data){
						if(data != undefined)
							SetValues(k, data.provider, data.lat, data.lng, data.x, data.y);
						else
						{
							console.log("Attempt Nominatim");
							GetNominatimGeocoder(search, function(data){
								if(data != undefined)
									SetValues(k, data.provider, data.lat, data.lng, data.x, data.y);
								else
								{
									console.log("Attempt Google");
									GetGoogleGeocoder(search, function(data){
										if(data != undefined)
											SetValues(k, data.provider, data.lat, data.lng, data.x, data.y);
									});
								}
							});
						}
					});
					
					
					/*
					$.ajax(
                    {
                        type : "POST",
                        async : false,
                        url : url_send_excel_data,
                        data : data_post,
                        dataType : "html",
                        timeout: 5000
                    }).done(function(result)
                        {
                            var coords = result.split(";");
                            if (result && coords.length > 0)
                            {
                                if ($("#x" + (k)).html() == "")
                                {
                                    if (debugOnOff == 1)
                                    {
                                        $("#prov" + (k)).html(coords[2]);
                                    }
                                    $("#x" + (k)).html(wgs842rd_x( coords[0],coords[1])); 
                                    $("#y" + (k)).html(wgs842rd_y( coords[0],coords[1]));
                                    $("#lat" + (k)).html(coords[0]);
                                    $("#lon" + (k)).html(coords[1]);
                                }
                            }
                            else  // geocoderen via ESRI of Google
                            {
									var search = "";
									var fields = all_data[k].split(";");
									var allowed = new_regel.split(";");
									for( var i = 0; i < fields.length; i++)
										if(allowed[i] > 0)
											search += fields[i] + " ";
									
									GetGoogleGeocoder(search, function(data){
										if(data.status == "ZERO_RESULTS")
											return;
										if (debugOnOff == 1)
										{
											$("#prov" + (k)).html("Google");
										}
										$("#x" + (k)).html(wgs842rd_x( data.results[0].geometry.location.lat, data.results[0].geometry.location.lng)); 
										$("#y" + (k)).html(wgs842rd_y( data.results[0].geometry.location.lat, data.results[0].geometry.location.lng));
										$("#lat" + (k)).html(data.results[0].geometry.location.lat);
										$("#lon" + (k)).html(data.results[0].geometry.location.lng);
									});
                            }
							
							/*
									var search = "";
									var fields = all_data[k].split(";");
									var allowed = new_regel.split(";");
									for( var i = 0; i < fields.length; i++)
										if(allowed[i] > 0)
											search += fields[i] + " ";
									
									GetNominatimGeocoder(search, function(data){
										if((!data || data.length < 1)
											return;
										if (debugOnOff == 1)
										{
											$("#prov" + (k)).html("Nominatim");
										}
										$("#x" + (k)).html(wgs842rd_x( data[0].lat, data[0].lon)); 
										$("#y" + (k)).html(wgs842rd_y( data[0].lat, data[0].lon));
										$("#lat" + (k)).html(data[0].lat);
										$("#lon" + (k)).html(data[0].lon);
									});
							
							
							*
							
							
							
                        }).fail(function(jqXHR, textStatus){
                            alert("Er is iets fout gegaan met het verbinden met de geocodeerservice");
                    });*/
                }
                $("#execute_import").css("background-color", "#96BF0D");

            });
            
        } 
        else
        {
            alert("Er is geen data opgegeven");
        }

    });
}

function initMapPDOK()
{
    var featurecollection =
    {
        "type" : "FeatureCollection",
        "features" : []
    };

    // create map
    map = new OpenLayers.Map(
    {
        div : "map",
        projection : gg,
        displayProjection : sm,
        theme : null,
        numZoomLevels : 18,
        //        tileManager: new OpenLayers.TileManager(),
        //controls : [new OpenLayers.Control.Attribution()],
        layers : [new OpenLayers.Layer.OSM("OpenStreetMap", null,
        {
            transitionEffect : 'resize'
        })]
    });

    map.setCenter(new OpenLayers.LonLat(5, 52).transform(map.displayProjection, map.projection), 8);
    map.addControl(new OpenLayers.Control.MousePosition());
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.addControl(new OpenLayers.Control.Zoom());
    map.addControl(new OpenLayers.Control.ScaleLine({bottomOutUnits: "", maxWidth:200}));
    

//    map.setCenter(new OpenLayers.LonLat(147971, 410845)// Center of the map
//    .transform(new OpenLayers.Projection("EPSG:28992"), // transform from new RD
//    map.getProjectionObject()), 14);
    // Zoom level

    var defaultStyle1 = new OpenLayers.Style(
    {
        externalGraphic: '../images/has.png',
        graphicWidth: 28,
        graphicHeight: 28,
        label: "${label}",  // gebruik van het attribuut van het feature genaamd label 
        labelYOffset: -20,
        labelOutlineColor: "RGB(219, 0, 47)",
        labelOutlineWidth: 3,
        fontColor: "white",
        fontWeight: "bold",
        fontSize: "12px"
    });

    var selectStyle1 = new OpenLayers.Style(
    {
        fillColor : 'blue',
        fillOpacity : 0.3,
        strokeWidth : 2.0,
        strokeColor : 'red',
        strokeOpacity : 1,
        pointRadius : 12,
        graphicName: "star"
    });

    var hoverStyle1 = new OpenLayers.Style(
    {
        fillColor : 'green',
        fillOpacity : 0.3,
        strokeWidth : 2.0,
        strokeColor : 'red',
        strokeOpacity : 1,
        pointRadius : 10
    });

    var WFSStyleMap1 = new OpenLayers.StyleMap(
    {
        'default' : defaultStyle1,
        'select' : selectStyle1,
        'hover' : hoverStyle1
    });
    var geojson_format = new OpenLayers.Format.GeoJSON();
    vector_layer = new OpenLayers.Layer.Vector("Output geocoding",
    {
        styleMap : WFSStyleMap1
    });
    vector_layerLL = new OpenLayers.Layer.Vector("Output geocoding",
    {
        styleMap : WFSStyleMap1
    });
    map.addLayer(vector_layerLL);
    vector_layerLL.addFeatures(geojson_format.read(featurecollection));

    var sel_feature = new OpenLayers.Control.SelectFeature(vector_layerLL,
    {
        clickout : false,
        toggle : false,
        multiple : false,
        hover : true,
        autoActivate: true,
        toggleKey : "ctrlKey", // ctrl key removes from selection
        multipleKey : "shiftKey", // shift key adds to selection
        box : false
    });

    map.addControl(sel_feature);

    sel_feature.activate();

    vector_layerLL.events.on(
    {
            'featureselected':function(evt){
                var popupText = "";
                $.each(evt.feature.attributes, function(attr) {
                    popupText += this + "<br>";
                });
                var feature = evt.feature;
                var popup = new OpenLayers.Popup.FramedCloud("popup",
                    OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
                    null,
                    "<div style='font-size:.8em'>" + popupText+"</div>",
                    null,
                    true
                );
                feature.popup = popup;
                map.addPopup(popup);
            },
            'featureunselected':function(evt){
                var feature = evt.feature;
                map.removePopup(feature.popup);
                feature.popup.destroy();
                feature.popup = null;
            }
    });
    var minX = 180;
    var maxX = -180;
    var minY = 180;
    var maxY = -180;
    
   $("#gridtable tr").each(function(recnr)
    {
        if (recnr > 0)
        {
            var xcoord;
            var ycoord;
            var lat;
            var lon;
            var point_feature;
            var point_featureLL;
            
            lat="";
            lon="";
            
            $.each(this.cells, function(i)
            {
                if (i == xKolom)
                {
                    xcoord = $(this).html();
               }
                if (i == xKolom + 1)
                {
                    ycoord = $(this).html();
                    var newPoint;
                    newPoint = new OpenLayers.Geometry.Point(xcoord, ycoord);
                    point_feature = new OpenLayers.Feature.Vector(newPoint);
 
                }
                if (i == xKolom + 2)
                {
                    lat = $(this).html();
                    if (lat != null && lat != "")
                    {
                        if (lat > maxY) maxY = lat;
                        if (lat < minY) minY = lat;
                    }
               }
                if (i == xKolom + 3)
                {
                    lon = $(this).html();
                    if (lon != null && lon != "")
                    {
                        if (lon > maxX) maxX = lon;
                        if (lon < minX) minX = lon;
                        var newPoint;
                        newPoint = new OpenLayers.Geometry.Point(lon, lat).transform(map.displayProjection, map.projection);
                        point_featureLL = new OpenLayers.Feature.Vector(newPoint);
                    }
                }
                if (i > xKolom + 3)
                {
                    point_feature.attributes['kolom'+i] = $(this).html();
                    if (lat != null && lat != "")
                    {
                        if (i == labelKolom)
                        {
                            point_featureLL.attributes['label'] = $(this).html();
                        }
                        else
                        {
                            point_featureLL.attributes['kolom'+i] = $(this).html();
                        }
                        
                    }
                }
            });
            vector_layer.addFeatures(point_feature);
            
            if (lat != null && lat != "")
            {
              vector_layerLL.addFeatures(point_featureLL);
            }
        }
    });
    vector_layerLL.refresh();
//    alert (vector_layer.features.length);
    if (vector_layerLL.features.length > 0)
    {
//        alert (minX + "<br>" + maxX + "<br>" + minY + "<br>" +maxY);
        map.zoomToExtent(new OpenLayers.Bounds(minX, minY, maxX, maxY).transform(map.displayProjection, map.projection));
        createLatLonJSON();
    }
    else
    {
        alert ("Er zijn nog geen punten op de kaart weer te geven");
    }
   
}

function createLatLonJSON()
{
    var myJSON = new OpenLayers.Format.GeoJSON({'internalProjection': gg, 'externalProjection': sm}).write(vector_layerLL.features, true);
    $("#showJSONLL").html(myJSON);
    var myJSON = new OpenLayers.Format.GeoJSON().write(vector_layer.features, true);
    $("#showJSONRD").html(myJSON);
}

function GetGoogleGeocoder(address, callback)
{
	try
	{
		$.ajax(
						{
							type : "GET",
							async : false,
							url : "https://maps.googleapis.com/maps/api/geocode/json?address=" + address,
							timeout: 5000
						}).done(function(data)
							{
								if(data.status == "ZERO_RESULTS")
								{
									callback(undefined);
									return;
								}

								var obj = {
									provider: "Google",
									x: wgs842rd_x( data.results[0].geometry.location.lat, data.results[0].geometry.location.lng),
									y: wgs842rd_y( data.results[0].geometry.location.lat, data.results[0].geometry.location.lng),
									lat: data.results[0].geometry.location.lat,
									lng: data.results[0].geometry.location.lng							};
							
								callback(obj);
							}).fail(function(jqXHR, textStatus){
								callback(undefined);
						});
	}
	catch(ex)
	{
		console.log("Google: " + ex);
		callback(undefined);
	}
}

function GetNominatimGeocoder(address, callback)
{
	try
	{
					$.ajax(
                    {
                        type : "GET",
                        async : false,
                        url : "http://nominatim.openstreetmap.org/search?format=json&q=" + address,
                        timeout: 5000
                    }).done(function(data)
                        {
						
							if(!data || data.length < 1)
							{
								callback(undefined);
								return;
							}
						
							var obj = {
								provider: "Nominatim",
								x: wgs842rd_x( data[0].lat, data[0].lon),
								y: wgs842rd_y( data[0].lat, data[0].lon),
								lat: data[0].lat,
								lng: data[0].lon
							};
						
							callback(obj);
						}).fail(function(jqXHR, textStatus){
                            callback(undefined);
                    });
	}
	catch(ex)
	{
		console.log("Nominatim: " + ex);
		callback(undefined);
	}
}

function GetBagGeocoder(address, callback)
{
	try
	{
					$.ajax(
                    {
                        type : "GET",
                        async : false,
                        url : "http://geodata.nationaalgeoregister.nl/geocoder/Geocoder?strict=false&zoekterm=" + address,
                        timeout: 5000
                    }).done(function(result)
                        {
							var xmlObj = xmlToJson(result);
							
							if(xmlObj.GeocodeResponse.GeocodeResponseList == undefined)
								{
									callback(undefined);
									return;
								}
							
							var raw = xmlObj.GeocodeResponse.GeocodeResponseList.GeocodedAddress.Point.pos.text;
							
							raw = raw.split(" ");
							
							var obj = {
								provider: "Bach",
								x: raw[0],
								y: raw[1],
								lat: rd2wgs84_lat(raw[0], raw[1]),
								lng: rd2wgs84_lon(raw[0], raw[1])
							};
						
							callback(obj);
						}).fail(function(jqXHR, textStatus){
                            callback(undefined);
                    });
	}
	catch(exception)
	{	
		console.log("Bag: " + exception);
		callback(undefined);
	}
}

function SetValues(index, provider, lat, lng, x, y)
{
										if (debugOnOff == 1)
										{
											$("#prov" + (index)).html(provider);
										}
										$("#x" + (index)).html(x); 
										$("#y" + (index)).html(y);
										$("#lat" + (index)).html(lat);
										$("#lon" + (index)).html(lng);
}

function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			
			if(nodeName.indexOf(":") != -1)
				nodeName = nodeName.substring(4, nodeName.length);
			if(nodeName.indexOf("#") != -1)
				nodeName = nodeName.substring(1, nodeName.length);
			
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};


