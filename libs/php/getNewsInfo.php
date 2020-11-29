<?php 

$executionStartTime = microtime(true) / 1000;

$url = 'http://newsapi.org/v2/everything?' . 'q=' . rawurlencode($_REQUEST["capital"]) . '&' . 'from=' . rawurlencode(date("Y-m-d")) .'&' . 'sortBy=popularity&' .
'apiKey=0c79c117ea2141aaba7afe8948fa80ea';




$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

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