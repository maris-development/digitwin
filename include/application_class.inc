<?php

/**********************************************/
class application_class
{
/**********************************************/

//----------------------------------------------
// All is public wihtin the application
// simple to overrule
//----------------------------------------------

    public $c_include = ""; // default include path
    public $c_project = "DigiTwin"; // name of project

    public $c_host = ""; // current_host
    public $c_prog = ""; // name of current program

    public $c_page_title = ""; // page title for header

    public $n_lang = 0; // language

    public $a_css = array(); // css aray

    public $conn; // connection to the database
    public $conn_edit; // connection to the database

    public $a_sql_server = array( // sqlserver settings

    );
    public $a_sql_server_writing = array( // sqlserver settings for writing
        
    );

    public $cache_buster = "v=20201127T121500";
    public $a_debug      = array(); // debug array for json/ajax etc

    public $c_library = "v_library"; // default library

    public $a_param = array( // alle mogelijk paramters
        'mlb'  => array('pass' => 'y', 'type' => 'n', 'value' => '', 'default' => '0'),
        'menu' => array('pass' => 'y', 'type' => 'n', 'value' => '', 'default' => '0'), // menu keuze
        'lat_lng' => array('pass' => 'n', 'type' => 'c', 'value' => '', 'default' => ''),

    );

/**********************************************/
    public function __construct()
    {
/**********************************************/

        $this->c_host = $_SERVER['HTTP_HOST'];

        $this->l_html_page = true; // wel of geen html pagina lezen en afdrukken

        $this->c_prog = get_script_name(); // get the name of the script

        $this->a_html_page = array(
            'title'     => 'Ik ben de default title',
            'html_text' => '<p>Ik ben de default html tekst</p>',
        );

//------------------------------------------------
// get all paramters from menu
//------------------------------------------------

        foreach ($this->a_param as $key => &$value) {
            $value['value'] = get_param($key, $value['default'], $value['type']);
        }

    }

/**********************************************/
    public function init()
    {
/**********************************************/

//        $this->conn     = sys_open_database($this->a_sql_server);                                    // open the database

    }

/****************************************************************/
    public function make_ahref($attributes)
    {
/****************************************************************/
//debug($attributes);
//---------------------------------------------------------------
//
//---------------------------------------------------------------

        $ahref = $this->make_link($attributes); // create only the link

        $to_remove = array('menu', 'url', 'qs', 'text', 'rewrite_url', 'rewrite_qs'); // List of variables to remove from the attributes array
        $text      = isset($attributes['text']) ? $attributes['text'] : 'nf link'; // default text

//---------------------------------------------------------------
// 20151119 title niet meer als text en title hetzelfde zijn
// Melissa en Anton samen eens
// dus alleen nog maar als echt opgegeven
//---------------------------------------------------------------

        if (isset($attributes['title'])) {
            $attributes['title'] = $this->get_text_label($this->n_goto_ahref) . ': ' . $attributes['title']; // ga naar toevoegen aan title
        }

        foreach ($to_remove as $value) { // verwijder alle attributes benoemd in to_remove
            if (isset($attributes[$value])) {
                unset($attributes[$value]);
            }
        }

        $attr = '';
        foreach ($attributes as $key => $value) { // build attributes pairs from attribute array(eg. class, id, title, data-*)
            $attr .= ' ' . $key . '="' . $value . '"';
        }

        $ahref = '<a href="' . $ahref . '" ' . $attr . '>' . $text . '</a>';

        return $ahref;

    }

/****************************************************************/
    public function make_link(&$attributes)
    {
/****************************************************************/

//---------------------------------------------------------------
// create a link, also external use possible
//---------------------------------------------------------------

//debug($attributes);
        $attributes['menu'] = isset($attributes['menu']) ? $attributes['menu'] : $this->a_param['menu']['value'];

        if ($attributes['menu'] !== false) {
            $attributes = $this->fill_menu_option($attributes);
        }

        $url = isset($attributes['url']) ? $attributes['url'] : ''; // url to send to pass to make_url()
        $qs  = isset($attributes['qs']) ? $attributes['qs'] : ''; // query string to pass to make_url()

        $rewrite_url = isset($attributes['rewrite_url']) ? $attributes['rewrite_url'] : ''; // if rewrite_url gegeven
        $rewrite_qs  = isset($attributes['rewrite_qs']) ? $attributes['rewrite_qs'] : ''; // if rewrite_qs gegeven

        if ($this->l_rewrite_url and $rewrite_url != '') {
            $link = $this->make_url($rewrite_url, $rewrite_qs, $attributes['menu']); // build the rewrite url
        } else {
            $link = $this->make_url($url, $qs, $attributes['menu']); // build the normnal url
        }

        return $link;
    }

/****************************************************************/
    public function fill_menu_option($attributes)
    {
/****************************************************************/

        $return = $attributes;

        $orph = '';

//        $menu                        = isset($attributes['menu']) ? $attributes['menu']:'';
        $menu = $attributes['menu'];

        if (function_exists("page_fill_menu_option")) {
            page_fill_menu_option($attributes);
        }

        $temp = $menu;

        if (isset($attributes['orph'])) {
            if ($attributes['orph'] > 0) {
                $orph = $attributes['orph'];
                $temp = $orph;
            }

        }

        if (!isset($attributes['url'])) {
            $return['url'] = isset($attributes['url']) ? $attributes['url'] : $this->a_menu[$temp]['menu_action'];

            $return['rewrite_url'] = isset($attributes['rewrite_url']) ? $attributes['rewrite_url'] : '/' . $this->a_menu[$temp]['menu_action_rewrite'];
        }

        $return['text'] = isset($attributes['text']) ? $attributes['text'] : $this->a_menu[$temp]['menu_text'];

//---------------------------------------------------------------
// home overslaan geen querystring
//---------------------------------------------------------------

        if ($temp > 0) {
            $add_qs = 'menu=' . $menu;
            if ($orph != '') {
                $add_qs .= '&orph=' . $orph;
            }
//            $return['qs']    =  isset($attributes['qs'])                            ? 'menu='.$menu.'&'.$return['qs']:'menu='.$menu;
            $return['qs'] = (isset($attributes['qs']) and $attributes['qs'] != '') ? $add_qs . '&' . $return['qs'] : $add_qs;

        }

        return $return;
    }

/****************************************************************/
    public function make_url($url, $qs = '', $menu = '')
    {
/****************************************************************/

// $url = kale url
// qs = totale querystring
// menu is doel menu keuze.     dus ophalen url van menukeuze

        $ahref = '';
        $delim = '?';

        if (strpos($url, '?') !== false) { // test if ? er is
            $delim = '&';
        }

//        $query = $qs;                                                                                    // querystring

        $query = $this->build_a_param_query_string($qs);

        if (is_array($qs)) {
            $query .= $this->build_query_string($query, $qs);
        } else {
            if ($qs) {
                if ($query != '') {
                    $query .= '&';
                }

                $query .= $qs;
            }
        }

        if ($query != '') {
            $query = $delim . $query;
        }

        return $url . $query; // url en querystring return

    }

/**********************************************/
    public function header_top()
    {
/**********************************************/

        rw_line('<!DOCTYPE html>');
        rw_line('<html lang="en">');
        rw_line('<head>');

        rw_line('<title>' . ($this->c_page_title != '' ? $this->c_page_title . ' - ' : '') . $this->c_project . '</title>'); // projectname
        rw_line('<meta charset="utf-8">');
        rw_line('<meta name="viewport" content="width=device-width, initial-scale=1">');

    }

/**********************************************/
    public function add_css()
    {
/**********************************************/
        $css_default = array('rel' => 'stylesheet', 'type' => 'text/css'); //default attributes

        foreach ($this->a_css as $css) {
            $attr    = '';
            $builder = function ($v, $i) use (&$attr) { //closure or anonymous functions
                $attr .= ' ' . $i . '="' . $v . '"';
            };

            $css_attr = $css_default;

            foreach (array_diff_assoc($css, $css_default) as $key => $value) { //Only get key value pairs that are not in the array
                $css_attr[$key] = $value;
            }

            array_walk($css_attr, $builder); //apply closure to the css attr array
            rw_line('<link' . $attr . ' />');
        }
    }
/****************************************************************/
    public function header_mlb()
    {
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
    public function header_html()
    {
/**********************************************/

        $this->header_top();

        if ($this->a_param['mlb']['value'] == 1) {
            $this->header_mlb();
            return;
        }

        $this->add_css();

        // rw_line('<script type="text/javascript" src="/java/jquery/jquery-2.1.4.min.js"></script>');
        // rw_line('<script type="text/javascript" src="/java/jquery/jquery-2.1.4.min.js"></script>');

        if (function_exists("page_script")) {
            page_script();
        }

        rw_line('</head>');

        rw_line('<body>');

    }

/****************************************************************/
    public function footer_html()
    {
/****************************************************************/
        rw('</body>');
        rw('</html>');
    }

/****************************************************************/
    public function content_html()
    {
/****************************************************************/

        if (!$this->l_html_page) {
            return;
        }
        // geen html_page

        rw('<h1>' . $this->a_html_page['title'] . '</h1>');

        rw($this->a_html_page['html_text']);

        if (function_exists("page_content_html")) {
            page_content_html();
        }

    }
/**********************************************/
    public function content_header()
    {
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
    public function content()
    {
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
    public function content_footer()
    {
/**********************************************/

        if (function_exists("content_footer_applic")) {
            content_footer_applic();
        }

        rw_line('<footer>');
        rw_line('</footer>');
    }

/**********************************************/
    public function make_date($date, $type, $turn = false)
    {
/**********************************************/
// input default mm/dd/yyyy
// with turn true  dd/mm/yyyy

//ISO date http://en.wikipedia.org/wiki/ISO_8601

        $result = '';
        $delim  = ' ';

        if (strpos($date, '/') === false && strpos($date, '-') === false && strlen($date) == 8) {
            $date = substr($date, 0, 2) . '/' . substr($date, 2, 2) . '/' . substr($date, 6);
        }

        $date = str_replace('-', '/', $date);

        if ($turn) {
            $a_temp = explode('/', $date);
            $date   = $a_temp[1] . '/' . $a_temp[0] . '/' . $a_temp[2];
        }

        $a_temp = explode('/', $date);

        $date = substr('00' . $a_temp[0], -2) . '/' . substr('00' . $a_temp[1], -2) . '/' . $a_temp[2];

        if (!$date = strtotime($date)) {
            return $result;
        }

        //debug($date);

        switch ($type) {
            case 1: // 16-12-0213
                $result = date('d-m-Y', $date);
                break;
            case 2: // maandag 16 december 2013

            case 3: // maandag 16 december 2013 [13:21]

                $result = $this->get_text_label($this->make_date_day($date), 'dagen') . $delim . date('d', $date) . $delim . $this->get_text_label(date('n', $date), 'maanden') . $delim . date('Y', $date) . ($type == 3 ? date(' H:i', $date) : '');
                break;

            case 4: // do 16 dec 2013

                $result = $this->get_text_label($this->make_date_day($date), 'dagen_klein') . $delim . date('d', $date) . $delim . $this->get_text_label(date('n', $date), 'maanden_klein') . $delim . date('Y', $date) . '';
                break;

            case 5: // donderdag 16 dec 2013

                $result = $this->get_text_label($this->make_date_day($date), 'dagen') . $delim . date('d', $date) . $delim . $this->get_text_label(date('n', $date), 'maanden_klein') . $delim . date('Y', $date) . '';
                break;

            case 6: // 16 maart (zonder jaartal)

                $result = date('d', $date) . $delim . $this->get_text_label(date('n', $date), 'maanden') . '';
                break;

            case 7: // 16 maart 2016

                $result = date('j', $date) . $delim . $this->get_text_label(date('n', $date), 'maanden') . $delim . date('Y', $date) . '';
                break;

            case 8: // 16 mrt 2016

                $result = date('j', $date) . $delim . $this->get_text_label(date('n', $date), 'maanden_klein') . $delim . date('Y', $date) . '';
                break;

        }

        return $result;
    }

/**********************************************/
    public function make_date_day($date)
    {
/**********************************************/

// php heeft zondag als 0
// de rest van de (maris) wereld heeft zondag als 1

        $day = date('N', $date);
        $day = $day + 1;
        if ($day > 7) {
            $day = 1;
        }
        return $day;
    }

/****************************************************************/
    public function load_ol6_script()
    {
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
        rw_line('<script type="text/javascript" src="/java/maris_ol_6.1.1/map_functions' . (is_local() ? '' : '-min') . '.js?' . $this->cache_buster . '"></script>');

    }

/****************************************************************/
    public function create_mlb()
    {
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
