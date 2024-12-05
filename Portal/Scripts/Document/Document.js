$(function () {
    $(document).ready(function () {
        //$(".navbar-nav").find(".active").removeClass("active");
        //$("#nav-document").addClass("active");
               
        ShowLoading('HIDE');
    });



    function ShowLoading(show) {
        var x = document.getElementById("preloader");
        if (show === 'SHOW') { x.style.visibility = ''; }
        else { x.style.visibility = 'hidden'; }
    }
});

