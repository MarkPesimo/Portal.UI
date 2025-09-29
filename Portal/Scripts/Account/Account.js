$(function () {
    $(document).ready(function () {
        ShowLoading('HIDE');
    });
    
    function getDeviceId() {
        const raw = navigator.userAgent
            + navigator.language
            + screen.width + "x" + screen.height
            + navigator.hardwareConcurrency;

        return CryptoJS.SHA256(raw).toString();
    }
    
    function getDeviceDetails() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screen: screen.width + "x" + screen.height,
            cpuCores: navigator.hardwareConcurrency || "N/A"
        };
    }

    $("#login-btn").click(function (e) {
        e.preventDefault();

        var btn = document.getElementById("login-btn");
        btn.disabled = true;
        ShowLoading('SHOW');
        
        var deviceId = getDeviceId();
        var device = getDeviceDetails();
        
        console.log(
            "Device Info:\n\n" +
            "Browser/UserAgent: " + device.userAgent + "\n" +
            "Language: " + device.language + "\n" +
            "Screen: " + device.screen + "\n" +
            "CPU Cores: " + device.cpuCores + "\n\n" +
            "Device ID (hashed): " + deviceId
        );
        var formData = $('#login-Form').serialize() + "&deviceId=" + encodeURIComponent(deviceId);

        $.ajax({
            url: '/Account/Login',
            type: "POST",
            data: formData,
            dataType: 'json',
            success: function (result) {
                ShowLoading('HIDE');
                if (result.Result == "ERROR") {
                    btn.disabled = false;
                    ValidationError(result);
                }
                else { window.location = result.URL; }
            },
            error: LogError
        });
    });

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
            var div_validation = document.querySelector('#div-validation');
            div_validation.style.display = "block";

            document.getElementsByName(result.ElementName)[0].focus();
            document.getElementById("error-message-label").innerHTML = "* " + result.Message;
        }
        else { window.alert(result.Message); }
        ShowLoading('HIDE');
        return;
    }
});
