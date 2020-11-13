<!DOCTYPE html>
<html lang="en">

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" type="text/css" href="/css/layers_info.css" />
</head>

<body>
	<div id="wrapper">
		<?php

		$bb = file_get_contents("../assets/layers_info.json");
		$layers_info = json_decode($bb, true);
		$filter_name = get_param('name', '', 'c');


		if ($layers_info === null) {
			echo "incorrect data";
			return;
		}

		if ($filter_name != "") {
			single_layer($layers_info, $filter_name);
		} else {
			all_layers($layers_info);
		}
		function all_layers($layers_info)
		{
			rw('<table border="1">');
			rw('<tr>');
			rw('<th>Name</th>');
			rw('<th>Title</th>');
			rw('<th>Date</th>');
			rw('<th>Source</th>');
			rw('<th>Metadata</th>');
			rw('</tr>');
			foreach ($layers_info['layers'] as $layer) {
				rw('<tr>');
				rw('<td>' . get_field('name', $layer) . '</td>');
				rw('<td>' . get_field('title', $layer) . '</td>');
				rw('<td>' . get_field('date', $layer) . '</td>');
				rw('<td>' . get_field('source', $layer) . '</td>');
				rw('<td>' . get_field('metadata', $layer) . '</td>');
				rw('</tr>');
			}
			rw('</table>');
		}

		function single_layer($layers_info, $filter_name)
		{
			$layer_info = array_filter($layers_info, function ($value) use ($filter_name) {
				if (isset($value["layer_name"])) {
					return ($value["layer_name"] == $filter_name);
				} else {
					return false;
				}
			});

			$layer_info = reset($layer_info);
			if ($layer_info) {
				$layer = $layer_info;
				$display_fields = [
					'source' => [
						'title' => "Source",
						"type" => "url"
					],
					'digitwin_wms' => [
						'title' => "Digitwin WMS",
						"type" => "url"
					],
					'metadata_url' => [
						'title' => "Metadata URL",
						"type" => "url"
					],
					'date' => [
						'title' => "Date",
						"type" => "text"
					]
				];

				rw_line('<div class="info-content">');

				// eerst titel
				rw_line('<h1>'.$layer['title'].'</h1>');

				// daarna metadata
				if (isset($layer['metadata']) && $layer['metadata'] != "") {
					rw_line('<p>'.$layer['metadata'].'</p>');
				}
				$legendUrl = get_param("legend", '', 'c');
				if ($legendUrl != ''){
					rw_line('	<dl>');
					rw_line('		<dt>Legend</dt>');
					rw_line('		<dd><img src="'.base64_decode($legendUrl).'"/></dd>');
					rw_line('	</dl>');
				}
				
				foreach ($display_fields as $field => $info) {
					if (!isset($layer[$field]) || $layer[$field] == "") {
						continue;
					}
					$value = $layer[$field];
					switch ($info['type']) {
						case "url":
							if(strpos($value, "http") !== false){
								$value = '<a href="' . $value . '" target="blank">' . $value . '</a>';
							}
							break;
					}
					rw_line('	<dl>');
					rw_line('		<dt>' . $info['title'] . '</dt>');
					rw_line('		<dd>' . $value . '</dd>');
					rw_line('	</dl>');
				}
				rw_line('</div>');
			}
		}
		?>
	</div>
</body>

</html>