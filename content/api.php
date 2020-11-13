<?php


$api = get_param('api', '', 'c');
$json_file = get_param('json_file', '', 'c');
$json_payload = get_param('json_content', 0, 'n');

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
            $url = "https://test-northsea-2-dot-hydro-engine.ey.r.appspot.com/get_windfarm_data";
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
    curl_close($ch);
    return $result;
}
