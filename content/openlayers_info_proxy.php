<?php
// ak 20200107
// proxy om de CORS restrictie van ajax te omzeilen
// alleen voor GetCapabilities, rest moet buiten proxy

$proxy = new MarisProxy();

$url = get_param('url', '', 'c');

$parsedUrl = parse_url($url);
parse_str($parsedUrl['query'], $output);
$output = array_change_key_case($output);
$allowedHostsGetFeatureInfo = ['scomp1184.wur.nl/geoserver/WMRwms/wms'];
$request = strtolower($output['request']);

switch ($request) {
	case 'getcapabilities':
		$proxy->straight_through($url);
		break;
	case 'getfeatureinfo':
		// getFeatureInfo alleen voor bepaalde hosts
		if (in_array($parsedUrl['host'], $allowedHostsGetFeatureInfo)) {
			$proxy->straight_through($url);
			break;
		}
	default:
		http_response_code(403);
		die();
}