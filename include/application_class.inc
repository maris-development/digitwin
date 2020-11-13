<?php

/**********************************************/
 class application_class {
/**********************************************/

//----------------------------------------------
// All is public wihtin the application
// simple to overrule
//----------------------------------------------

	public $c_include					= "";																			// default include path
    public $c_project					= "DigiTwin";																	// name of project

    public $c_host						= "";																			// current_host
    public $c_prog						= "";																			// name of current program

    public $c_page_title				= "";																			// page title for header

    public $n_lang						= 0;																			// language

    public $a_css						= array();																		// css aray


	public $cache_buster				= "v=20200916T111100";
    public $a_debug 					= array();																		// debug array for json/ajax etc


    public $c_library					= "v_library";																	// default library

	

    public $a_param						= array(																			// alle mogelijk paramters
											'mlb'=>				array('pass'=>'y', 'type'=>'n',		'value'=>'', 	'default'=>'0'),	
											'menu'=>			array('pass'=>'y', 'type'=>'n',		'value'=>'', 	'default'=>'0'),	// menu keuze
    										'lat_lng'=>			array('pass'=>'n', 'type'=>'c',		'value'=>'',	'default'=>'')

   									);

/**********************************************/
    function __construct() {
/**********************************************/

		$this->c_host							= $_SERVER['HTTP_HOST'];

		$this->l_html_page						= true;															// wel of geen html pagina lezen en afdrukken

	   	$this->c_prog							= get_script_name();									// get the name of the script

		$this->a_html_page						= array(
												'title'				=>'Ik ben de default title',
												'html_text'			=>'<p>Ik ben de default html tekst</p>',
												);


//------------------------------------------------
// get all paramters from menu
//------------------------------------------------

		foreach($this->a_param as $key => &$value){
			$value['value'] = get_param($key, $value['default'], $value['type']);
		}

	}




/**********************************************/
    function init() {
/**********************************************/


}

/**********************************************/
    function header_top() {
/**********************************************/

	rw_line('<!DOCTYPE html>');
	rw_line('<html lang="en">');
	rw_line('<head>');

	rw_line('<title>'.($this->c_page_title !='' ? $this->c_page_title.' - ':'').$this->c_project.'</title>');											// projectname
	rw_line('<meta charset="utf-8">');
	rw_line('<meta name="viewport" content="width=device-width, initial-scale=1">');


}

/**********************************************/
    function add_css() {
/**********************************************/
	$css_default = array('rel'=>'stylesheet', 'type'=>'text/css');							//default attributes

	foreach ($this->a_css as $css) {
		$attr = '';
		$builder = function($v, $i) use (&$attr){																//closure or anonymous functions
			$attr .= ' '.$i.'="'.$v.'"';
		};

		$css_attr = $css_default;

    	foreach (array_diff_assoc($css, $css_default) as $key=>$value) {										//Only get key value pairs that are not in the array
			$css_attr[$key] = $value;
		}

		array_walk($css_attr, $builder);																		//apply closure to the css attr array
		rw_line('<link'.$attr.' />');
	}
}
/****************************************************************/
    function header_mlb() {
/****************************************************************/

//---------------------------------------------------------------
// only when mlb page is used
//---------------------------------------------------------------

	$this->add_css();

	if (function_exists("page_script")) {
		page_script();
	}

	rw_line('</head>');

	rw_line('<body>');

	}

/**********************************************/
    function header_html() {
/**********************************************/

	$this->header_top();

	if ($this->a_param['mlb']['value']==1) {
		$this->header_mlb();
		return;
	}


	$this->add_css();


	if (function_exists("page_script")) {
		page_script();
	}

	rw_line('</head>');

	rw_line('<body>');

	}

/****************************************************************/
 	function footer_html() {
/****************************************************************/
		rw('</body>');
		rw('</html>');
	 }

/****************************************************************/
	function content_html() {
/****************************************************************/

	if (!$this->l_html_page) return;																	// geen html_page

	rw('<h1>'.$this->a_html_page['title'].'</h1>');

	rw($this->a_html_page['html_text']);

	if (function_exists("page_content_html")) {
		page_content_html();
	}


}
/**********************************************/
    function content_header() {
/**********************************************/

	rw_line('<header>');

		rw_line('<div id="topbar">');

			rw_line('<div class="wrapper">');
				rw_line('<div class="brand-logo"></div>');
			rw_line('</div>');

		rw_line('</div>');

	rw_line('</header>');
	}

/****************************************************************/
	function content() {
/****************************************************************/

		if (function_exists("applic_content_header")) {
			applic_content_header();
		} else {
			$this->content_header();
		}

		rw('<div id="main">');

			if (function_exists("highlight_content")) {
				highlight_content();
			}

			rw('<div class="wrapper">');

			$this->create_mlb();

				rw('<div id="container" class="clearfix">');

				rw('<div id="content">');

					$this->content_html();

					if (function_exists("content_applic")) {
						content_applic();
					}

				rw('</div>');

				rw('</div>');

			rw('</div>');
		rw('</div>');

		$this->content_footer();
	}

/**********************************************/
    function content_footer() {
/**********************************************/

		if (function_exists("content_footer_applic")) {
			content_footer_applic();
		}

		rw_line('<footer>');
		rw_line('</footer>');
	}


/****************************************************************/
	function load_ol6_script() {
/****************************************************************/
//----------------------------------------------------------------
// load all scripts and css for openlayers
//
// ak 20191114
// new version ol6.1.1
//----------------------------------------------------------------

		rw_line('<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@turf/turf@5/turf.min.js"></script>');
		rw_line('<script type="text/javascript" src="/java/ol6.1.1/ol.js"></script>');
		rw_line('<link rel="stylesheet" href="/java/ol6.1.1/ol.css" />');
		rw_line('<script type="text/javascript" src="/java/maris_ol_6.1.1/map_functions'.(is_local() ? '' : '-min').'.js?'.$this->cache_buster.'"></script>');

	}

/****************************************************************/
 function create_mlb() {
/****************************************************************/

		switch ($this->a_param['mlb']['value']) {
			case 1:
				return;
				break;
		}

		rw('<div id="mlb_container" class="mlb-container">');
			rw('<div class="mlb-content">');
				rw('<div>');
					rw('<ul>');
						rw('<li class="mlb_close mlb-close" title="Close this window">Close window</li>');
					rw('</ul>');
				rw('</div>');
				rw('<span id="mlb_content"></span>');
			rw('</div>');
		rw('</div>');
	}

}
//==============================================
//==============================================
//==============================================
//==============================================
?>