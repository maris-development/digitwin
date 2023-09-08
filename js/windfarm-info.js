const M2_TO_KM2 = 1e-6;
const lcoe_prefix = "LCoE_";
const lcoe_parameters = [
    "area",
    "bathymetry",
    "distance_to_coast",
    "distance_to_port",
    "n_turbines",
    "turbine_spacing",
    "spacing",
    "wind_magnitude_mean",
    "wind_magnitude_mean_height",
    "wind_angle_mean",
    "wind_power_mean",
    "wind_power_total",
    "levelized_cost_of_energy",
    "area_per_turbine",
    "effort"
];
const units = {
    "area": "km2",
    "area_per_turbine": "m2",
    "bathymetry": "m above MSL",
    "distance_to_coast": "km",
    "distance_to_port": "km",
    "height": "m",
    "levelized_cost_of_energy": "EUR/MWh",
    "n_turbines": "",
    "u_component_of_wind_10m_mean": "m/s",
    "v_component_of_wind_10m_mean": "m/s",
    "wind_angle_mean": "radians",
    "wind_magnitude_mean": "m/s",
    "wind_magnitude_mean_height": "m",
    "wind_power_mean": "MW",
    "wind_power_total": "MW",
    "spacing": "m",
    "effort": "",
}
const converters = {
    "KM2": function (input) {
        return Math.round(Number(input))
    },
    "area": function (input) {
        input = Number(input) * M2_TO_KM2;
        return Math.round(input)
    },
    "bathymetry": function (input) {
        //van 10.12356 naar 10.12
        input = Number(input) * 100;
        return Math.floor(input) / 100;
    },
    "distance_to_coast": function (input) {
        //van 10123.56 naar 10.1
        input = Number(input) / 100;
        return Math.floor(input) / 10;
    },
    "distance_to_port": function (input) {
        //van 10123.56 naar 10.1
        input = Number(input) / 100;
        return Math.floor(input) / 10;
    },
    "wind_magnitude_mean": function (input) {
        //van 10.12356 naar 10.12
        input = Number(input) * 100;
        return Math.floor(input) / 100;
    },
    "wind_magnitude_mean_height": function (input) {
        //van 10.12356 naar 10.12
        input = Number(input) * 100;
        return Math.floor(input) / 100;
    },
    "wind_power_mean": function (input) {
        //van 1012356.78 naar 10.1
        input = Number(input) / 1e6;
        return Math.floor(input);
    },
    "levelized_cost_of_energy": function (input) {
        //van 10.12356 naar 10.12
        input = Number(input) * 100;
        return Math.round(input) / 100;
    },
    "wind_power_total": function (input) {
        //van 1012356.78 naar 10.1
        input = Number(input) / 1e6;
        return Math.floor(input);
    },
};

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

    if (feature) {

        let isUserWindfarm = windfarm.startsWith('user_windfarm');
        let title = $("<h1>", { "id": "windfarmName" });

        //corrigeer titel wanneer user windfarm.
        if (isUserWindfarm) {
            let id = windfarm.split('.')[1];
            title.text('User Windfarm (' + id + ')');
        } else {
            title.text(windfarm);
        }

        $('.info-content').html('');
        $('.info-content').append(title);

        const properties = feature.getProperties();
        const entries = Object.entries(properties);
        
        entries.forEach(function (property) {
            if (isUserWindfarm && property[0] == 'id') return;
            if (property[0] == 'geometry') return;
            if (property[0] == 'NAAM') {
                $('#windfarmName').text(property[1]);
            }

            //maak row
            let row = $('<dl>');

            let propertyName = property[0];
            if (lcoe_parameters.indexOf(propertyName) > -1) {
                propertyName = lcoe_prefix + propertyName;
            }
            let rowTitle = $('<dt>', { 'html': propertyName.replace(/_/g, "_<wbr>") });

            //voeg unit toe.
            let unit = "";
            if (units[property[0]]) {
                unit = " [" + units[property[0]] + "]"
            }

            //haal property door converter functie heen
            let propertyData = property[1];
            if (converters[property[0]]) {
                let func = converters[property[0]];
                propertyData = func(property[1]);
            }

            // voeg propertyData + unit aan row toe.
            let rowData = $('<dd>', { 'text': propertyData + unit });

            //append row naar .info-content
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