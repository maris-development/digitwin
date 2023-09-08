<?php

include_once("../include/application_class.inc");

set_time_limit ( 90 ); //90 seconden ipv. 30 seconden timeout, (API's traag)

$api = get_param('api', '', 'c');
$json_file = get_param('json_file', '', 'c');
$json_payload = get_param('json_content', 0, 'n');
$debug = false;

$api_url = get_api_url($api);

if ($api_url == ""){
    rw("No API found");
    die();
}

if ($json_file != '') {
    $json_content = read_json_file($json_file);
    $response = call_api_post($api_url, $json_content);
    file_put_contents(__DIR__ . '/../' . str_replace('.json', '', $json_file) . '_cached.json', $response);
}

if ($json_payload == 1){
    $json_content = file_get_contents("php://input");
    $payload = json_decode($json_content, true);
    $response = call_api_post($api_url, json_encode($payload));
    rw($response);
}

function get_api_url($api)
{
    switch ($api) {
        case 'get_windfarm_data':
            $url = "https://hydro-engine.appspot.com/get_windfarm_data";
            break;
        case 'shrimp':
            $url = "https://shrimp-znslazb4qa-ez.a.run.app/predict/hurdle";
            break;
        default:
            $url = "";
    }

    return $url;
}

function read_json_file($json_file)
{
    return file_get_contents(__DIR__ . '/../' . $json_file);
}

function call_api_post($url, $content)
{
    global $debug;

    if($debug){
        echo $url;
        echo PHP_EOL;
        echo $content;
        echo PHP_EOL;
    }

    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_POSTFIELDS, $content);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt(
        $ch,
        CURLOPT_HTTPHEADER,
        array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($content)
        )
    );

    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    $result = curl_exec($ch);
    $response_code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if($response_code != 200){
        http_response_code($response_code);
        header('Content-Type: application/json');
        echo json_encode(Array('error' => $response_code));
        die();
    }

    if($debug){
        echo '<br>'. PHP_EOL;
        echo '<br>'. PHP_EOL;
        echo PHP_EOL;
        echo $result;
        echo PHP_EOL;
    }
    
    return $result;
}
