$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-Document").addClass("active");
        $("#nav-Document").addClass("bg-primary");
        ShowLoading('HIDE');

        document.querySelector("#CompensationType").addEventListener("change", ShowHideSalaryType);
    });


    function ShowHideSalaryType() {
        var CompensationType = document.querySelector("#CompensationType"); //document.getElementById("TaskTypeId");
        var _CompensationType = CompensationType.value;

        //console.log(_CompensationType);

        if (_CompensationType == "Select Compensation Type") { return; }

        var element = document.getElementById("DIV_SalaryType");
        

        if (_CompensationType == 'Without Compensation') { element.style.display = 'none'; }
        else { element.style.display = 'block';}
    };

    $('#generate-coe-button').on('click', function (e) {
        e.preventDefault();

        var reason = $('#reason-select').val();
        if (!reason || reason === "Select Reason") {
            alert('Please select a reason for requesting the COE.');
            return;
        }

        var CompensationType = document.querySelector("#CompensationType"); 
        var _CompensationType = CompensationType.value;

        var SalaryType = document.querySelector("#SalaryType");
        var _SalaryType = SalaryType.value;

        //GenerateCOE(_CompensationType, _SalaryType, reason);
        ShowLoading('SHOW');
        $.ajax({
            url: '/Document/CanGenerateCOE2',
            type: 'Get',            
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                console.log(response);

                if (response.message == "Success") {
                    if (response.success == true) {
                        
                        $.ajax({
                            url: '/Document/GenerateCOE2',
                            type: 'Get',
                            data: {
                                _compensationtype: _CompensationType,
                                _salarytype: _SalaryType,
                                reason: reason,
                            },
                            contentType: "application/json; charset=utf-8",
                            dataType: "html",
                            success: function (response) {
                                
                                
                                    
                                    ShowLoading('HIDE');
                                    $('#preview_coe_modal').find(".modal-body").innerHTML = '';
                                    $('#preview_coe_modal').find(".modal-body").html(response);
                                    $('#preview_coe_modal').modal('show');


                                
                            },
                        error: function () { alert('An error occurred while generating the COE.'); }
                        });
                    }
                    else {
                        ShowLoading('HIDE');
                        alert("You have reached the maximum number of COE requests for today. Please try again tomorrow."); }

                }
                else {
                    ShowLoading('HIDE');
                    alert(response.message);
                }
            },
            error: function () {
                alert('An error occurred while generating the COE.');
            }
        });
        
    });


    function GenerateCOE(_CompensationType, _SalaryType, reason) {
        //alert('yey');


        $.ajax({
            url: '/Document/CanGenerateCOE',
            type: 'POST',
            data: {
                _compensationtype: _CompensationType,
                _salarytype: _SalaryType,
                reason: reason,
            },
            success: function (response) {
                //console.log(response);

                if (response.message == "Success") {
                    if (response.success == true) {
                        
                        document.getElementById("generate-coe-button").disabled = true;
                        var reportURL = '/Document/GenerateCOE?_compensationtype=' + _CompensationType + '&_salarytype=' + _SalaryType + '&_reason=' + reason;
                        window.open(reportURL, 'Report', 'top=10, status=no, toolbar=no, resizable=yes, scrollbars=yes, width=800, height=600');

                        return false;
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

