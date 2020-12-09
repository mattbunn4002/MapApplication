<?php 

$executionStartTime = microtime(true) / 1000;


$urlBasicInfo= "api.ipgeolocationapi.com/countries/" . rawurlencode($_REQUEST["countryCode"]);   //Gets countrycode, nationality, continent, subregion, etc.

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result=curl_exec($ch);

curl_close($ch);

$basicInfo = json_decode($result, true);  // 


$urlCoordsFromCountryName = "https://api.opencagedata.com/geocode/v1/json?key=297c438b28c94b24831f523213c7ea8e&q=" . rawurlencode($_REQUEST['countryName'])
. "&no_annotations=1"; 

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>