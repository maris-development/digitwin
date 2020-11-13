$(document).ready(function () {
    const searchParams = parseURL(window.location.href)
    const windfarm = searchParams.searchObject.windfarm

    const inIframe = (window === window.parent) ? false : true;

    if (inIframe) {
        show_windfarm_information(windfarm);
    }
});

function show_windfarm_information(windfarm) {
    // haal index van windfarm lagen op
    const windfarmLayerIndex = parent.layers.find_m_key('windfarm')
    const userWindfarmLayerIndex = parent.layers.find_m_key('draw_source')

    const windfarmLayerFeatures = parent.layers.l[windfarmLayerIndex].getSource().getFeatures();
    const userWindfarmLayerFeatures = parent.layers.l[userWindfarmLayerIndex].getSource().getFeatures();

    // zoek windfarm feature
    let feature = null
    userWindfarmLayerFeatures.forEach(function (layerFeature) {
        if (layerFeature.getId() == windfarm) {
            feature = layerFeature;
        }
    });
    if (!feature) {
        windfarmLayerFeatures.forEach(function (layerFeature) {
            if (layerFeature.getId() == windfarm) {
                feature = layerFeature;
            }
        });
    }

    if (feature){
        let units = {
            "area": "m2",
            "area_per_turbine": "m2",
            "bathymetry": "m above MSL",
            "distance_to_coast": "m",
            "distance_to_port": "m",
            "height": "m",
            "levelized_cost_of_energy": "EUR/MWh",
            "n_turbines": "",
            "u_component_of_wind_10m_mean": "m/s",
            "v_component_of_wind_10m_mean": "m/s",
            "wind_angle_mean": "radians",
            "wind_magnitude_mean": "m/s",
            "wind_magnitude_mean_height": "",
            "wind_power_mean": "W",
            "wind_power_total": "W",
        }
        let title = $("<h1>", {"id": "windfarmName", "text": windfarm});

        $('.info-content').html('');
        $('.info-content').append(title);
        const properties = feature.getProperties();
        const entries = Object.entries(properties);
        entries.forEach(function(property){
            if (property[0] == 'geometry'){
                return;
            }
            if (property[0] == 'NAAM'){
                $('#windfarmName').text(property[1]);
            }
            let row = $('<dl>');
            let rowTitle = $('<dt>', {'html': property[0].replace(/_/g, "_<wbr>")});
            let unit = "";
            if (units[property[0]]){
                unit = " [" + units[property[0]] + "]"
            }
            let rowData = $('<dd>', {'text': property[1] + unit});
            row.append(rowTitle, rowData);
            $('.info-content').append(row);
        })
    }
}

function parseURL(url) {
    var parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for (i = 0; i < queries.length; i++) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
    };
}