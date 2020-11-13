<?php
include_once("/include/application_class.inc");

$applic = new application_class();

$applic->l_html_page = false;

$applic->init();

$applic->header_html();

$applic->content();

function page_script()
{
    rw_line('<script type="text/javascript" src="/js/start' . (is_local() ? '' : '-min') . '.js"></script>');
}

function content_applic()
{
    ?>
    <div class="row">
        <h3>What is your main interest</h3>
        <div class="energy-icon group-select" data-group="energy">Energy</div>
        <div class="ecology-icon group-select" data-group="ecology">Ecology</div>
        <div class="shipping-and-fishing-icon group-select" data-group="shipping-fishing">Shipping / fishing</div>
    </div>
    <div class="row">
        <h3>Expert</h3>
        <div class="energy-icon group-select" data-group="energy" data-mode="expert">Energy</div>
        <div class="ecology-icon group-select" data-group="ecology" data-mode="expert">Ecology</div>
        <div class="shipping-and-fishing-icon group-select" data-group="shipping-fishing" data-mode="expert">Shipping / fishing</div>
    </div>
<?php
}
