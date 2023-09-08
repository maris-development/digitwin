
const openlayers_info_proxy = '/content/openlayers_info_proxy.php?url='

const categories = ['management', 'activities', 'ecology']
var active_category = "activities";
const group_titles = {
	"governance": "Governance",
	"environmental_conditions": "Environmental conditions",

	"energy": "Energy",
	"cables_and_pipelines": "Cables and pipelines",
	"shipping": "Shipping",
	"shipping_activity": "Shipping activity",
	"fishing": "Fishing",

	"protected_areas": "Protected areas",
	"pressure": "Pressure",
	"macrobenthos": "Macrobenthos",
	"fish": "Fish",
	"birds_and_mammals": "Birds and mammals",
	"biodiversity_indicators": "Biodiversity indicator"
}

var interest = null;
var interestMode = 'base';


var layer_info = new Array();
const project_grfx = '/grfx/';

var active_bounding = null;
const geoserver_url = "https://geo-service.maris.nl/digitwin/wms";
var cables_layer = null;
var turf_country_border = null																					// border of layer nl_low_res as  line object

var turf_existing_windfarm_feature = new Array();

var getfeature_layer = 'dummy'

var windfarm_user_layer = {
	'mode': null
	, 'draw': null
	, 'modify': null
	, 'select': null
	, 'translate': null
	, 'draw_source': null
}
const PRICE_PER_KM = 1.3;
const WATT_TO_MEGAWATT = 1e-6;
const M2_TO_KM2 = 1e-6;
const DAYS_IN_YEAR = 1;

var deferred_object = {
	'country_border': jQuery.Deferred(),
	'township_layer': jQuery.Deferred(),
	'windfarm_layer': jQuery.Deferred()
};

const MAP_PROJECTION = 'EPSG:3857';

$(document).ready(function () {


	//----------------------------------------------------------------
	// map function
	//----------------------------------------------------------------
	// exec all function as prefix
	map_function_init_prefix();

	load_layers_applic();

	view_options = {
		projection: MAP_PROJECTION,
		center: new ol.proj.transform([5, 52.3], 'EPSG:4326', MAP_PROJECTION),
		zoom: 7.5
	};

	map_options = { target: 'map' };
	// acex all function as suffix
	map_function_init_suffix();
	enableIdentify();


	//----------------------------------------------------------------
	// add, edit, move, remove options
	//----------------------------------------------------------------

	$('.windfarm_features').on('click', function () {
		$(".windfarm_features").not(this).removeClass("tool-active");
		if ($(this).hasClass('tool-active')) {
			$(".windfarm_features").removeClass("tool-active");
			deactivate_one_tool(this);
			windfarm_user_layer.mode = '';
			set_farmwind_mode(null);
		} else {
			$(this).addClass("tool-active");
			activate_one_tool(this);
			let mode = $(this).data('mode');
			if (windfarm_user_layer.mode === mode) {
				set_farmwind_mode(null);
				return;
			}
			set_farmwind_mode(mode);
		}
	});

	// info button in plan monitor
	$('.plan-item .info-button').on('click', function (e) {
		const target = e.currentTarget;
		const key = $(target).data('key');
		mlb_lightbox.show({ "iframe": "/content/layers_info.php?name=" + key, width: '800', height: '600', title: "", content: "" })
	});

	// close layer control box
	$('.close-layer').on('click', function () {
		$('.categories li').removeClass('active');
		$('#layer-control-box').hide();
		$('.legendbox').removeClass('relocate')

	});

	$('#add-external-layer').on('click', function () {
		mlb_lightbox.show({ "iframe": "/content/add_layers.php", width: '800', height: '600', title: "", content: "" })
	});

	// sidebar menu actions
	$('.categories li').on('click', function (e) {
		const target = $(e.target);
		if (!target.hasClass('active')) {
			$('.categories li.active').removeClass('active');
			target.addClass('active');
			active_category = target.data('category');
			$('.legendbox').addClass('relocate')
			create_layer_control()
		} else {
			$('.categories li').removeClass('active');
			$('#layer-control-box').hide();
			$('.legendbox').removeClass('relocate')
		}
	})



	// acties na het laden van bepaalde lagen
	var township_layer = layers.l[layers.find_m_key('townships-with-households')];
	layer_source_loaded(township_layer, function () {
		deferred_object.township_layer.resolve('1');
	});

	var nl_low_res_calc = layers.l[layers.find_m_key('nl_low_res_calc')];

	layer_source_loaded(nl_low_res_calc, function () {
		get_country_border_as_line();
	});

	var windfarm = layers.l[layers.find_m_key('windfarm')];
	layer_source_loaded(windfarm, function () {
		deferred_object.windfarm_layer.resolve('1');
	});

	// totals pas bijwerken als township_layer en windfarm_layer geladen zijn
	$.when(deferred_object.township_layer, deferred_object.windfarm_layer).done(function () {
		update_html_totals();
	});

	// show get started window
	get_started();

	// load tutorial (not visible)
	load_tutorial();

	// create legend
	create_legend_list();

	sortLayersFromLegend();

});

function addRangeSlider() {
	var $inputRange = $('input[type="range"]');

	if ( window !== window.parent ) 
	{
		if(typeof $inputRange.rangeslider == 'undefined') return;
	} 


	$inputRange.rangeslider({
		// Stop polyfill reverting when
		// browser compatible with input[rangeslider]
		polyfill: false,

		// Run once user has finished adjusting range slider
		onSlideEnd: function () {
			console.log("Range slider changed");
		}
	});

	$(document).on('input', 'input[type="range"]', function (e) {
		let layer = layers.l[layers.find_m_key($(e.target).data('m_key'))];
		layer.setOpacity(Number(e.target.value));
	});

	window.addEventListener('orientationchange', function () {
		$inputRange.rangeslider("update");
	});
}

function get_started() {
	if (!mlb_lightbox.is_visible()) {
		mlb_lightbox.show({ "iframe": "html/getstarted.html", "title": "Loading...", "content": "Loading...", width: '800', height: '600' });
	}
}
function close_mlb() {
	$('.mlb-close').click();
}

function start_tutorial() {
	$('body').pagewalkthrough("show");
}

function load_tutorial() {
	$('body').pagewalkthrough({
		name: "digitwin-" + Math.floor((Math.random() * 1e6) + 1),
		onLoad: false,
		onCookieLoad: $.noop,
		steps:
			[
				{
					wrapper: '',
					margin: 0,
					popup:
					{
						content: '#step1-welcome',
						type: 'modal',
						offsetHorizontal: 0,
						offsetVertical: 0,
						width: '400'
					}
				}, {
					wrapper: '#mlb_container',
					margin: 0,
					onEnter: get_started,
					popup:
					{
						content: '#step2-welcome',
						type: 'tooltip',
						position: 'top',
						offsetHorizontal: 0,
						offsetVertical: 0,
						width: '600'
					}
				}, {
					wrapper: '.legendbox',
					onEnter: close_mlb,
					margin: 0,
					popup:
					{
						content: '#step3-welcome',
						type: 'tooltip',
						position: 'right',
						offsetHorizontal: 0,
						offsetVertical: 0,
						width: '400'
					}
				}, {
					wrapper: '.categories',
					margin: 0,
					popup:
					{
						content: '#step4-welcome',
						type: 'tooltip',
						position: 'right',
						offsetHorizontal: 0,
						offsetVertical: 0,
						width: '400'
					}
				}, {
					wrapper: '.plan-monitor',
					margin: 0,
					popup:
					{
						content: '#step5-welcome',
						type: 'tooltip',
						position: 'left',
						offsetHorizontal: 0,
						offsetVertical: 0,
						width: '400'
					}
				}, {
					wrapper: '.mapcontrols',
					margin: 0,
					popup:
					{
						content: '#step6-welcome',
						type: 'tooltip',
						position: 'left',
						offsetHorizontal: 0,
						offsetVertical: -50,
						width: '400'
					}
				}
			],
		onClose: get_started,
		buttons: {
			jpwClose: {
				// Translation string for the button
				i18n: 'Close tour',
				// Whether or not to show the button.  Can be a boolean value, or a
				// function which returns a boolean value
				show: true
			}
		}



	});

}

function create_layer_control() {
	let groups = {};

	// maak groepen aan op volgorde van group_titles
	Object.keys(group_titles).forEach(function (title) {
		groups[title] = new Array();
	});

	layers.get_layers().reverse().forEach(function (layer) {
		let layer_category = layer.get('m_category');
		let layer_group = layer.get('m_group');
		if (layer_category !== undefined && layer_category == active_category) {
			if (layer_group !== undefined) {
				groups[layer_group].push(layer);
			}
		}
	});

	// verwijder lege groepen
	Object.entries(groups).forEach(function (group) {
		if (group[1].length == 0) {
			delete groups[group[0]];
		}
	});

	// open layer control
	$('#layer-control-box').show();
	// move legend
	$('.legendbox').removeClass('relocate').addClass('relocate');
	// fill layer control
	build_control_box($('#layer-control-box'), groups);
}

// export cables voor existing windfarms
function export_cable_features() {
	add_cable_layers();
	let cables_used = layers.l[layers.find_m_key('cables_used')].getSource()

	let geojson_cables_used = {
		type: "FeatureCollection",
		totalFeatures: cables_used.getFeatures().length,
		features: []
	};
	cables_used.getFeatures().forEach(function (feature) {
		geojson_cables_used.features.push(to_geo_json_object(feature))
	});
	console.log("cable_used")
	console.log(JSON.stringify(geojson_cables_used))

	let cables_future = layers.l[layers.find_m_key('cables_future')].getSource()

	let geojson_cables_future = {
		type: "FeatureCollection",
		totalFeatures: cables_future.getFeatures().length,
		features: []
	};
	cables_future.getFeatures().forEach(function (feature) {
		geojson_cables_future.features.push(to_geo_json_object(feature))
	});
	console.log("cables_future")
	console.log(JSON.stringify(geojson_cables_future))
}


function set_farmwind_mode(mode) {

	windfarm_user_layer.draw_layer = layers.l[layers.find_m_key('draw_source')].getSource();

	windfarm_user_layer.mode = mode;

	map.removeInteraction(windfarm_user_layer.draw);
	map.removeInteraction(windfarm_user_layer.modify);
	map.removeInteraction(windfarm_user_layer.select);
	map.removeInteraction(windfarm_user_layer.translate);
	map.un('singleclick', remove_feature);
	map.un('singleclick', show_feature_information);

	switch (windfarm_user_layer.mode) {
		case "add":
			windfarm_user_layer.draw = new ol.interaction.Draw({
				source: windfarm_user_layer.draw_source,
				type: "Polygon"
			});

			map.addInteraction(windfarm_user_layer.draw);

			windfarm_user_layer.draw.on("drawend", e => {
				map.removeInteraction(windfarm_user_layer.draw);

				let geojson_feature = to_geo_json_object(e.feature);

				// als 
				if (isClockwise(geojson_feature.geometry.coordinates[0])) {
					geojson_feature.geometry.coordinates[0] = geojson_feature.geometry.coordinates[0].reverse();
				}
				let geojson = {
					type: "FeatureCollection",
					totalFeatures: 1,
					features: [geojson_feature]
				};

				let points = geojson_feature.geometry.coordinates[0].map(function (point) {
					let feature = { 
						"type": "Feature", 
						"geometry": { "type": "Point", "coordinates": point }, 
						"properties": { "distanceToRestrictedArea": 0 } 
					}
					return feature
				})

				let shrimpModelGeojson = {
					type: "FeatureCollection",
					totalFeatures: points.length,
					features: points
				}

				e.feature.setId("user_windfarm." + Math.floor((Math.random() * 1e6) + 1))

				call_windfarm_api(geojson, function (result) {
					e.feature.setProperties(result.features[0].properties)
					update_html_totals();

				}, function(request){
					e.feature.setProperties({"windfarm_api_error": request.status})

				});

				call_shrimp_api(shrimpModelGeojson, function (result) {
					let effort = result.features.map(function (point) {
						return point.properties.effort
					})

					let totalEffort = effort.reduce((a, b) => a + b, 0)
					e.feature.setProperties({ "effort": totalEffort })
				})

				// teken kabel
				var cable = add_cable_to_layer(create_cable(e.feature, null), windfarm_user_layer.draw_source_cable);
				cable.feature = e.feature;
				e.feature.cable = cable;
				map.addInteraction(windfarm_user_layer.draw);
			});


			break;

		case "edit":
			windfarm_user_layer.modify = new ol.interaction.Modify({
				source: windfarm_user_layer.draw_source
			});

			map.addInteraction(windfarm_user_layer.modify);

			windfarm_user_layer.modify.on("modifyend", e => {
				update_features(e);
			});
			break;

		case "move":
			windfarm_user_layer.select = new ol.interaction.Select({
				layers: [windfarm_user_layer.draw_layer]
			});

			map.addInteraction(windfarm_user_layer.select);

			windfarm_user_layer.translate = new ol.interaction.Translate({
				features: windfarm_user_layer.select.getFeatures()
			});

			map.addInteraction(windfarm_user_layer.select);

			windfarm_user_layer.translate.on("translateend", e => {
			});
			break;

		case "remove":
			map.on('singleclick', remove_feature);
			break;

		case "identify":
			map.on('singleclick', show_feature_information);
			break;

		default:
			this.currentMode = null;
	}

}

// polygonen updaten na edit
function update_features(e) {
	e.features.forEach(function (f) {
		let geojson_feature = to_geo_json_object(f);
		let geojson = {
			type: "FeatureCollection",
			totalFeatures: 1,
			features: [geojson_feature]
		};
		// update polygon met info uit api
		call_windfarm_api(geojson, function (result) {
			f.setProperties(result.features[0].properties)
			update_html_totals();
		});

		// teken kabel opnieuw
		var cable = f.cable;
		if (cable) {
			windfarm_user_layer.draw_source_cable.removeFeature(f.cable);
		}

		cable = add_cable_to_layer(create_cable(f, null), windfarm_user_layer.draw_source_cable);
		cable.feature = f;
		f.cable = cable;
		map.addInteraction(windfarm_user_layer.draw);

	});
}

function call_windfarm_api(geojson, callback, failure_callback = false) {
	console.log("POST " + "content/api.php?api=get_windfarm_data&json_content=1");
	console.log(JSON.stringify(geojson));
	$.ajax({
		type: "POST",
		url: 'content/api.php?api=get_windfarm_data&json_content=1',
		data: JSON.stringify(geojson),
		success: function (result) {
			callback(result);
		},
		error: function(error) {
			if(failure_callback){
				failure_callback(error);
			}
		},
		dataType: 'json'
	});
}

function call_shrimp_api(geojson, callback) {
	$.ajax({
		type: "POST",
		url: 'content/api.php?api=shrimp&json_content=1',
		data: JSON.stringify(geojson),
		success: function (result) {
			callback(result);
		},
		dataType: 'json'
	});
}

// delete drawing
function remove_feature(e) {
	const feature = map.forEachFeatureAtPixel(
		e.pixel,
		(feature, layer) => {
			if (layer.get('m_key') == 'draw_source') {
				return feature;
			}
		}
	);

	if (feature) {
		const cable = feature.cable;
		if (cable) {
			windfarm_user_layer.draw_source_cable.removeFeature(cable);
		}
		windfarm_user_layer.draw_source.removeFeature(feature);
		update_html_totals();
	}

}

function enableIdentify() {
	map.on("singleclick", function (evt) {
		if (identify) {
			var pixel = map.getEventPixel(evt.originalEvent);
			let layerList = $("<ul>");
			map.forEachLayerAtPixel(pixel, function (data) {
				// laat alleen lagen zien die zichtbaar zijn en GetFeatureInfo aan kunnen
				let queryable = data.get("queryable")
				let visible = data.get("visible")
				if (visible === true && (queryable === undefined || queryable)) {
					let listItem = $("<li>", { "class": "layer-group", "html": data.get("title"), "data-m_key": data.get("m_key") });
					listItem.on("click", function (e) {
						let source = layers.l[layers.find_m_key($(this).data("m_key"))].getSource();
						var viewResolution = map.getView().getResolution();
						var url = source.getFeatureInfoUrl(
							evt.coordinate,
							viewResolution,
							MAP_PROJECTION,
							{ 'INFO_FORMAT': 'text/html' }
						);
						if (url) {
							let use_proxy = data.get("queryable_proxy")
							if (use_proxy) {
								url = openlayers_info_proxy + encodeURIComponent(url) + '&rnd=' + rnd();
							}

							fetch(url)
								.then(function (response) { return response.text(); })
								.then(function (html) {
									let startBody = html.indexOf("<body>")
									let endBody = html.indexOf("</body>")
									if (html.substring(startBody + 6, endBody).trim().length === 0) {
										html = '<div class="info-content"><h1>No info found at this point</h1></div>';
									}

									mlb_lightbox.show({ iframe: "", width: '800', height: '600', title: "", content: html })
								});
						}
					})
					layerList.append(listItem)
				}
			})

			$("#popup_content").html("");

			$("#popup_content").append(layerList)
			if (layerList[0].children.length > 0) {
				popup.show(evt);
			} else {
				popup.close();
			}
		}
	});
}

function show_feature_information(e) {
	const feature = map.forEachFeatureAtPixel(
		e.pixel,
		(feature, layer) => {
			let m_key = layer.get('m_key');
			if (m_key == 'draw_source' || m_key == "windfarm") {
				return feature;
			}
		}
	);

	if (feature) {
		mlb_lightbox.show({ "iframe": "/content/windfarm_info.php?windfarm=" + feature.getId(), width: '800', height: '600', title: "", content: "" })

	}
}


function to_geo_json(feature) {
	let formatter = new ol.format.GeoJSON()

	const json = formatter.writeFeature(feature, {
		featureProjection: "EPSG:3857",
		dataProjection: "EPSG:4326"
	});

	return json;
}

function to_geo_json_object(feature) {
	let geoJson = JSON.parse(to_geo_json(feature));

	if(geoJson.properties === null){
		geoJson.properties = {};
	}
	
	return geoJson;
}

function ol2turf(feature) {
	return this.to_geo_json_object(feature);
}

function calculate_area(feature) {
	return turf.area(ol2turf(feature));
}

function turf2ol(feature) {
	let formatter = new ol.format.GeoJSON()

	return formatter.readFeature(JSON.stringify(feature), {
		featureProjection: "EPSG:3857",
		dataProjection: "EPSG:4326"
	});
}

function create_cable(feature, turf_feature_collection) {
	let source = layers.l[layers.find_m_key('windfarm')].getSource();
	turf_feature_collection = turf.featureCollection(source.getFeatures().map(i => ol2turf(i)));
	let feature_turf = ol2turf(feature);														// 4326
	let feature_turf_center = turf.center(feature_turf);										// 4326
	let nearest_point = turf.nearestPointOnLine(turf_country_border, feature_turf_center);
	let feature_turf_line = turf.polygonToLine(feature_turf);
	let line_turf_coord = turf.coordAll(feature_turf_line);

	let turf_linestring = turf.lineString(line_turf_coord);

	let nearest_point_feature = turf.nearestPointOnLine(turf_linestring, nearest_point);
	let new_cable_turf = turf.shortestPath(turf.getCoord(nearest_point_feature),
		turf.getCoord(nearest_point),
		{
			obstacles: turf_feature_collection
		}
	);

	return new_cable_turf;

}
function add_cable_layers(filter, layer) {
	//------------------------------------------------------
	// add all cable to layer used and future
	//------------------------------------------------------

	let source = layers.l[layers.find_m_key('windfarm')].getSource();
	let turf_feature_collection = turf.featureCollection(source.getFeatures().map(i => ol2turf(i)));

	let cable_used = layers.l[layers.find_m_key('cables_used')].getSource();
	let cable_future = layers.l[layers.find_m_key('cables_future')].getSource();

	source.getFeatures().filter(i => i.get("STATUS") === "In gebruik").map(i => create_cable(i, turf_feature_collection)).map(i => add_cable_to_layer(i, cable_used));
	source.getFeatures().filter(i => i.get("STATUS") !== "In gebruik").map(i => create_cable(i, turf_feature_collection)).map(i => add_cable_to_layer(i, cable_future));

}
function add_cable_to_layer(new_feature_turf, target) {

	var thing = new ol.geom.LineString(turf.coordAll(new_feature_turf));
	var feature = new ol.Feature({
		name: "Thing",
		geometry: thing,
	});

	feature.getGeometry().transform("EPSG:4326", "EPSG:3857")

	target.addFeature(feature);

	feature.length = turf.length(new_feature_turf);

	return feature;
}

function get_country_border_as_line() {

	var vector_layer = layers.l[layers.find_m_key('nl_low_res_calc')];
	var source = vector_layer.getSource();
	var features = source.getFeatures()

	var feature_coord = features[0].getGeometry().transform("EPSG:3857", "EPSG:4326").getCoordinates();
	var feature_poly = turf.polygon(feature_coord);
	turf_country_border = turf.polygonToLine(feature_poly);

	deferred_object.country_border.resolve('1');

}


function update_html_totals() {

	let total_production_capacity = total_production_loaded('windfarm');

	let total_user_production_capacity = total_production_loaded('draw_source', true);

	windfarm_setcolor(total_production_capacity + total_user_production_capacity);
	let total_energy_production = (Math.floor(total_production_capacity + total_user_production_capacity) * WATT_TO_MEGAWATT).toFixed(2);
	$('#total_energy_production').html(total_energy_production.toString() + ' MW');
	$('#total_energy_production_user').html((total_user_production_capacity * WATT_TO_MEGAWATT).toFixed(2) + ' MW');

	let total_cable_price = calc_cable('windfarm');
	let total_user_cable_price = calc_cable('draw_source');

	let all_cable_price = (total_cable_price + total_user_cable_price).toFixed(2);
	$('#total_maintenance_windfarm').html(all_cable_price + ' m&euro;');
	$('#total_maintenance_windfarm_user').html(total_user_cable_price.toFixed(2) + ' m&euro;');

}


//------------------------------------------------------
// calculate total_power for given layer per year
//------------------------------------------------------
function total_production_loaded(layer_m_key, no_filter = false) {
	var source = layers.l[layers.find_m_key(layer_m_key)].getSource();

	return source.getFeatures().filter(i => ((i.get("STATUS") === "In gebruik") || no_filter)).map(i => i.get("wind_power_total") * DAYS_IN_YEAR).reduce((p, n) => p + n, 0);
}

//------------------------------------------------------
// calculate price_per_km for given layer
//------------------------------------------------------
function calc_cable(layer_m_key) {

	var cables = layers.l[layers.find_m_key(layer_m_key)].getSource();
	return cables.getFeatures().map(i => i.get("distance_to_coast") / 1000).map(i => i * PRICE_PER_KM).reduce((p, n) => p + n, 0);
}




function power_text_style(feature, resolution) {
	if (resolution < 250) {
		if(!isNaN(feature.get("windfarm_api_error"))){
			return 'Windfarm API error:' + feature.get("windfarm_api_error");

		} else if (feature.get("wind_power_total") === undefined) {
			return 'Calculating';

		} else if (feature.get("effort") === undefined || feature.get("effort") === "") {
			return `
			${Number(feature.get("wind_power_total") * WATT_TO_MEGAWATT * DAYS_IN_YEAR).toFixed(2)} MW
			${Math.round(feature.get("area") * M2_TO_KM2)} km2
			${feature.get("n_turbines")} units
			`;
		}

		return `
			${Number(feature.get("wind_power_total") * WATT_TO_MEGAWATT * DAYS_IN_YEAR).toFixed(2)} MW
			${Math.round(feature.get("area") * M2_TO_KM2)} km2
			${feature.get("n_turbines")} units
			Effort: ${feature.get("effort")}
			`;
	}

	return "";
}


function windfarm_setcolor(production) {
	//----------------------------------------------------------------
	// walk through layer 'households'
	// set house on active depending on production
	//----------------------------------------------------------------
	let windfarm_style_active = new ol.style.Style({
		stroke: new ol.style.Stroke({ color: 'rgba(255, 255, 0, 0.7)' }),
		fill: new ol.style.Fill({ color: 'rgba(255, 255, 102, 0.7)' })

	});
	let windfarm_style = new ol.style.Style({
		stroke: new ol.style.Stroke({ color: 'rgba(0,0,0,.7)' }),
		fill: new ol.style.Fill({ color: 'rgba(0,0,0,.2)' })
	});


	const kWh_PER_HOUSEHOLD_PER_YEAR = 3500;
	const HOURS_PER_YEAR = 8766;
	const WATT_TO_KWATT = 1e-3;
	let households = (production * 0.5 * WATT_TO_KWATT * HOURS_PER_YEAR) /* to kWh*/ / kWh_PER_HOUSEHOLD_PER_YEAR;
	let households_temp = 0;

	let source = layers.l[layers.find_m_key('townships-with-households')].getSource();

	source.getFeatures().forEach(function (i) {
		i.setStyle(windfarm_style);
		households_temp = households - i.get('households');
		if (households_temp > 0) {
			i.setStyle(windfarm_style_active);
			households = households_temp
		} else {
			i.setStyle(windfarm_style);
		}
	});

}

// empty override from map_functions
function sort_init() { }

function add_external_layer(options) {

	let layer = $.extend({}, external_layer_defaults, options || {});												// add defaults to settings

	// laag alleen toevoegen als deze er nog niet is
	if (layers.find_m_key(layer.Name) == -1) {
		layers.add_layer(new ol.layer.Image({
			title: layer.Title,
			m_key: layer.Name,
			m_style_url: layer.style_url || "",
			opacity: .8,
			no_info: true,
			visible: layer.visible || false,
			queryable: (layer.queryable !== undefined) ? layer.queryable : true,
			source: new ol.source.ImageWMS(({
				wrapX: false,
				url: layer.url,
				tileLoadFunction: add_cache_zoomlevel,
				params: { 'LAYERS': layer.Name, 'STYLES': layer.style || "" },
				serverType: 'geoserver'
			}))
		}));
	}
}

function create_legend_list(last_added) {
	let visibleLayer = {}
	if (!Array.isArray(last_added)) {
		last_added = new Array();
	}

	layers.get_layers().forEach(function (layer, idx) {
		layer.set("is_not_ui", true);

		if (layer.getVisible() == true) {
			layer.set("is_not_ui", false);
			let zIndex = layer.get("customIndex") || 1;


			if (visibleLayer[zIndex] === undefined) {
				visibleLayer[zIndex] = new Array()
			}
			visibleLayer[zIndex].push(layer);
		}
	});

	// sorteer legenda op zIndex (hoog naar laag)
	let legendOrder = Object.keys(visibleLayer).sort(function (a, b) {
		return parseInt(b) - parseInt(a);
	});

	let legendLayers = new Array();
	let currentZIndex = 1;
	legendOrder.forEach(function (zIndex) {
		visibleLayer[zIndex].forEach(function (layer) {

			if (last_added.indexOf(layer.get('m_key')) === -1 && layer.get('m_key') !== 'openstreetmap') {
				layer.setZIndex(currentZIndex);
				legendLayers.push(layer);
				currentZIndex++;
			} else if (layer.get('m_key') == 'openstreetmap') {
				// openstreetmap altijd als onderste laag
				layer.setZIndex(0);
			}
		});
	});
	legendLayers.push(layers.l[layers.find_m_key('openstreetmap')]);

	// zorg dat laatst toegevoegde lagen bovenaan komt
	if (last_added.length > 0) {
		last_added.forEach(function (m_key) {
			legendLayers.unshift(layers.l[layers.find_m_key(m_key)]);
			layers.l[layers.find_m_key(m_key)].setZIndex(currentZIndex)
			layers.l[layers.find_m_key(m_key)].set("customIndex", currentZIndex)
			currentZIndex++;

		});
	}

	build_layer_legend($('.legendbox'), legendLayers);

	addRangeSlider();
}

// opbouw layer control box
function build_control_box(element, groups) {
	let category_index = categories.indexOf(active_category) + 1

	let layer_groups = new Array();

	Object.keys(groups).forEach(function (group, index) {
		// layers in group
		let group_layers = groups[group]
		let display_group = $("<div>", { "class": "layer-group" });
		let subcategory = $("<div>", { "class": "toggle-subcategory subcategory-" + category_index + String.fromCharCode('a'.charCodeAt() + index) });
		let checkbox = $("<input>", { "type": "checkbox", "id": group, "class": "toggle-input" });
		let label = $("<label>", { "class": "toggle-label", "for": group, "text": ((group_titles[group]) ? group_titles[group] : group) });

		let group_content = $("<div>", { "class": "toggle-content", "role": "toggle" });

		// place layer under group
		let items = group_layers.map(function (layer) {
			let label = $("<label>", { "class": "switchtoggle" });
			let input = $("<input>", { "type": "checkbox", "class": "switchtoggle-checkbox", 'data-key': layer.get('m_key') });
			if (layer.getVisible()) {
				input.attr('checked', 'checked');
			}
			let switchdiv = $("<div>", { "class": "switchtoggle-switch" });
			let title = $("<span>", { "class": "switchtoggle-label", "text": layer.get('title') });
			let info = $("<button>", { "class": "layer-icon switchtoggle-info", "text": "Info" });

			info.on('click', function (e) {

				mlb_lightbox.show({ "iframe": "/content/layers_info.php?name=" + layer.get('m_key'), width: '800', height: '600', title: "", content: "" })
			});
			input.on("change", function (e) {
				const target = $(e.target);
				const m_key = target.data('key');
				let layersAdded = new Array();
				layers.l[layers.find_m_key(m_key)].setVisible(this.checked);

				if (m_key == 'windfarm') {
					layers.l[layers.find_m_key("cables_used")].setVisible(this.checked);
					layers.l[layers.find_m_key("cables_future")].setVisible(this.checked);
					layersAdded.push("cables_used");
					layersAdded.push("cables_future");
				}
				layersAdded.push(m_key);
				create_legend_list(layersAdded);
			});
			title.append(info)

			label.append(input, switchdiv, title)

			return label

		});

		group_content.append(items)

		subcategory.append(checkbox, label, group_content)
		display_group.append(subcategory)

		layer_groups.push(display_group)

	})

	// update layer control box
	element.find(".layer-control-body").empty();
	element.find(".layer-control-body").append(layer_groups);
}

// opbouw legend box
function build_layer_legend(element, legend_layers) {
	let layer_amount = legend_layers.length
	let items = legend_layers.map(function (layer, index) {

		// skip hidden layers
		if (layer.get("is_not_ui") === true) return;

		// skip measure_layer and calculation layer
		if (layer.get('m_key') == 'measure_layer' || layer.get('m_key') == 'nl_low_res_calc') return;

		// z index op kaart zelfde als volgorde in legend box
		layer.setZIndex((layer_amount + 1) - index);

		let item = $('<li>', { "class": "legend-list-item", data: { index: layer.get("index"), m_key: layer.get("m_key") } });
		// sortable handle so not whole item can be selected
		item.append($("<span>", { "class": "sortable-handle", "style": "min-height: 25px;" }));

		let container = $("<div>", { "class": "legend-list-container" });
		let info = $("<div>", { "class": "legend-list-info", "text": layer.get('title') });

		// haal legenda op als dit mogelijk is
		let buttons = $("<div>", { "class": "legend-list-buttons" });
		let legendUrl = "";
		if (layer.getSource().getLegendUrl || layer.get("m_style_url" != "")) {
			legendUrl = layer.getSource().getLegendUrl();

			if (layer.getSource().getParams().STYLES !== '') {
				legendUrl += ("&style=" + layer.getSource().getParams().STYLES)
			}
			legendUrl += "&TRANSPARENT=true&legend_options=fontColor:0xFFFFFF;";
			if (layer.get('m_style_url') != '') {
				legendUrl = layer.get('m_style_url');
			}
			let legendImage = $("<img>", { "src": legendUrl })
			legendUrl = btoa(legendUrl);
			info.append($('<br>'), legendImage)
		} else {
			if (layer instanceof ol.layer.Vector) {
				let legendImage = createWFSLegend(layer);
				if (legendImage) {
					info.append($('<br>'), legendImage);
				}
			}
		}

		let opacity_btn = $("<button>", { "class": "legend-opacity-button", "text": "Opacity" });

		let info_btn = $("<button>", { "class": "legend-info-button", "text": "Info" });
		info_btn.on('click', function (e) {

			mlb_lightbox.show({ "iframe": "/content/layers_info.php?name=" + layer.get('m_key') + "&legend=" + legendUrl, width: '800', height: '600', title: "", content: "" })
		});

		// laat info button niet zien als dat in laag staat
		if (layer.get("no_info") !== undefined) {
			info_btn = "";
		}
		let remove_btn = $();

		if (!layer.get("is_not_delete")) {
			remove_btn = $("<button>", { "class": "legend-close-button", "text": "Remove", 'data-key': layer.get('m_key') });

			// listen to remove button
			remove_btn.on('click', function (e) {
				let m_key = $(e.target).data('key');
				layers.l[layers.find_m_key(m_key)].setVisible(false);
				if (m_key == 'windfarm') {
					layers.l[layers.find_m_key("cables_used")].setVisible(false);
					layers.l[layers.find_m_key("cables_future")].setVisible(false);
				}
				$('#layer-control-box input[data-key="' + m_key + '"]').click()
				create_legend_list();
			});
		}

		buttons.append(opacity_btn, info_btn, remove_btn);

		let opacity_slider = $('<div>', { "class": "opacity-window", "html": "Opacity<br>" });

		let opacity_rangeslider = $('<div>', { "class": "rangeslider__holder" });
		let opacity_input = $('<input>', { "class": "e-range", "type": "range", "min": 0, "max": 1, "step": 0.1, "value": 0.4, "data-m_key": layer.get('m_key') });

		opacity_rangeslider.append(opacity_input);
		opacity_slider.append(opacity_rangeslider)

		opacity_btn.on("click", function () {
			$('.legend-opacity-button.active').not(this).removeClass("active")
			$('.opacity-window:visible').not(this.parentElement.nextSibling).hide();
			opacity_btn.toggleClass("active");
			opacity_slider.toggle();
			// container.addClass("disable-sort-item")

		});

		container.append(info, buttons, opacity_slider);
		item.append(container);

		return item;
	});

	// update legend list
	element.find(".legend-list").empty();
	element.find(".legend-list").append(items);


	$('.legend-list').sortable({
		handle: ".sortable-handle",
		stop: function (event, list) {
			sortLayersFromLegend();
		}
	});
	$('.legend-list').disableSelection();

}

function sortLayersFromLegend() {
	let visible_layers = $("li.legend-list-item");
	let layer_amount_sorted = visible_layers.length

	visible_layers.each(function (index, layer) {
		let zIndex = (layer_amount_sorted + 1) - index;
		layers.l[layers.find_m_key($(layer).data('m_key'))].setZIndex(zIndex)
		layers.l[layers.find_m_key($(layer).data('m_key'))].set("customIndex", zIndex)
	});
}

function createWFSLegend(layer) {
	const legendWidth = 20;
	const legendHeight = 20;

	const padding = 4;
	const legendContentWidth = legendWidth - padding * 2;
	const legendContentHeight = legendWidth - padding * 2;

	// windfarm heeft meerdere kleuren
	if (layer.get('m_key') != 'windfarm') {

		let style = layer.getStyle();
		style = style();
		let svgElem = $('<svg />')
			.attr({
				width: legendWidth,
				height: legendHeight
			});
		// vierkantje voor polygoon style
		if (style.getFill()) {
			$('<rect>', { x: padding, y: padding, width: legendContentWidth, height: legendContentHeight, stroke: style.getStroke().getColor(), fill: style.getFill().getColor() }).appendTo(svgElem);
			return $('<div>').append(svgElem).html();

			// lijn voor line style
		} else {
			let line = $('<line>', { x1: padding + 1, x2: legendWidth - padding - 1, y1: legendHeight - padding - 1, y2: padding + 1, stroke: style.getStroke().getColor(), "stroke-width": style.getStroke().getWidth() });
			if (style.getStroke().getLineDash()) {
				line.attr("stroke-dasharray", "5,5")
			}
			line.appendTo(svgElem);
			return $('<div>').append(svgElem).html();
		}
	} else {
		let style = layer.getStyle()
		// dummy feature
		let feature = new ol.Feature({});
		feature.set("STATUS", "In gebruik");
		let layerStyle = style(feature, undefined);
		let svgElem1 = $('<svg />')
			.attr({
				width: legendWidth,
				height: legendHeight
			});
		let svgElem2 = svgElem1.clone()
		$('<rect>', { x: padding, y: padding, width: legendContentWidth, height: legendContentHeight, stroke: layerStyle.getStroke().getColor(), fill: layerStyle.getFill().getColor() }).appendTo(svgElem1);
		feature.set("STATUS", "Gepland");
		layerStyle = style(feature, undefined);
		$('<rect>', { x: padding, y: padding, width: legendContentWidth, height: legendContentHeight, stroke: layerStyle.getStroke().getColor(), fill: layerStyle.getFill().getColor() }).appendTo(svgElem2);
		return $('<div>').append(svgElem1, $("<span>", { text: "In use", class: "legendText" }), $('<br>'), svgElem2, $("<span>", { text: "Planned", class: "legendText" })).html();
	}
}

function style_cable_future() {
	return new ol.style.Style({
		stroke: new ol.style.Stroke({
			width: 2, color: 'rgba(0, 0, 0, 1)',
			lineDash: [.1, 5]
		})
	});

}
function style_cable_used() {
	return new ol.style.Style({
		stroke: new ol.style.Stroke({
			width: 1, color: 'rgba(0, 0, 0, 1)'
		})
	});

}
function style_cable_user() {
	return new ol.style.Style({
		stroke: new ol.style.Stroke({
			width: 2, color: 'rgba(255, 0, 0, 1)',
			lineDash: [.1, 5]
		})
	});

}
function style_windfarm_user(feature, resolution) {
	return new ol.style.Style({
		fill: new ol.style.Fill({
			color: "rgba(255, 0, 0, 0.1)"
		}),
		stroke: new ol.style.Stroke({
			width: 1, color: 'rgba(255, 0, 0, 1)'
		}),
		text: new ol.style.Text({
			text: power_text_style(feature, resolution),
			overflow: true,
			scale: 1 + (10 / resolution)
		})
	});

}

function existing_windfarm_style(feature, resolution) {
	return new ol.style.Style({
		fill: new ol.style.Fill({
			color: "rgba(0, 0, 255, 0.1)"
		}),
		stroke: new ol.style.Stroke({
			color: feature.get('STATUS') === "In gebruik" ? "yellow" : "blue",
			width: 1
		}),
		text: new ol.style.Text({
			text: power_text_style(feature, resolution),
			overflow: true,
			scale: 1 + (10 / resolution)
		})
	});

}

function style_townships_with_households(feature, resolution) {

	return new ol.style.Style({
		fill: new ol.style.Fill({
			color: "rgba(0, 0, 0, 0.2)"
		}),
		stroke: new ol.style.Stroke({
			color: "rgba(0, 0, 0, 0.7)",
			width: 1
		})
	});
}

function helipad_style() {
	return new ol.style.Style({
		fill: new ol.style.Fill({
			color: "rgba(0, 0, 0, 0.2)"
		}),
		stroke: new ol.style.Stroke({
			color: "rgba(0, 0, 0, 0.7)",
			width: 1
		})
	})
}

function add_cache_zoomlevel(imageTile, src) {
	var url = new URL(src);

	// extract bbox coordinates from url

	url.searchParams.set("ENV", "size:" + get_size(map.getView().getZoom()))
	imageTile.getImage().src = url.toString();

}
// ak 20190704
function get_size(zoom_level) {
	// bij minder dan 1000 results, grote puntjes

	// correcties (verzoek dick)
	if (zoom_level == 7) {
		return 5
	}
	if (zoom_level == 8) {
		return 6
	}
	return Math.round(0.3 * Math.pow(zoom_level, 1.5))

}


function load_layers_applic() {
	add_draw_layers();

	// wms / tile layers
	var layers_list = [
		{
			title: "Anchor zones",
			m_category: "activities",
			m_group: "shipping",
			m_key: "Anchorages_EPSG28992",
			url: geoserver_url,
			layer: "digitwin:Anchorages_EPSG28992",
			type: "wms"
		},
		{
			title: "Bathymetry",
			m_category: "management",
			m_group: "environmental_conditions",
			m_key: "emodnet:mean_rainbowcolour",
			url: "https://ows.emodnet-bathymetry.eu/wms",
			layer: "emodnet:mean_rainbowcolour",
			type: "tile",
			style_url: "https://ows.emodnet-bathymetry.eu/styles/legend_rainbow.png",
			queryable: false
		},
		{
			title: "EEZ",
			m_category: "management",
			m_group: "governance",
			m_key: "Dutch_EEZ_EPSG28992",
			url: geoserver_url,
			layer: "Dutch_EEZ_EPSG28992",
			type: "wms"
		},
		{
			title: "Electricity cables",
			m_category: "activities",
			m_group: "cables_and_pipelines",
			m_key: "electricity_cables",
			url: geoserver_url,
			layer: "electra_kabels_noordzee",
			type: "wms"
		},
		{
			title: "Shipping routes",
			m_category: "activities",
			m_group: "shipping",
			m_key: "shipping_routes_epsg28992",
			url: geoserver_url,
			layer: "shipping_routes_epsg28992",
			type: "tile"
		},
		{
			title: "Military areas (NL)",
			m_category: "management",
			m_group: "governance",
			m_key: "militaire_gebieden_nl",
			url: "https://geoservices.rijkswaterstaat.nl/apps/geoserver/militaire_gebieden/ows",
			layer: "militaire_gebieden",
			type: "wms"
		},
		{
			title: "Military areas (DE)",
			m_category: "management",
			m_group: "governance",
			m_key: "militaire_gebieden_de",
			url: "https://www.geoseaportal.de/wss/service/CONTIS_Administration/guest",
			layer: "CONTIS_Administration:Military_Practice_Area",
			type: "tile",
			style_url: "https://www.geoseaportal.de/wss/service/CONTIS_Administration/guest?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&LAYER=Military_Practice_Area&TRANSPARENT=false"
		},
		{
			title: "Natura 2000",
			m_category: "ecology",
			m_group: "protected_areas",
			m_key: "ez_lnv_natura2000_20180827",
			url: geoserver_url,
			layer: "ez_lnv_natura2000_20180827",
			type: "wms"
		},
		{
			title: "No shipping zones",
			m_category: "activities",
			m_group: "shipping",
			m_key: "no_shipping_zones_epsg28992",
			url: geoserver_url,
			layer: "no_shipping_zones_epsg28992",
			type: "wms"
		},
		{
			title: "Pipelines",
			m_category: "activities",
			m_group: "cables_and_pipelines",
			m_key: "pijpleidingen_noordzee",
			url: geoserver_url,
			layer: "pijpleidingen_noordzee",
			type: "wms"
		},
		{
			title: "Telecom cables",
			m_category: "activities",
			m_group: "cables_and_pipelines",
			m_key: "telecom_kabels_noordzee",
			url: geoserver_url,
			layer: "telecom_kabels_noordzee",
			type: "wms"
		},
		{
			title: "Wind Farms Search Areas",
			m_category: "activities",
			m_group: "energy",
			m_key: "overige_windenergie_studiegebieden",
			url: geoserver_url,
			layer: "overige_windenergie_studiegebieden",
			type: "wms"
		},
		{
			title: "Windfarms after 2030",
			m_category: "activities",
			m_group: "energy",
			m_key: "development_after_2030",
			url: geoserver_url,
			layer: "development_after_2030",
			type: "wms"
		},
		{
			title: "Oil & gas offshore platforms",
			m_category: "activities",
			m_group: "energy",
			m_key: "oil_gas_offshore_instalations",
			url: "https://www.nlog.nl/arcgis/services/nlog/gdw_ng_facility_utm/MapServer/WMSServer",
			layer: "0",
			type: "wms"
		},
		{
			title: "Shipping Intensity",
			m_category: "activities",
			m_group: "shipping_activity",
			m_key: "Marine_Traffic_2017",
			url: "https://ihm-pub.geopublisher.nl/geoserver/MARIN/wms",
			layer: "Marine_Traffic_2017",
			type: "tile"
		},
		{
			title: "Income from fishing",
			m_category: "activities",
			m_group: "fishing",
			m_key: "DEM2008_2018",
			url: geoserver_url,
			layer: "DEM2008_2018",
			type: "wms"
		},
		{
			title: "Harbor porpoise (spring)",
			m_category: "ecology",
			m_group: "birds_and_mammals",
			m_key: "NZ2030_hp_pred_spri_NCP_Gilles",
			url: "https://opengeodata.wmr.wur.nl/geoserver/WMRwms/wms",
			queryable_proxy: true,
			layer: "NZ2030_hp_pred_spri_NCP_Gilles",
			type: "wms"
		},
		{
			title: "Harbor porpoise (summer)",
			m_category: "ecology",
			m_group: "birds_and_mammals",
			m_key: "NZ2030_hp_pred_fall_NCP_Gilles",
			url: "https://opengeodata.wmr.wur.nl/geoserver/WMRwms/wms",
			queryable_proxy: true,
			layer: "NZ2030_hp_pred_fall_NCP_Gilles",
			type: "wms"
		},
		{
			title: "Harbor porpoise (fall)",
			m_category: "ecology",
			m_group: "birds_and_mammals",
			m_key: "NZ2030_hp_pred_summ_NCP_Gilles",
			url: "https://opengeodata.wmr.wur.nl/geoserver/WMRwms/wms",
			queryable_proxy: true,
			layer: "NZ2030_hp_pred_summ_NCP_Gilles",
			type: "wms"
		},
		{
			title: "Sharks and Rays Abundance",
			m_category: "ecology",
			m_group: "fish",
			m_key: "Elasmobranch_abundance_abs_4326",
			url: "https://marineprojects.openearth.eu/geoserver/digishape/wms",
			layer: "Elasmobranch_abundance_abs_4326",
			type: "wms"
		},
		{
			title: "StratificationRegime",
			m_category: "management",
			m_group: "environmental_conditions",
			m_key: "hydrodynamic_regions_4326",
			url: geoserver_url,
			layer: "hydrodynamic_regions_4326",
			type: "wms"
		},
		{
			title: "Razorbill",
			m_category: "ecology",
			m_group: "birds_and_mammals",
			m_key: "NZ2030_Alk_Jaargem",
			url: "https://opengeodata.wmr.wur.nl/geoserver/WMRwms/wms",
			queryable_proxy: true,
			layer: "NZ2030_Alk_Jaargem",
			type: "wms"
		},
		{
			title: "Lesser black-backed gull",
			m_category: "ecology",
			m_group: "birds_and_mammals",
			m_key: "NZ2030_KlMntlmw_Jaargem",
			url: "https://opengeodata.wmr.wur.nl/geoserver/WMRwms/wms",
			queryable_proxy: true,
			layer: "NZ2030_KlMntlmw_Jaargem",
			type: "wms"
		},
		{
			title: "birds sensitivity",
			m_category: "ecology",
			m_group: "birds_and_mammals",
			m_key: "NZ2030_WSI22CMLbb2013",
			url: "https://opengeodata.wmr.wur.nl/geoserver/WMRwms/wms",
			queryable_proxy: true,
			layer: "NZ2030_WSI22CMLbb2013",
			type: "wms"
		},
		{
			title: "Guillemot",
			m_category: "ecology",
			m_group: "birds_and_mammals",
			m_key: "NZ2030_Zeekoet_Jaargem",
			url: "https://opengeodata.wmr.wur.nl/geoserver/WMRwms/wms",
			queryable_proxy: true,
			layer: "NZ2030_Zeekoet_Jaargem",
			type: "wms"
		},
		{
			title: "EUSeaMap (2019) Habitat Map - EUNIS classification",
			m_category: "ecology",
			m_group: "biodiversity_indicators",
			m_key: "eusm2019_group",
			url: "https://ows.emodnet-seabedhabitats.eu/emodnet_view/wms",
			layer: "eusm2019_group",
			type: "tile"
		},
		{
			title: "Seabed Substrates 1:1M",
			m_category: "management",
			m_group: "environmental_conditions",
			m_key: "gtk:seabed_substrate_1m",
			url: "https://drive.emodnet-geology.eu/geoserver/gtk/wms",
			layer: "gtk:seabed_substrate_1m",
			type: "tile"
		},
		{
			title: "Seabed Substrates 1:250k",
			m_category: "management",
			m_group: "environmental_conditions",
			m_key: "gtk:seabed_substrate_250k",
			url: "https://drive.emodnet-geology.eu/geoserver/gtk/wms",
			layer: "gtk:seabed_substrate_250k",
			type: "tile"
		},
		{
			title: "Seabed Substrates 1:100k",
			m_category: "management",
			m_group: "environmental_conditions",
			m_key: "gtk:seabed_substrate_100k",
			url: "https://drive.emodnet-geology.eu/geoserver/gtk/wms",
			layer: "gtk:seabed_substrate_100k",
			type: "tile"
		},
		{
			title: "Seabed substrate 1:50K",
			m_category: "management",
			m_group: "environmental_conditions",
			m_key: "gtk:seabed_substrate_50k",
			url: "https://drive.emodnet-geology.eu/geoserver/gtk/wms",
			layer: "gtk:seabed_substrate_50k",
			type: "tile"
		},
		{
			title: "Seabed Accumulation Rates",
			m_category: "management",
			m_group: "environmental_conditions",
			m_key: "seabed_accumulation_rates",
			url: "https://drive.emodnet-geology.eu/geoserver/gtk/wms",
			layer: "seabed_accumulation_rates",
			type: "wms"
		},
		{
			title: "seabed_substrate_multiscale",
			m_category: "management",
			m_group: "environmental_conditions",
			m_key: "seabed_substrate_multiscale",
			url: "https://drive.emodnet-geology.eu/geoserver/gtk/wms",
			layer: "seabed_substrate_multiscale",
			type: "wms"
		},
		{
			title: "seabed_substrate_multiscale_folk_7",
			m_category: "management",
			m_group: "environmental_conditions",
			m_key: "seabed_substrate_multiscale_folk_7",
			url: "https://drive.emodnet-geology.eu/geoserver/gtk/wms",
			layer: "seabed_substrate_multiscale_folk_7",
			type: "wms"
		},
		{
			title: "seabed_substrate_multiscale_folk_16",
			m_category: "management",
			m_group: "environmental_conditions",
			m_key: "seabed_substrate_multiscale_folk_16",
			url: "https://drive.emodnet-geology.eu/geoserver/gtk/wms",
			layer: "seabed_substrate_multiscale_folk_16",
			type: "wms"
		}
	];

	// voeg alle bovenstaande layers toe
	layers_list.forEach(function (layer) {
		switch (layer.type) {
			case "tile":
				layers.l[layers.l.length] = new ol.layer.Tile({
					title: layer.title,
					m_category: layer.m_category,
					m_group: layer.m_group,
					m_key: layer.m_key,
					m_style_url: layer.style_url || "",
					opacity: .8,
					visible: layer.visible || false,
					queryable: ((layer.queryable === undefined) ? true : layer.queryable),
					queryable_proxy: ((layer.queryable_proxy === undefined) ? false : layer.queryable_proxy),
					source: new ol.source.TileWMS(({
						wrapX: false,
						url: layer.url,
						tileLoadFunction: add_cache_zoomlevel,
						params: { 'LAYERS': layer.layer, 'STYLES': layer.style || "" },
						serverType: 'geoserver'
					}))
				});
				break;
			case "wms":
				layers.l[layers.l.length] = new ol.layer.Image({
					title: layer.title,
					m_category: layer.m_category,
					m_group: layer.m_group,
					m_key: layer.m_key,
					m_style_url: layer.style_url || "",
					opacity: .8,
					visible: layer.visible || false,
					queryable: ((layer.queryable === undefined) ? true : layer.queryable),
					queryable_proxy: ((layer.queryable_proxy === undefined) ? false : layer.queryable_proxy),
					source: new ol.source.ImageWMS(({
						wrapX: false,
						url: layer.url,
						tileLoadFunction: add_cache_zoomlevel,
						params: { 'LAYERS': layer.layer, 'STYLES': layer.style || "" },
						serverType: 'geoserver'
					}))
				});
				break;

			case "xyz":
			default:

		}
	});

	// always add openstreetmap base layer
	layers.l[layers.l.length] = new ol.layer.Tile({ title: 'OpenStreetMap', m_key: 'openstreetmap', is_base: true, no_info: true, is_not_delete: true, visible: true, queryable: false, source: new ol.source.XYZ({ wrapX: false, url: "https://tile.geofabrik.de/0ae834fb1475459ea149257e52f28e50/{z}/{x}/{y}.png", crossOrigin: 'anonymous' }) });
}


function add_draw_layers() {

	// aantal geojson / wfs lagen
	layers.l[layers.l.length] = new ol.layer.Vector({
		title: 'Existing windfarms',
		m_category: "activities",
		m_group: 'energy',
		m_key: 'windfarm',
		opacity: .8,
		style: existing_windfarm_style,
		visible: true,
		queryable: false,
		source: new ol.source.Vector({
			wrapX: false,
			url: 'assets/windfarm_cached.json',
			format: new ol.format.GeoJSON()
		})
	});

	layers.l[layers.l.length] = new ol.layer.Vector({
		title: 'Townships with households',
		m_key: 'townships-with-households',
		no_info: true,
		opacity: .8,
		style: style_townships_with_households,
		visible: true,
		queryable: false,
		is_not_delete: true,
		source: new ol.source.Vector({
			wrapX: false,
			url: 'https://geo-service.maris.nl/digitwin/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=digitwin:townships-with-households-polygon&outputFormat=application/json&srsname=EPSG:3857',
			format: new ol.format.GeoJSON()
		})
	});

	layers.l[layers.l.length] = new ol.layer.Vector({
		title: 'Helicopter safety zones 2.5 nm in O&G platforms',
		m_category: "activities",
		m_group: 'energy',
		m_key: 'helipads',
		no_info: true,
		queryable: false,
		opacity: .8,
		style: helipad_style,
		visible: false,
		source: new ol.source.Vector({
			wrapX: false,
			url: 'https://geo-service.maris.nl/digitwin/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=digitwin:aerodb_airport_ho__20191107&outputFormat=application/json&srsname=EPSG:3857',
			format: new ol.format.GeoJSON()
		})
	});

	let cable_future = new ol.source.Vector({ wrapX: false, url: 'assets/cables_future.json', format: new ol.format.GeoJSON() });
	let cable_used = new ol.source.Vector({ wrapX: false, url: 'assets/cables_used.json', format: new ol.format.GeoJSON() });

	windfarm_user_layer.draw_source = new ol.source.Vector({});
	windfarm_user_layer.draw_source_cable = new ol.source.Vector({});

	layers.l[layers.l.length] = new ol.layer.Vector({ title: 'Cables planned', no_info: true, m_group: 'group1', m_key: 'cables_future', opacity: .8, style: style_cable_future, visible: true, source: cable_future, });
	layers.l[layers.l.length] = new ol.layer.Vector({ title: 'Cables currently used', no_info: true, m_group: 'group1', m_key: 'cables_used', opacity: .8, style: style_cable_used, visible: true, source: cable_used, });
	layers.l[layers.l.length] = new ol.layer.Vector({ title: 'User layer', m_key: 'draw_source', no_info: true, opacity: .8, is_not_delete: true, customIndex: 1000, style: style_windfarm_user, visible: true, source: windfarm_user_layer.draw_source });
	layers.l[layers.l.length] = new ol.layer.Vector({ title: 'User cable', m_key: 'draw_source_cable', no_info: true, opacity: .8, is_not_delete: true, customIndex: 999, style: style_cable_user, visible: true, source: windfarm_user_layer.draw_source_cable });

	layers.l[layers.l.length] = new ol.layer.Vector({ title: 'Netherlands contour (low res2)', m_group: 'group1', m_key: 'nl_low_res_calc', no_info: true, opacity: .8, is_not_ui: true, visible: true, is_not_delete: true, source: new ol.source.Vector({ wrapX: false, url: '/assets/nl_low_res.json', format: new ol.format.GeoJSON({}) }) })

}


// functie om te testen of polygoon clockwise of anticlockwise is
// source: https://github.com/mattdesl/is-clockwise
function isClockwise(poly) {
	var sum = 0
	for (var i = 0; i < poly.length - 1; i++) {
		var cur = poly[i],
			next = poly[i + 1]
		sum += (next[0] - cur[0]) * (next[1] + cur[1])
	}
	return sum > 0
}


// lagen die geopend moeten worden na selectie in startscherm
function openInterestLayers() {
	const interestLayers = {
		'energy': {
			'emodnet:mean_rainbowcolour': { mode: 'base' },
			'Dutch_EEZ_EPSG28992': { mode: 'base' },
			'oil_gas_offshore_instalations': { mode: 'base' },
			'electra_kabels_noordzee': { mode: 'base' },
			'pijpleidingen_noordzee': { mode: 'base' },
			'telecom_kabels_noordzee': { mode: 'base' },
			'overige_windenergie_studiegebieden': { mode: 'base' },
			'development_after_2030': { mode: 'base' },
			'helipads': { mode: 'base' },
			'cables_used': { mode: 'base' },
			'cables_future': { mode: 'base' },
			'windfarm': { mode: 'base' },
		},
		'ecology': {
			'emodnet:mean_rainbowcolour': { mode: 'base' },
			'Dutch_EEZ_EPSG28992': { mode: 'base' },
			'ez_lnv_natura2000_20180827': { mode: 'base' },
			'NZ2030_hp_pred_spri_NCP_Gilles': { mode: 'base' },
			'NZ2030_hp_pred_fall_NCP_Gilles': { mode: 'base' },
			'NZ2030_hp_pred_summ_NCP_Gilles': { mode: 'base' },
			'Elasmobranch_abundance_abs_4326': { mode: 'expert' },
			'NZ2030_Alk_Jaargem': { mode: 'base' },
			'NZ2030_KlMntlmw_Jaargem': { mode: 'base' },
			'NZ2030_WSI22CMLbb2013': { mode: 'base' },
			'NZ2030_Zeekoet_Jaargem': { mode: 'base' },
			'eusm2019_group': { mode: 'expert' },
			'overige_windenergie_studiegebieden': { mode: 'base' },
			'development_after_2030': { mode: 'base' },
			'oil_gas_offshore_instalations': { mode: 'expert' },
			'helipads': { mode: 'base' },
			'cables_used': { mode: 'base' },
			'cables_future': { mode: 'base' },
			'windfarm': { mode: 'base' },
		},
		'shipping_and_fishing': {
			'emodnet:mean_rainbowcolour': { mode: 'base' },
			'Dutch_EEZ_EPSG28992': { mode: 'base' },
			'DEM2008_2018': { mode: 'base' },
			'Marine_Traffic_2017': { mode: 'base' },
			'Anchorages_EPSG28992': { mode: 'expert' },
			'shipping_routes_epsg28992': { mode: 'base' },
			'militaire_gebieden_nl': { mode: 'expert' },
			'militaire_gebieden_de': { mode: 'expert' },
			'ez_lnv_natura2000_20180827': { mode: 'expert' },
			'no_shipping_zones_epsg28992': { mode: 'base' },
			'development_after_2030': { mode: 'base' },
			'overige_windenergie_studiegebieden': { mode: 'base' },
			'oil_gas_offshore_instalations': { mode: 'expert' },
			'helipads': { mode: 'base' },
			'cables_used': { mode: 'base' },
			'cables_future': { mode: 'base' },
			'windfarm': { mode: 'base' },
		}
	}

	const visibleLayersKeys = Object.keys(interestLayers[interest]);

	layers.get_layers().forEach(function (layer) {
		const index = visibleLayersKeys.indexOf(layer.get('m_key'));
		if (index !== -1) {
			if (interestLayers[interest][layer.get('m_key')].mode === interestMode || "expert" === interestMode) {
				layer.setVisible(true);
				layer.set("customIndex", index + 2);
			}
		}
	});

	// maak legenda aan
	create_legend_list();
}