<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <title>HAS, Geo, Media en Design !</title>
           <link rel="stylesheet" href="style.css" type="text/css">
        <style type="text/css">
            html, body, #map {
                margin: 0;
                width: 100%;
                height: 100%;
            }

            #text {
                position: absolute;
                bottom: 1em;
                left: 1em;
                width: 400px;
                z-index: 20000;
                background-color: white;
                padding: 0 0.5em 0.5em 0.5em;
            }
        </style>
        <script src="http://www.openlayers.org/dev/OpenLayers.js"></script>

 <script>
        var featurecollection =
<?php

 $base_WFS = "http://localhost:8080/geoserver/ModuleGeoSoftware/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ModuleGeoSoftware%3AOutdoorLocaties&maxfeatures=100&outputformat=json&srsName=EPSG%3A900913";

$ch = curl_init($base_WFS);
curl_setopt($ch, CURLOPT_HEADER, 0);
//   curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$output = curl_exec($ch);

if($output === false)
{
    echo 'Curl error: ' . curl_error($ch);
}
else
{
  //  echo 'Operation completed without any errors: '.$bag_url;
 //header("Content-type: text/javascript");
}

curl_close($ch);

 echo $output.";";

?>


        </script>

    </head>
    <body>
        <div id="map"></div>

          <div id="text">
              <h1 id="title">Outdoor Locaties</h1>


              <p id="shortdesc">
                Toon de bedrijven, aangesloten bij de HAS
            </p>

            <div id="docs">
                <p>Selecteer een van de locaties, om gegevens te zien</p>
            </div>
            <script src="fullScreen.js"></script>
        </div>
    </body>
</html>
