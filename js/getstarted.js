$(document).ready(function () {
    $('.interest-button').on("click", function(e){
        const inIframe = (window === window.parent) ? false : true;
        const target = $(e.currentTarget)
        const interest = target.data("interest");
        const mode = target.data("mode");

        if (inIframe){
            parent.interest = interest;
            parent.interestMode = mode;
            parent.openInterestLayers();
            parent.$('.mlb-close').click();
        }
    });

    $('.tutorial').on("click", function(){
        const inIframe = (window === window.parent) ? false : true;
        if (inIframe){
            parent.start_tutorial();
        }
    });
});