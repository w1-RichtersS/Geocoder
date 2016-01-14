/**********************************************************\
                      GENERAL VARIABLES
\**********************************************************/
var map;
var vector_layerLL;
var vector_layer;
var gg = new OpenLayers.Projection("EPSG:900913");
var sm = new OpenLayers.Projection("EPSG:4326");
var rd = new OpenLayers.Projection("EPSG:28992");
var labelKolom = "";
var debugOnOff = false;
var startKolom = 5;
var xKolom = 1;


/**********************************************************\
                         FUNCTIONS
\**********************************************************/
function import_excel()
{
    if (debugOnOff)
    {
        startKolom = 6;
        xKolom = 2;
    } else
    {
        startKolom = 5;
        xKolom = 1;
    }

    var veld_type_array = new Array('Kies datatype', 'volledig adres', 'straat', 'huisnummer', 'toevoeging', 'postcode', 'plaats', 'land', 'label');
    var batch_content = "\
        <h2>Upload Data met GeometrieProvider<div id=import_exec style='display:inline'></div></h2>\
        <div id=upload_result_table></div>\
        <div id=tekst_upload_eerste_regel>Kopieer vanuit Excel de data hierin:&nbsp;&nbsp;&nbsp;\
            <input id=check_eerste_regel type=checkbox />Eerste regel bevat kolomnamen<br/>\
            <textarea id=batch_upload style=\"width:98%;\" rows=15 ></textarea><br/>\
            <button id=upload_check_button class=\"more-space\">Data interpreteren</button><br/>\
        </div>\
        <input id=settings_menu type=hidden value=\"12\" /><br>";

    //upload_check_button = data interpreteren op input-tab
    $("#upload_check_button").click(function () {
        //variables
        var eerste_regel_checked = $("input[name='check_eerste_regel']").is(':checked'); //kolomnamen
        var all_data = new Array();
        // Haal nu de attributen op die bij deze Layer/Functie horen
        var regels = $("#batch_upload").val().split("\n"); //value van textarea gesplit door een newline
        var clean_data = "";

        if (regels.length > 0) { //check of textarea is gevuld
            var top_row = "";
            $("#tekst_upload_eerste_regel").hide();
            var split_type = 1; //== tab
            var array_eerste_regel = regels[0].split("\t"); //split door tab
            var nr_columns = array_eerste_regel.length;
            /*after split by tab, there is still just one line
            this means that there is an other split-sign */
            if (nr_columns == 1) {
                var array_eerste_regel = regels[0].split(";");
                var nr_columns = array_eerste_regel.length;
                split_type = 2; //==semicolumn
            }

            /*************************************************\
            TABLE HEADERS
            \*************************************************/
            top_row = "<tr>\
                       <th class='hide'>Kies</th>";
            if (debugOnOff) {
                top_row += "<th class='showth'>Provider</th>";
            }
            top_row += "<th class='showth'>X</th>\
                        <th class='showth'>Y</th>\
                        <th class='showth'>Lat</th>\
                        <th class='showth'>Lon</th>";
            var extra_kol_keuzes = "";

            for (j = 0; j < veld_type_array.length; j++) {//loop through array for types (straat, huisnummer, postcode, etc)
                extra_kol_keuzes += "<option value='" + j + "'>" + veld_type_array[j] + "</option>"; //make dropdown list for output
            }

            for (i = 0; i < array_eerste_regel.length; i++) {//loop through array from textarea (input by user)
                if ((array_eerste_regel[i] != "") && (eerste_regel_checked)) {//if first line is kolomnamen
                    top_row += "<th><span class='hide'><select id='excel_" + i + "'>" + extra_kol_keuzes + "</select></span><br/>\
                                    <span id='kolomnaam_" + i + "' class='showth'>" + array_eerste_regel[i] + "</span>\
                                </th>"; //fill dropdown-menu + add kolomnamen 
                } else {
                    top_row += "<th class='hide'><select class='select' id='excel_" + i + "'>" + extra_kol_keuzes + "</select>"; //fill dropdown menu
                }
            }

            top_row += "</tr>"; // close first row

            /*************************************************\
            TABLE CONTENT
            \*************************************************/
            var content = "";
            var start = 0;
            if (eerste_regel_checked) {//kolomnamen
                start = 1;
            }
            for (j = start; j < regels.length; j++) {//loop through user-input

                if (split_type == 1) {//splittype == tab
                    var array_regel = regels[j].split("\t"); //split each line (regel) and split that line by tab, store this in array
                }
                else {//splittype == semicolumn
                    var array_regel = regels[j].split(";"); //split each line (regel) and split that line by semicolumn, store this in array
                }

                if (nr_columns == array_regel.length) {//length firstline equals length of next line
                    var deze_regel = "";
                    content += "<tr>\
                                    <td class='hide'>" + j + "</td>"; //kies (linenumber)
                    if (debugOnOff) {
                        content += '<td class=\'showtd\' id="prov' + j + '"></td>';
                    }
                    content += '<td class=\'showtd\' id="x' + j + '"></td>\
                                <td class=\'showtd\' id="y' + j + '"></td>\
                                <td class=\'showtd\' id="lat' + j + '"></td>\
                                <td class=\'showtd\' id="lon' + j + '"></td>';

                    for (i = 0; i < array_regel.length; i++) {//loop trough each item in the line
                        content += "<td class='showtd'>" + array_regel[i] + "</td>"; //add data to content
                        if (deze_regel != "") {//if deze_regel is filled add semicolumn
                            deze_regel += ";";
                        }
                        deze_regel += array_regel[i]; //add item to deze_regel
                    }
                    content += "</tr>"; //end row
                    all_data[j] = deze_regel; //add line to array at same index (array is empty at that index)
                }
            }

            /*************************************************\
            OUTPUT TAB
            \*************************************************/
            /*add to tables to outputtab
            first table are the buttons
            second is filled with tableheaders and tablecontent (variables filled above)*/
            $("#outputTab").html("<table cellspacing=\"5\" cellpadding=\"5\" border=\"0\">\
                                    <tr>\
                                        <td><button id=execute_import class=\"more-space\">Geocoding uitvoeren</button></td>\
                                        <td><button><a href=\"#\" title=\"Met deze button download je het CSV waar de decimalen gescheiden zijn door een komma\" class=\"download_csv\" role=\"button\">Download CSV NL</button></a></button></td>\
                                        <td><button><a href=\"#\" title=\"Met deze button download je het CSV waar de decimalen gescheiden zijn door een punt\" class=\"download_csv\" role=\"button\">Download CSV EN</button></a></button></td>\
                                    </tr>\
                                  </table><br />\
                                  <table id='gridtable'>" + top_row + content + "</table>");
            $("#tabs a[name='outputTab']").trigger('click'); //trigger the function click on the outputtab
            $("#execute_import").click(function () {//click on button "geocoding uitvoeren"
                $(this).css("background-color", "#D9D9D9"); //change background color
                //variables
                labelKolom = ""; //general variable
                var data_post = {};
                var new_regel = "";

                $("[id^=excel]").each(function (i) {//dropdown-lists
                    if (new_regel != "") {
                        new_regel += ";";
                    }
                    /* values dropdown:
                    0 ==>'Kies datatype', 
                    1 ==>'volledig adres', 
                    2 ==>'straat', 
                    3 ==>'huisnummer', 
                    4 ==>'toevoeging', 
                    5 ==>'postcode', 
                    6 ==>'plaats', 
                    7 ==>'land', 
                    8 ==>'label*/
                    new_regel += $(this).val(); //add value of this element to new_regel
                    if ($(this).val() == 8) {//label
                        labelKolom = i + startKolom; //labelkolom = number of kolom (kies = 0, x = 1, etc.)
                    }
                });

                data_post["excel_attributen"] = new_regel; //add excel attributes to data_post array

                data_post['ts'] = new Date().getTime(); //add timestamp to data_post array

                var start = 0;
                if (eerste_regel_checked) {
                    start = 1;
                }
                for (k = start; k < all_data.length; k++) {
                    if ($("#x" + (k)).text().length == 0 || $("#y" + (k)).text().length == 0 || $("#lat" + (k)).text().length == 0 || $("#lon" + (k)).text().length == 0) {
                        data_post["excel_data"] = all_data[k];
                        var search = "";
                        var fields = all_data[k].split(";");
                        var new_regel_noLabel = "";
                        for (var i = 0; i < new_regel.length; i++) {//function to make label disapear in searching for adresses
                            if (new_regel[i] != 8) {
                                new_regel_noLabel += new_regel[i];
                            }
                        }
                        var allowed = new_regel_noLabel.split(";");
                        for (var i = 0; i < fields.length; i++)
                            if (allowed[i] > 0)
                                search += fields[i] + " ";

                        console.log("Attempt Bag");
                        GetBagGeocoder(search, function (data) {
                            if (data != undefined)
                                SetValues(k, data.provider, data.lat, data.lng, data.x, data.y);
                            else {
                                console.log("Attempt Nominatim");
                                GetNominatimGeocoder(search, function (data) {
                                    if (data != undefined)
                                        SetValues(k, data.provider, data.lat, data.lng, data.x, data.y);
                                    else {
                                        console.log("Attempt Google");
                                        GetGoogleGeocoder(search, function (data) {
                                            if (data != undefined)
                                                SetValues(k, data.provider, data.lat, data.lng, data.x, data.y);
                                        });
                                    }
                                });
                            }
                        });

                    }
                }
                $("#execute_import").css("background-color", "#96BF0D");

            });

            //author: http://stackoverflow.com/questions/16078544/export-to-csv-using-jquery-and-html (aanpassingen door: Sacha Richters)
            // deze functie zorgt voor de functionaliteit van de button "download_csv"
            // de button zorgt ervoor dat de inhoud van de tabel in de tab "geocode output" in een csv-format gezet wordt
            // zodat deze gedownload kan worden en in excel kan worden geopend.
            //script voor download_csv button
            //$(document).ready(function () {
            function exportTableToCSV($table, filename, lang) {
                var $headers = $table.find('tr:has(th)')
                    , $rows = $table.find('tr:has(td)')

                // Temporary delimiter characters unlikely to be typed by keyboard
                // This is to avoid accidentally splitting the actual contents
                    , tmpColDelim = String.fromCharCode(11) // vertical tab character
                    , tmpRowDelim = String.fromCharCode(0) // null character

                // actual delimiter characters for CSV format
                    , colDelim = '";"'
                    , rowDelim = '"\r\n"';
                // Grab text from table into CSV formatted string
                var csv = '"';
                if (lang == "Download CSV NL"){
                    csv += formatRows($headers.map(grabRowNL));
                    csv += rowDelim;
                    csv += formatRows($rows.map(grabRowNL)) + '"';
                }
                else if (lang == "Download CSV EN"){
                    csv += formatRows($headers.map(grabRowEN));
                    csv += rowDelim;
                    csv += formatRows($rows.map(grabRowEN)) + '"';
                }
                
                

                // Data URI
                var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

                // For IE (tested 10+)
                if (window.navigator.msSaveOrOpenBlob) {
                    var blob = new Blob([decodeURIComponent(encodeURI(csv))], {
                        type: "text/csv;charset=utf-8;"
                    });
                    navigator.msSaveBlob(blob, filename);
                } else {
                    $(this)
                        .attr({
                            'download': filename
                            , 'href': csvData
                            //,'target' : '_blank' //if you want it to open in a new window
                        });
                }

                //------------------------------------------------------------
                // Helper Functions 
                //------------------------------------------------------------
                // Format the output so it has the appropriate delimiters
                function formatRows(rows) {
                    return rows.get().join(tmpRowDelim)
                        .split(tmpRowDelim).join(rowDelim)
                        .split(tmpColDelim).join(colDelim);
                }

                // Grab and format a row from the table
                function grabRowNL(i, row) {

                    var $row = $(row);
                    //for some reason $cols = $row.find('td') || $row.find('th') won't work...
                    var $cols = $row.find('.showtd');
                    if (!$cols.length) $cols = $row.find('.showth');

                    return $cols.map(grabColNL)
                                .get().join(tmpColDelim);
                }
                function grabRowEN(i, row) {

                    var $row = $(row);
                    //for some reason $cols = $row.find('td') || $row.find('th') won't work...
                    var $cols = $row.find('.showtd');
                    if (!$cols.length) $cols = $row.find('.showth');

                    return $cols.map(grabColEN)
                                .get().join(tmpColDelim);
                }
                // Grab and format a column from the table for NL version of excel
                function grabColNL(j, col) {
                    var $col = $(col),
                        $text = $col.text();

                    //replace scheidingstekens voor nederlandse excel
                    $text = $text.replace(".", ",");

                    return $text.replace('"', '""'); // escape double quotes

                }
                function grabColEN(j, col) {
                    var $col = $(col),
                        $text = $col.text();

                    return $text.replace('"', '""'); // escape double quotes

                }
            };
            // });
            $(".download_csv").click(function (event) {
                // var outputFile = 'export'
                var outputFile = prompt("Hoe wil je het bestand noemen?\nHet bestand komt terecht in de map \"Downloads\" (op de C-schijf)", "Geocoder"); //(Note: This won't have any effect on Safari)
                outputFile = outputFile.replace('.csv', '') + '.csv'
                var lang = $(this).html();

                // CSV
                exportTableToCSV.apply(this, [$('#gridtable'), outputFile, lang]);


                // IF CSV, don't do event.preventDefault() or return false
                // We actually need this to be a typical hyperlink
            });



        } else {
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
    map.addControl(new OpenLayers.Control.ScaleLine(
    {
        bottomOutUnits : "",
        maxWidth : 200
    }));

    //    map.setCenter(new OpenLayers.LonLat(147971, 410845)// Center of the map
    //    .transform(new OpenLayers.Projection("EPSG:28992"), // transform from new RD
    //    map.getProjectionObject()), 14);
    // Zoom level

    var defaultStyle1 = new OpenLayers.Style(
    {
        externalGraphic : 'images/has.png',
        graphicWidth : 28,
        graphicHeight : 28,
        label : "${label}", // gebruik van het attribuut van het feature genaamd label
        labelYOffset : -20,
        labelOutlineColor : "RGB(219, 0, 47)",
        labelOutlineWidth : 3,
        fontColor : "white",
        fontWeight : "bold",
        fontSize : "12px"
    });

    var selectStyle1 = new OpenLayers.Style(
    {
        fillColor : 'blue',
        fillOpacity : 0.3,
        strokeWidth : 2.0,
        strokeColor : 'red',
        strokeOpacity : 1,
        pointRadius : 12,
        graphicName : "star"
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
        autoActivate : true,
        toggleKey : "ctrlKey", // ctrl key removes from selection
        multipleKey : "shiftKey", // shift key adds to selection
        box : false
    });

    var eerste_regel_checked = $("input[name='check_eerste_regel']").is(':checked'); //check if first line is columnnames
    var i_excel = 0;
    map.addControl(sel_feature);

    sel_feature.activate();

    vector_layerLL.events.on(
    {
        'featureselected': function (evt) {
            var popupText = "";
            $.each(evt.feature.attributes, function (attr) {
                if (attr != "label") { //als attr label is dan niks weergeven, omdat die kolom al weergegeven wordt met eigen naam
                    popupText += attr + ": " + this + "<br>";
                }
            });
            var feature = evt.feature;    
            var popup = new OpenLayers.Popup.FramedCloud("popup", OpenLayers.LonLat.fromString(feature.geometry.toShortString()), null, "<div style='font-size:.8em'>" + popupText + "</div>", null, true);
            feature.popup = popup;
            map.addPopup(popup);
        },
        'featureunselected': function (evt) {
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

    $("#gridtable tr").each(function (recnr) {
        if (recnr > 0) {
            var xcoord;
            var ycoord;
            var lat;
            var lon;
            var point_feature;
            var point_featureLL;

            lat = "";
            lon = "";

            $.each(this.cells, function (i) {
                if (i == xKolom) {
                    xcoord = $(this).html();
                }
                if (i == xKolom + 1) {
                    ycoord = $(this).html();
                    var newPoint;
                    newPoint = new OpenLayers.Geometry.Point(xcoord, ycoord);
                    point_feature = new OpenLayers.Feature.Vector(newPoint);
                }
                if (i == xKolom + 2) {
                    lat = $(this).html();
                    if (lat != null && lat != "") {
                        if (lat > maxY)
                            maxY = lat;
                        if (lat < minY)
                            minY = lat;
                    }
                }
                if (i == xKolom + 3) {
                    lon = $(this).html();
                    if (lon != null && lon != "") {
                        if (lon > maxX)
                            maxX = lon;
                        if (lon < minX)
                            minX = lon;
                        var newPoint;
                        newPoint = new OpenLayers.Geometry.Point(lon, lat).transform(map.displayProjection, map.projection);
                        point_featureLL = new OpenLayers.Feature.Vector(newPoint);
                    }
                }
                if (i > xKolom + 3) {
                    var i_excel = i - 5; //number of kolomindex from dropdownlist
                    /*get values from dropdown lists (dit is nodig voor het stukje in else dat niet werkt)
                    var id_dropdown = "excel_" + i_excel;
                    var e_dropdown = document.getElementById(id_dropdown);
                    var value_dropdown = e_dropdown.options[e_dropdown.selectedIndex].text;*/
                    if (lat != null && lat != "") {
                        if (i == labelKolom) {
                            point_featureLL.attributes['label'] = $(this).html();
                        }
                        if (eerste_regel_checked) {
                            var id_kolomnaam = "kolomnaam_" + i_excel;
                            var property = document.getElementById(id_kolomnaam).innerHTML;
                            point_featureLL.attributes[property] = $(this).html();
                            point_feature.attributes[property] = $(this).html();
                        }
                        else {
                            /* op de een of andere manier werkt dit niet...
                            var kolomnaam = value_dropdown;
                            point_featureLL.attributes[kolomnaam] = $(this).html();
                            */
                            point_featureLL.attributes['kolom' + (i - 4)] = $(this).html();
                            point_feature.attributes['kolom' + (i - 4)] = $(this).html();
                        }

                    }
                }
            });
            vector_layer.addFeatures(point_feature);

            if (lat != null && lat != "") {
                vector_layerLL.addFeatures(point_featureLL);
            }
        }
    });
    vector_layerLL.refresh();
    if (vector_layerLL.features.length > 0)
    {
        map.zoomToExtent(new OpenLayers.Bounds(minX, minY, maxX, maxY).transform(map.displayProjection, map.projection));
        createLatLonJSON();
    } else
    {
        alert("Er zijn nog geen punten op de kaart weer te geven");
    }

}

function createLatLonJSON()
{
    //JSON LL
    var myJSON = new OpenLayers.Format.GeoJSON(
    {
        'internalProjection' : gg,
        'externalProjection' : sm
    }).write(vector_layerLL.features, true);

    //string manipulation on JSON LL to remove the propertie "label" from the myJSON string
    //it first gets the index of the word "label" (with quotations)
    //then it devides myJSON into 2 substrings, before "label" and after "label"
    //then it finds the index of the komma (the one after "label")
    //after that it saves a new substring without the whole "label"-line (incl. the propertie value)
    //at last the first substring is added to the last substring and saved in the variable myJSON
    while (myJSON.indexOf("label") != -1)
    {
        var length_myJSON = myJSON.length;//save length of myJSON
        var index_label = myJSON.indexOf("\"label\"");//save index of label
        var before_substr = myJSON.substr(0,index_label);//save substring before the label-word
        var after_substr = myJSON.substr(index_label, length_myJSON);//save length of substring after the label index
        var index_komma = after_substr.indexOf(","); //save index of the komma after label
        var last_sub = after_substr.substr(index_komma + 1, length_myJSON);//save new substring after the label-line

        var myJSON = before_substr + last_sub;

    }
    $("#showJSONLL").html(myJSON);

    //JSON RD
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
            timeout : 5000
        }).done(function(data)
        {
            if (data.status == "ZERO_RESULTS")
            {
                callback(undefined);
                return;
            }

            var obj =
            {
                provider : "Google",
                x : wgs842rd_x(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng),
                y : wgs842rd_y(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng),
                lat : data.results[0].geometry.location.lat,
                lng : data.results[0].geometry.location.lng
            };

            callback(obj);
        }).fail(function(jqXHR, textStatus)
        {
            callback(undefined);
        });
    } catch(ex)
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
            timeout : 5000
        }).done(function(data)
        {

            if (!data || data.length < 1)
            {
                callback(undefined);
                return;
            }

            var obj =
            {
                provider : "Nominatim",
                x : wgs842rd_x(data[0].lat, data[0].lon),
                y : wgs842rd_y(data[0].lat, data[0].lon),
                lat : data[0].lat,
                lng : data[0].lon
            };

            callback(obj);
        }).fail(function(jqXHR, textStatus)
        {
            callback(undefined);
        });
    } catch(ex)
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
            type: "GET",
            async: false,
            url: "http://geodata.nationaalgeoregister.nl/geocoder/Geocoder?strict=false&zoekterm=" + address,
            timeout: 5000
        }).done(function (result) {
            var xmlObj = xmlToJson(result);

            if (xmlObj.GeocodeResponse.GeocodeResponseList == undefined) {
                callback(undefined);
                return;
            }

            var raw = xmlObj.GeocodeResponse.GeocodeResponseList.GeocodedAddress.Point.pos.text;

            raw = raw.split(" ");
            var obj =
            {
                provider: "Bach",
                x: raw[0],
                y: raw[1],
                lat: rd2wgs84_lat(raw[0], raw[1]),
                lng: rd2wgs84_lon(raw[0], raw[1])
            };

            callback(obj);
        }).fail(function (jqXHR, textStatus) {
            callback(undefined);
        });
    } catch(exception)
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

function xmlToJson(xml)
{

    // Create the return object
    var obj =
    {
    };

    if (xml.nodeType == 1)
    {
        // element
        // do attributes
        if (xml.attributes.length > 0)
        {
            obj["@attributes"] =
            {
            };
            for (var j = 0; j < xml.attributes.length; j++)
            {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3)
    {
        // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes())
    {
        for (var i = 0; i < xml.childNodes.length; i++)
        {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;

            if (nodeName.indexOf(":") != -1)
                nodeName = nodeName.substring(4, nodeName.length);
            if (nodeName.indexOf("#") != -1)
                nodeName = nodeName.substring(1, nodeName.length);

            if ( typeof (obj[nodeName]) == "undefined")
            {
                obj[nodeName] = xmlToJson(item);
            } else
            {
                if ( typeof (obj[nodeName].push) == "undefined")
                {
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


function removeDutchPcodeSpaces(pCode)
{
    pCodeTrim = $.trim(pCode);
    if (pCodeTrim.length == 7 && pCodeTrim.indexOf(' ') == 4)
    {
        pCodeNoSpace = pCodeTrim.substr(0, 4) + pCodeTrim.substr(5,2);
        return pCodeNoSpace;
    }
    else{
        return pCodeTrim;
    }
}

