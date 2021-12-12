(function ($) {

    /* Start of Logo-Navbar detection */
    // Upon first load, proper logo color is detected and put in.
    $(document).ready(function(){
        if($(window).width() > 767) {
            $('#logo-black').css("display", "none");
            $('#logo-white').css("display", "inline");
        } else {
            $('#logo-black').css("display", "inline");
            $('#logo-white').css("display", "none");
        }
    });

    // If window is re-sized, logo is switched appropriately.
    $(window).resize(function(){
        // Perform something here...
        if($(window).width() > 767) {
            $('#logo-black').css("display", "none");
            $('#logo-white').css("display", "inline");
        } else {
            $('#logo-black').css("display", "inline");
            $('#logo-white').css("display", "none");
        }
    });

    // Change logo to fit white-background of nav bar once scrolled from top.
    $(window).scroll(function(){
        if($(window).width() >= 768) {
            if ($(this).scrollTop() === 0) {
                $('#logo-black').css("display", "none");
                $('#logo-white').css("display", "inline");
            } else {
                $('#logo-white').css("display", "none");
                $('#logo-black').css("display", "inline");
            }
        } else {
            $('#logo-white').css("display", "none");
            $('#logo-black').css("display", "inline");
        }
    }); /* End of Logo-Navbar detection */


    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 100
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function () {
        $('.navbar-toggle:visible').click();
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 50
        }
    });

})(jQuery); // End of use strict







