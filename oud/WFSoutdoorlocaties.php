<?php
//http://geodata.nationaalgeoregister.nl/bagviewer/wfs?service=WFS&version=1.1.0&srsName=EPSG%3A28992&request=GetFeature&typeName=verblijfsobject&outputFormat=json&bbox=189233.055,427554.74,189806.775,427850&format_options=callback%3AOpenLayers.Protocol.Script.registry.c4
  $max_features = 10000;

 $this_format_options = $_GET[ "format_options"];

 $array_callback = explode(":", $this_format_options );


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


//header('Content-Type: application/json');
header("Content-type: text/javascript");
echo $array_callback[1]."(";
echo $output;
echo ")";

?>

