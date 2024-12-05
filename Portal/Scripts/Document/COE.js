$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-document").addClass("active");
               
        ShowLoading('HIDE');
    });


    $('#generate-coe-button').on('click', function (e) {
        e.preventDefault();

        var reason = $('#reason-select').val();
        if (!reason || reason === "Select Reason") {
            alert('Please select a reason for requesting the COE.');
            return;
        }

        GenerateCOE(reason);
    });


    function GenerateCOE(reason) {
        $.ajax({
            url: '/Document/CanGenerateCOE',
            type: 'POST',
            data: {
                reason: reason
            },
            success: function (response) {
                console.log(response);
                if (response.message == "Success") {
                    if (response.success == true) {
                        document.getElementById("generate-coe-button").disabled = true;
                        var reportURL = '/Document/GenerateCOE?_reason=' + reason;
                        window.open(reportURL, 'Report', 'top=10, status=no, toolbar=no, resizable=yes, scrollbars=yes, width=800, height=600');
                    }
                    else { }
                    
                }
                else { alert(response.message); }
            },
            error: function () {
                alert('An error occurred while generating the COE.');
            }
        });
    }
    function ShowLoading(show) {
        var x = document.getElementById("preloader");
        if (show === 'SHOW') { x.style.visibility = ''; }
        else { x.style.visibility = 'hidden'; }
    }
});

