const get_capabilities_proxy = '/content/openlayers_info_proxy.php?url='

var wms = {
	wms_format: 'image/png',
	wms_url: ''
};

//----------------------------------------------------------------
// start after loading the html_page
//----------------------------------------------------------------

$(document).ready(function () {

	//----------------------------------------------------------------
	// get_capabilities
	//----------------------------------------------------------------

	$('.get-capabilities').click(function () {
		get_capabilities();
	});


	//----------------------------------------------------------------
	// move selected layers to map
	//----------------------------------------------------------------

	$('.add-layers').click(function () {
		let layersAdded = new Array();
		$(":checked.wms-check").each(
			function () {
				parent.add_external_layer({ Title: $(this).data("title"), Name: $(this).val(), url: wms.wms_url, format: wms.wms_format, queryable: $(this).data("queryable") });
				layersAdded.push($(this).val());
			}
		);

		if (layersAdded.length > 0){
			parent.create_legend_list(layersAdded);
		}
		parent.$('.mlb-close').click();
	});



})


/****************************************************************/
function get_capabilities() {

	// leeg layer list
	$('#add_layer_id').html('');

	//----------------------------------------------------------------
	// fetch url or manual url
	//----------------------------------------------------------------

	const wms_url = $('#wms_url').val();

	if (wms_url == '') return;

	wms.wms_url = wms_url;

	//----------------------------------------------------------------
	// prepare getcapabilities
	//----------------------------------------------------------------

	let url = wms_url;
	if (url.indexOf('?') == -1) {
		url += '?';
	}
	url += 'service=WMS&request=GetCapabilities';

	if (get_capabilities_proxy != '') {
		url = get_capabilities_proxy + encodeURIComponent(url) + '&rnd=' + rnd();
	}
	var parser = new ol.format.WMSCapabilities();

	//----------------------------------------------------------------
	// get the url
	//----------------------------------------------------------------
	fetch(url)
		.then(function (response) {
			return response.text();
		})
		.then(function (text) {
			try {
				var result = parser.read(text);
				wms.wms_format = 'image/png';

				let layerList = $("<div>", { id: "wms_layer_list" });

				// lijst met layers ophalen
				result.Capability.Layer.Layer.forEach(function (item) {
					// als layer geen naam heeft, dan sublayers proberen
					if (!item.Name){
						item.Layer.forEach(function (item2) {
							layerList.append(createLayer(item2))
						})
					} else {
						layerList.append(createLayer(item))
					}

				});
				$('#layer-list').html(layerList);
			} catch(error) {
				alert("Unable to parse WMS Capabilities");
			}
        }).catch(function(error) {
			console.log(error);
		});

}

function createLayer(capabilitiesLayer){
    let layer = $("<section>", { class: "container-input" });
    let input = $("<input>", { "data-title": capabilitiesLayer.Title, "data-queryable": capabilitiesLayer.queryable, "class": "wms-check", "type": "checkbox", "value": capabilitiesLayer.Name, "id": capabilitiesLayer.Name });
    let label = $("<label>", { "for": capabilitiesLayer.Name, "text": (capabilitiesLayer.Name + '(' + capabilitiesLayer.Title + ')') });
    layer.append(input, label);

    return layer;
}

/****************************************************************/
/****************************************************************/
/****************************************************************/
/****************************************************************/
