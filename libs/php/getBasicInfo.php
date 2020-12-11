<?php 
$executionStartTime = microtime(true) / 1000;






$url= "api.ipgeolocationapi.com/countries/" . rawurlencode($_REQUEST["countryCode"]); //

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$basicInfo = json_decode($result, true);  //






$url ="http://api.geonames.org/search?q=" .  rawurlencode($_REQUEST["countryName"])  . "&country=" . rawurlencode($_REQUEST["countryCode"]) . "&featureClass=p&type=json&orderBy=population&username=mattbunn4002&maxRows=15";             //
 

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$importantPlaces = json_decode($result, true); //






$url ="http://api.geonames.org/search?q=" .  rawurlencode($_REQUEST["countryName"])  . "&country=" . rawurlencode($_REQUEST["countryCode"]) . "&featureClass=t&featureCode=mts&type=json&orderBy=elevation&username=mattbunn4002&maxRows=5";             //
 

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$countryPeaks = json_decode($result, true); //









$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data']["basicInfo"] = $basicInfo;
$output["data"]["importantPlaces"] = $importantPlaces;
$output["data"]["peaks"] = $countryPeaks;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>