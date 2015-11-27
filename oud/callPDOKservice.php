<?php

include('rd2wgs84.inc');

set_time_limit(0);
error_reporting(0);

// include_once('geoPHP/geoPHP.inc');

$listAttributesID = @$_POST['excel_attributen'];
$excel_data = @$_POST['excel_data'];
$zoekRegio = @$_POST['zoekRegio'];

$all_attributes_array = explode(";", $listAttributesID);

$nr_OK = 0;
$nr_niet_OK = 0;

// identificatie kolom bepalen
$attribute_kolom_nummer = 0;
$found_att_nummer = -1;
$found_function = -1;

$lines = preg_split('/\r\n|\r|\n/', $excel_data);

for ($r = 0; $r < count($lines); $r++) {
	set_time_limit(0);

	$kolomwaarden = explode(";", $lines[$r]);
	$kolteller = 0;
	$zoekadres = "";
	foreach ($all_attributes_array as $attribute) {
		if ($attribute == 1) {
			$zoekadres .= trim($kolomwaarden[$kolteller]);
		}
		if ($attribute == 2) {
			$zoekadres .= trim($kolomwaarden[$kolteller]) . " ";
		}
		if ($attribute == 3) {
			$zoekadres .= trim($kolomwaarden[$kolteller]) . " ";
		}
		if ($attribute == 4) {
			$zoekadres .= trim($kolomwaarden[$kolteller]) . " ";
		}
		if ($attribute == 5) {
			$zoekadres .= trim($kolomwaarden[$kolteller]) . " ";
		}
		if ($attribute == 6) {
			$zoekadres .= trim($kolomwaarden[$kolteller]) . " ";
		}

		$kolteller++;
	}

	// wkt bepalen !!!!

	if ($zoekadres != "") {
		
		$base_WFS = "http://geodata.nationaalgeoregister.nl/geocoder/Geocoder?strict=false&zoekterm=";

		$bag_url = $base_WFS;

		$bag_url .= urlencode($zoekadres);

		$bag_url .= "";

		$ch = curl_init($bag_url);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		//   curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$output = curl_exec($ch);
//		echo $bag_url."<br>";
//		echo $output;

		if ($output === false) {
			echo ";";
			curl_close($ch);

		} else {
			//  echo 'Operation completed without any errors: '.$bag_url;

			curl_close($ch);

			$doc = MyXmlLoader($output);
			

			$featureMembers = $doc -> getElementsByTagName("GeocodedAddress");

			$found = 0;

			foreach ($featureMembers as $featureMember) {
				if ($found == 0) {
					foreach ($featureMember->childNodes as $layer) {
						if ($layer -> nodeName == "gml:Point") {
							$coords = $layer -> nodeValue;
							$array_coords = explode(" ", $coords);
							$val_lat = rd2wgs84_lat( $array_coords[0], $array_coords[1] );
							$val_lon = rd2wgs84_lon( $array_coords[0], $array_coords[1] );
							// echo round($array_coords[0]) . ";" . round($array_coords[1]);
							echo $val_lat . ";" . $val_lon;
							$nr_OK++;
							$found = 1;
							break;
						}
					}
				}
			}

			//ini_set('precision',15);

		}

	}
}
// echo "Aantal met Geometrie: ".$nr_OK.", zonder Geometrie: ".$nr_niet_OK;

// DB altijd sluiten

function json_to_wkt($json) {
	$geom = geoPHP::load($json, 'json');
	return $geom -> out('wkt');
}

function MyXmlLoader($strXml) {
	set_error_handler('MyHandleXmlError');
	$dom = new DOMDocument();
	$dom -> loadXml($strXml);
	restore_error_handler();
	return $dom;
}

function MyHandleXmlError($errno, $errstr, $errfile, $errline) {
	if ($errno == E_WARNING && (substr_count($errstr, "DOMDocument::loadXML()") > 0)) {
		throw new DOMException($errstr);
	} else
		return false;
}
?>