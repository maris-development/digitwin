<?php
/*
//---------------------------------------------------------------
// bb 20190924
// project digitwin
// create program welcome.php
//---------------------------------------------------------------
*/

include_once("/include/application_class.inc");


$applic = new application_class();

$applic->l_html_page = false;

load_stylesheets($applic);

$applic->header_html();

$applic->content();

html_footer($applic);

function load_stylesheets($applic)
{
    $applic->a_css[] = array('href' => 'https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');
    $applic->a_css[] = array('href' => '/css/general.css?'.$applic->cache_buster);
    $applic->a_css[] = array('href' => '/css/map.css?'.$applic->cache_buster);
    $applic->a_css[] = array('href' => '/css/layers.css?'.$applic->cache_buster);
    $applic->a_css[] = array('href' => '/css/controls.css?'.$applic->cache_buster);
    $applic->a_css[] = array('href' => '/css/mlb.css?'.$applic->cache_buster);
    $applic->a_css[] = array('href' => '/css/jquery.pagewalkthrough.css?'.$applic->cache_buster);
    $applic->a_css[] = array('href' => '/css/rangeslider.css?'.$applic->cache_buster);
    $applic->a_css[] = array('href' => '/css/popup.css?'.$applic->cache_buster);
}

function load_javascript($applic)
{
    // load all scripts for openlayers
    $applic->load_ol6_script();

    rw_line('<script type="text/javascript" src="/java/jquery/jquery-3.4.1.min.js"></script>');
    rw_line('<script type="text/javascript" src="/java/standard/mlb' . (is_local() ? '' : '-min') . '.js"></script>');
    rw_line('<script type="text/javascript" src="/js/rangeslider.min.js?'.$applic->cache_buster.'"></script>');
    rw_line('<script type="text/javascript" src="/js/map' . (is_local() ? '' : '-min') . '.js?'.$applic->cache_buster.'"></script>');
    rw_line('<script type="text/javascript" src="/java/jquery/jquery-ui-1.10.4.custom.min.js"></script>');

    rw_line('<script type="text/javascript" src="/js/jquery.pagewalkthrough' . (is_local() ? '' : '-min') . '.js?'.$applic->cache_buster.'"></script>');

    // poging om touch te laten werken
    rw_line('<script type="text/javascript" src="/js/jquery.ui.touch-punch.min.js?'.$applic->cache_buster.'"></script>');


}

function applic_content_header()
{

    // tutorial steps
    rw_line('<div style="display:none">');
    rw_line('   <div id="step1-welcome">');
    rw_line('       <span style="font-size: 1.88em;">Welcome to the tutorial of the Digitwin application</span>');
    rw_line('       <p>We will guide you swiftly through the main features.</p>');
    rw_line('   </div>');
    rw_line('   <div id="step2-welcome">');
    rw_line('       <span style="font-size: 1.88em;">Step 2: Choose your main interest</span>');
    rw_line('       <p>We will show you a pre-selected set of datasets matching your interest. Other datasets can be added via the layer menu.</p>');
    rw_line('   </div>');
    rw_line('   <div id="step3-welcome">');
    rw_line('       <span style="font-size: 1.88em;">Step 3: Legend</span>');
    rw_line('       <p>Here you find an overview of the data sets now active on the map. Use the "i" button to find a description and reference to the source.</p>');
    rw_line('   </div>');
    rw_line('   <div id="step4-welcome">');
    rw_line('       <span style="font-size: 1.88em;">Step 4: Categories</span>');
    rw_line('       <p>Open the categories to find additional datasets.</p>');
    rw_line('   </div>');
    rw_line('   <div id="step5-welcome">');
    rw_line('       <span style="font-size: 1.88em;">Step 5: Plans monitor</span>');
    rw_line('       <p>Plan your windfarms (click + to start) and find here the energy and costs.</p>');
    rw_line('   </div>');
    rw_line('   <div id="step6-welcome">');
    rw_line('       <span style="font-size: 1.88em;">Step 6: Map control</span>');
    rw_line('       <p>The basic controls of the map: zoom in, zoom out, restart and a measurement tool.</p>');
    rw_line('   </div>');
    rw_line('</div>');

    rw_line('<header>');
    rw_line('    <div id="topbar">');
    rw_line('        <div class="wrapper">');
    rw_line('            <div class="brand-logo"></div>');
    rw_line('            <div class="categories">');
    rw_line('                <ul>');
    rw_line('                  <li class="cat1" data-category="management">Management</li>');
    rw_line('                  <li class="cat2" data-category="activities">Human activities</li>');
    rw_line('                  <li class="cat3" data-category="ecology">Ecologies</li>');
    rw_line('                </ul>');
    rw_line('            </div>');
    rw_line('        </div>');
    rw_line('    </div>');
    rw_line('</header>');
}

function content_applic()
{
    // layer control box
    rw_line('<div id="layer-control-box" class="layerbox" style="display: none;">');
    rw_line('   <div class="layer-content">');
    rw_line('       <header class="layerheader">');
    rw_line('           <h3>Layer control</h3>');
    rw_line('           <button class="close-layer">Close</button>');
    rw_line('       </header>');
    rw_line('       <div class="layer-control-body">');
    rw_line('       </div>');
    rw_line('   </div>');
    rw_line('</div>');

    // legend
    rw_line('<div class="legendbox">');
    rw_line('   <header class="legendheader">');
    rw_line('       <h3>Legend</h3>');
    rw_line('       <button id="add-external-layer">Add external layer</button>');
    rw_line('   </header>');
    rw_line('   <div class="legend-content">');
    rw_line('       <ul class="legend-list">');
    rw_line('       </ul>');
    rw_line('   </div>');
    rw_line('</div>');

    rw_line('<div class="plan-monitor">');
    rw_line('   <header class="monitorheader">');
    rw_line('       <h3>Plans monitor</h3>');
    rw_line('   </header>');
    rw_line('   <div class="buttons-container">');
    rw_line('       <div id="windfarm_feature_add" class="windfarm_features add-feature" data-mode="add" title="Windfarm feature add">Add</div>');
    rw_line('       <div id="windfarm_feature_edit" class="windfarm_features edit-feature" data-mode="edit" title="Windfarm feature edit">Edit</div>');
    rw_line('       <div id="windfarm_feature_remove" class="windfarm_features remove-feature" data-mode="remove" title="Windfarm feature remove">Remove</div>');
    rw_line('       <div id="windfarm_feature_identify" class="windfarm_features identify-feature" data-mode="identify" title="Windfarm feature identify">Identify</div>');
    rw_line('   </div>');
    rw_line('   <dl class="plan-item">');
    rw_line('       <dt>Costs<button class="info-button" data-key="plan-monitor-maintenance">Info</button></dt>');
    rw_line('       <dd><span id="total_maintenance_windfarm" class="total-maintenance-windfarm monetary-unit">&euro; 0 m</span></dd>');
    rw_line('   </dl>');
    rw_line('   <dl class="plan-item">');
    rw_line('       <dt>Costs user</dt>');
    rw_line('       <dd><span id="total_maintenance_windfarm_user" class="total-maintenance-windfarm monetary-unit">&euro; 0 m</span></dd>');
    rw_line('   </dl>');
    rw_line('   <dl class="plan-item">');
    rw_line('       <dt>Energy</dt>');
    rw_line('       <dd><span id="total_energy_production" class="total-energy-production">0 MW</span></dd>');
    rw_line('   </dl>');
    rw_line('   <dl class="plan-item">');
    rw_line('       <dt>Energy user</dt>');
    rw_line('       <dd><span id="total_energy_production_user" class="total-energy-production">0 MW</span></dd>');
    rw_line('   </dl>');
    rw_line('</div>');

    // map controls
    rw_line('<div class="controls">');
    rw_line('   <ul class="mapcontrols">');
    rw_line('       <li id="zoom_in" class="mc-zoom-in" title="Zoom in"></li>');
    rw_line('       <li id="zoom_out" class="mc-zoom-out" title="Zoom out"></li>');
    rw_line('       <li id="drag_to_zoom" class="mc-bounding-box" title="Zoom by box"></li>');
    rw_line('       <li id="zoom_to_extent" class="map-reset" title="Reset map"></li>');
    rw_line('       <li id="measure_button" class="mc-distance" title="Measure distance"></li>');
    rw_line('       <li id="identify_button" class="mc-identifier" title="Enable identify"></li>');
    rw_line('   </ul>');
    rw_line('</div>');

    // map
    rw_line('<div id="map" class="map"></div>');

    // measure box and position box
    rw_line('<div class="map-info">');
    rw_line('   <div id="show_measure_box"></div>');
    rw_line('   <div id="show_position_box" class="map-position" style="display:block;">50.936074 , 7.749086</div>');
    rw_line('</div>');

    rw_line('<div id="popup"><ul><li id="popup_close" class="popup-close"></li></ul><div id="popup_content" class="popup-content"></div></div>');

}

function html_footer($applic)
{
    // load javascript last
    load_javascript($applic);

    rw_line('</body>');
    rw_line('</html>');
}
