<?php 

$executionStartTime = microtime(true) / 1000;



$json = file_get_contents("countryBorders.geo.json");


$decode = json_decode($json, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>