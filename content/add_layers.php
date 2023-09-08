<?php

//---------------------------------------------------------------
//---------------------------------------------------------------
// add_layers.php
//
// bb 20171121 created
//---------------------------------------------------------------
//---------------------------------------------------------------

include_once("../include/application_class.inc");

$applic = new application_class();

$applic->l_html_page  = false;
$applic->a_param['mlb']['value'] = 1;


$applic->a_css[] = array('href' => '/css/add_layers.css');

$applic->header_html();

content();

$applic->footer_html();

/****************************************************************/
function page_script()
{
	global $applic;

	$applic->load_ol6_script();

	rw_line('<script type="text/javascript" src="/java/jquery/jquery-3.4.1.min.js"></script>');
	rw_line('<script type="text/javascript" src="/js/add_layers'	. (is_local() ? '' : '-min') . '.js?'.$applic->cache_buster.'"></script>');
}

/****************************************************************/
function content()
{
	rw_line('<div class="wrapper">');
	rw_line('	<div class="info-content">');
	rw_line('	<h1>Add layer</h1>');

	rw_line('		<dl>');
	rw_line('			<dt>Specify WMS Server URL</dt>');
	rw_line('			<dd><input id="wms_url" type="text" value="https://ows.emodnet-bathymetry.eu/wms"/></dd>');
	rw_line('		</dl>');

	rw_line('		<dl>');
	rw_line('			<dt>Select a layer</dt>');
	rw_line('			<dd><button class="get-capabilities" >Get capabilities</button><div id="layer-list"></div></dd>');
	rw_line('		</dl>');

	rw_line('		<dl>');
	rw_line('			<dt></dt>');
	rw_line('			<dd><button class="add-layers">Add layer(s)</button></dd>');
	rw_line('		</dl>');
	rw_line('	</div>');
	rw_line('</div>');
}

//===============================================================
//===============================================================
//===============================================================
//===============================================================
//===============================================================
