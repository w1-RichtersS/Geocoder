<?php

include('rd2wgs84.inc');

set_time_limit(0);
error_reporting(0);

// include_once('geoPHP/geoPHP.inc');

$listAttributesID = @$_POST['excel_attributen'];
$excel_data = @$_POST['excel_data'];
//$zoekRegio = @$_POST['zoekRegio'];

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
			$zoekadres .= trim(preg_replace('/[^[:print:]]/', '',$kolomwaarden[$kolteller])) . " ";
		}
		if ($attribute == 2) {
			$zoekadres .= trim(preg_replace('/[^[:print:]]/', '',$kolomwaarden[$kolteller])) . " ";
		}
		if ($attribute == 3) {
			$zoekadres .= trim(preg_replace('/[^[:print:]]/', '',$kolomwaarden[$kolteller])) . " ";
		}
		if ($attribute == 4) {
			$zoekadres .= trim(preg_replace('/[^[:print:]]/', '',$kolomwaarden[$kolteller])) . " ";
		}
		if ($attribute == 5) {
			$zoekadres .= trim(preg_replace('/[^[:print:]]/', '',$kolomwaarden[$kolteller])) . " ";
		}
		if ($attribute == 6) {
			$zoekadres .= trim(preg_replace('/[^[:print:]]/', '',$kolomwaarden[$kolteller])) . " ";
		}
		if ($attribute == 7) {
			$zoekadres .= trim(preg_replace('/[^[:print:]]/', '',$kolomwaarden[$kolteller])) . " ";
		}

		$kolteller++;
	}

	// wkt bepalen !!!!

	if ($zoekadres != "") {
		
		$base_WFS_NL = "http://geodata.nationaalgeoregister.nl/geocoder/Geocoder?strict=false&zoekterm=";
		$base_WFS_nominatim = "http://nominatim.openstreetmap.org/search?format=xml&q=";
		
		$locationFound = 0;
		$poging = 1;
		
		while (!$locationFound)
		{
			switch ($poging)
			{
				case 1:
					$service_url = $base_WFS_nominatim;
					$service_url .= urlencode($zoekadres);
					$service_url .= "";
					$ch = curl_init($service_url);
					curl_setopt($ch, CURLOPT_HEADER, 0);
					curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
					$output = curl_exec($ch);
					if ($output === false) {
						curl_close($ch);
			
					} else {
						//  echo 'Operation completed without any errors: '.$bag_url;
						curl_close($ch);
						$doc = MyXmlLoader($output);
						$places = $doc->getElementsByTagName("place");
		
						foreach($places as $place)
						{
							$result_lat  =  " ".$place->getAttribute('lat');
							$result_lon  =  " ".$place->getAttribute('lon');
							echo $result_lat. ";" .$result_lon.";Nominatim";
							$nr_OK++;
							$locationFound = 1;
							break;
						}
					}
					if ($locationFound == 0)
					{
						$poging++;
					}
					break;
				case 2:
					$service_url = $base_WFS_NL;
					$service_url .= urlencode($zoekadres);
					$service_url .= "";
					$ch = curl_init($service_url);
					curl_setopt($ch, CURLOPT_HEADER, 0);
					curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
					$output = curl_exec($ch);
					if ($output === false) {
						curl_close($ch);
			
					} else {
						//  echo 'Operation completed without any errors: '.$bag_url;
						curl_close($ch);
						$doc = MyXmlLoader($output);
						$featureMembers = $doc -> getElementsByTagName("GeocodedAddress");
			
			
						foreach ($featureMembers as $featureMember) {
							if ($locationFound == 0) {
								foreach ($featureMember->childNodes as $layer) {
									if ($layer -> nodeName == "gml:Point") {
										$coords = $layer -> nodeValue;
										$array_coords = explode(" ", $coords);
										$val_lat = rd2wgs84_lat( $array_coords[0], $array_coords[1] );
										$val_lon = rd2wgs84_lon( $array_coords[0], $array_coords[1] );
										echo $val_lat . ";" . $val_lon.";BAG";
										$nr_OK++;
										$locationFound = 1;
										break;
									}
								}
							}
						}
					}
					if ($locationFound == 0)
					{
						$poging++;
					}
					break;
				default:
					break 2; //end switch and while!!!!
			}
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