$(function () {
    //=================================BEGIN TOASTER====================================
    const toasterSuccessBtn = document.getElementById("toasterSuccessBtn");
    const toasterSuccess = document.getElementById("toasterSuccess");

    if (toasterSuccessBtn) {
        const toasterFunctionSuccess =
            bootstrap.Toast.getOrCreateInstance(toasterSuccess);
        toasterSuccessBtn.addEventListener("click", () => {
            toasterFunctionSuccess.show();
        });
    }

    const toasterDangerBtn = document.getElementById("toasterDangerBtn");
    const toasterDanger = document.getElementById("toasterDanger");

    if (toasterDangerBtn) {
        const toasterFunctionDanger =
            bootstrap.Toast.getOrCreateInstance(toasterDanger);
        toasterDangerBtn.addEventListener("click", () => {
            toasterFunctionDanger.show();
        });
    }

    const toasterInfoBtn = document.getElementById("toasterInfoBtn");
    const toasterInfo = document.getElementById("toasterInfo");

    if (toasterInfoBtn) {
        const toasterFunctionInfo =
            bootstrap.Toast.getOrCreateInstance(toasterInfo);
        toasterInfoBtn.addEventListener("click", () => {
            toasterFunctionInfo.show();
        });
    }

    const toasterWarningBtn = document.getElementById("toasterWarningBtn");
    const toasterWarning = document.getElementById("toasterWarning");

    if (toasterWarningBtn) {
        const toasterFunctionWarning =
            bootstrap.Toast.getOrCreateInstance(toasterWarning);
        toasterWarningBtn.addEventListener("click", () => {
            toasterFunctionWarning.show();
        });
    }

    //=================================END TOASTER====================================


    $("#logout-menu").click(function () {
        $.ajax({
            type: "GET",
            url: "/Account/Logout",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) { window.location.href = "/Account/Login"; },
            failure: function (response) { alert(response); },
            error: function (response) { alert(response.responseText); }
        });
    });
 
    function ShowAccessDenied(_msg) {
        ShowLoading('HIDE');
        document.getElementById("toasterAccess-body").innerHTML = _msg;
        const toaster = document.getElementById("toasterAccess");
        const toasterFunction = bootstrap.Toast.getOrCreateInstance(toaster);
        toasterFunction.show();
    }

    function ShowLoading(show) {
        var x = document.getElementById("preloader");
        if (show === 'SHOW') { x.style.visibility = ''; }
        else { x.style.visibility = 'hidden'; }
    }


    function LogError(response) {
        ShowLoading('HIDE');
        console.log(response.responseText);
    }

    function ValidationError(result) {
        if (result.ElementName != null) {
            document.getElementsByName(result.ElementName)[0].focus();
            document.getElementById("error-message-label").innerHTML = "* " + result.Message;
        }
        else { window.alert(result.Message); }
        ShowLoading('HIDE');
        return;
    }
});