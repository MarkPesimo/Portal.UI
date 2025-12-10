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
            platform: navigator.platform,
            vendor: navigator.vendor,
            screen: screen.width + "x" + screen.height,
            cpuCores: navigator.hardwareConcurrency || "N/A"
        };
    }

    // $("#location-btn").click(function (e) {
    //    e.preventDefault();

    //     $.get("http://ipinfo.io", function (response) {
    //         alert(response.ip);
    //     }, "jsonp");
     
    //});

    $("#location-btn").click(function (e) {
        e.preventDefault();

        //callAsyncController();
        $.ajax({
            url: '/Account/GetLocation',
            type: "POST",
            dataType: 'json',
            success: function (result) {
                //console.log(result);
                if (result.Status == "Success") {
                    alert('Latitude : ' + result.Latitude);
                    alert('Longitude : ' + result.Longitude);
                    
                //    //console.log(result.Result.location);
                }
                else { alert(result);}
            }
        });
    });

    //async function callAsyncController() {
    //    try {
    //        const response = await fetch('/Account/GetLocationAsync',
    //        {
    //            method: 'POST', // or 'POST', 'PUT', etc.
    //            headers:
    //            {
    //                'Content-Type': 'application/json'
    //            }
    //            // body: JSON.stringify({ data: 'someValue' }) // for POST/PUT requests
    //        });

    //        if (!response.ok) {
    //            throw new Error(`HTTP error! status: ${response.status}`);
    //        }

    //        const data = await response.json(); // or .text() if returning plain text
    //        console.log(data);
    //    } catch (error) {
    //        console.error('Error calling async controller:', error);
    //    }
    //}

    $("#login-btn").click(function (e) {
        e.preventDefault();

        //var deviceId = getDeviceId();
        //var device = getDeviceDetails();

        //console.log(
        //    "Device Info:\n\n" +
        //    "Browser/UserAgent: " + device.userAgent + "\n" +
        //    "Flatform: " + device.platform + "\n" +
        //    "Vendor: " + device.vendor + "\n" +
        //    "Language: " + device.language + "\n" +
        //    "Screen: " + device.screen + "\n" +
        //    "CPU Cores: " + device.cpuCores + "\n\n" +
        //    "Device ID (hashed): " + deviceId
        //);


        var btn = document.getElementById("login-btn");
        btn.disabled = true;
        ShowLoading('SHOW');
        
 
        var formData = $('#login-Form').serialize(); // + "&deviceId=" + encodeURIComponent(deviceId);
        btn.disabled = true;

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
