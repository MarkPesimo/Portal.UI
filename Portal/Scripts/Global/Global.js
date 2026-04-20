$(function () {
    $(document).ready(function () {
        GetClockInClockOut();         
    });

    function GetClockInClockOut() {
        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Attendance/GetClockInClockOut",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                ShowLoading('HIDE');
                
                var shiftHtml = '<i class="fa-solid fa-business-time"></i> Shift : ' + response.ShiftDescription;
                var deskShift = document.getElementById('my-shift');
                var mobShift = document.getElementById('mobile-shift-display');

                if (deskShift) deskShift.innerHTML = shiftHtml;
                if (mobShift) mobShift.innerHTML = shiftHtml;
                
                var restDayValue = (response.RestDay == null || response.RestDay == '') ? 'N/A' : response.RestDay;

                var deskRD = document.getElementById('my-restday'); 
                var mobRD = document.getElementById('mobile-restday-display');

                if (deskRD) deskRD.innerHTML = restDayValue;
                if (mobRD) mobRD.innerHTML = restDayValue;
                
                var btnIn = document.getElementById('clock-in-button');
                var btnInMob = document.getElementById('clock-in-button-mob');
                var btnOut = document.getElementById('clock-out-button');
                var btnOutMob = document.getElementById('clock-out-button-mob');

                [btnIn, btnInMob, btnOut, btnOutMob].forEach(function (btn) {
                    if (btn) {
                        btn.setAttribute('attendance_id', response.Id);
                        btn.setAttribute('shift_id', response.ShiftId);
                    }
                });
                
                var clockInText = (response.ClockIn == '')
                    ? '<i class="fa-regular fa-clock"></i> Clock In'
                    : '<i class="fa-regular fa-clock"></i> ' + response.ClockIn;

                if (btnIn) {
                    btnIn.innerHTML = clockInText;
                    btnIn.setAttribute('data-clockin-value', response.ClockIn);
                }
                if (btnInMob) {
                    btnInMob.innerHTML = clockInText;
                    btnInMob.setAttribute('data-clockin-value', response.ClockIn);
                }
                
                var clockOutText = (response.ClockOut == '')
                    ? '<i class="fa-regular fa-clock"></i> Clock Out'
                    : '<i class="fa-regular fa-clock"></i> ' + response.ClockOut;

                if (btnOut) {
                    btnOut.innerHTML = clockOutText;
                    btnOut.setAttribute('data-clockout-value', response.ClockOut);
                }
                if (btnOutMob) {
                    btnOutMob.innerHTML = clockOutText;
                    btnOutMob.setAttribute('data-clockout-value', response.ClockOut);
                }

            },
            failure: function (response) { console.log(response); ShowLoading('HIDE'); },
            error: function (response) { console.log(response); ShowLoading('HIDE'); }
        });
    };

    //$("#get_location").click(function (e) {
    //    e.preventDefault();

    //    if (navigator.geolocation) {
    //        navigator.geolocation.getCurrentPosition(success, error);
    //    } else {
    //        alert("Geolocation is not supported by this browser.");
    //    }
    //});

    

    $(document).on('click', '#clock-in-button, #clock-in-button-mob', function () {
        var AttendanceId = $(this).attr("attendance_id");
        var ShiftId = $(this).attr("shift_id");
        var _clockin_btn = document.getElementById('clock-in-button').getAttribute("data-clockin-value");

        if (_clockin_btn != '') {
            ShowDangerMessage('The system has detected that you have already clocked in. Please verify your time entry.');
            return;
        }

        ShowLoading('SHOW');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    $.ajax({
                        url: '/Attendance/ClockIn',
                        type: "POST",
                        data: {
                            '_id': AttendanceId,
                            '_shiftid': ShiftId,
                            '_latitude': position.coords.latitude,
                            '_longitude': position.coords.longitude
                        },
                        dataType: 'json',
                        success: function (result) {
                            ShowLoading('HIDE');
                            if (result.Status == "SUCCESS") {
                                GetClockInClockOut();
                                CheckAttendanceNotification('TIME IN');
                            } else {
                                ShowAccessDenied(result.result);
                            }
                        }
                    });
                },
                function () {
                    $.ajax({
                        url: '/Attendance/ClockIn',
                        type: "POST",
                        data: {
                            '_id': AttendanceId,
                            '_shiftid': ShiftId,
                            '_latitude': 0,
                            '_longitude': 0
                        },
                        dataType: 'json',
                        success: function (result) {
                            ShowLoading('HIDE');
                            if (result.Status == "SUCCESS") {
                                GetClockInClockOut();
                                CheckAttendanceNotification('TIME IN');
                            }
                            else { ShowAccessDenied(result.result); }
                        }
                    });
                });
        }
        else {
            $.ajax({
                url: '/Attendance/ClockIn',
                type: "POST",
                data: {
                    '_id': AttendanceId,
                    '_shiftid': ShiftId,
                    '_latitude': 0,
                    '_longitude': 0
                },
                dataType: 'json',
                success: function (result) {
                    ShowLoading('HIDE');
                    if (result.Status == "SUCCESS") {
                        GetClockInClockOut();
                        CheckAttendanceNotification('TIME IN');
                    }
                    else { ShowAccessDenied(result.result); }
                }
            });
        }
    });

    function CheckAttendanceNotification(processType) {
        $.ajax({
            url: '/Attendance/GetAttendanceNotification',
            type: "GET",
            data: { 'process': processType },
            dataType: 'json',
            success: function (message) {
                var successText = (processType === 'TIME IN') ? 'You have successfully Clocked-In.' : 'You have successfully Clocked-Out.';
                var $iconBox = $('.icon-box');
                var $icon = $iconBox.find('i');
                
                var themeColor = '#007bff';
                var themeBg = '#eef6ff';
                var iconClass = 'fa-solid fa-calendar-check';

                if (message != null && message != '') {
                    var formattedNotification = message.split(':').map(function (item) {
                        return item.trim();
                    }).join('<br/>');

                    var fullHtmlMessage = '<strong class="text-success">' + successText + '</strong><br/><br/>' + formattedNotification;
                    $('#attendanceNotificationMessage').html(fullHtmlMessage);

                    if (message.includes("Holiday")) {
                        var lowerMessage = message.toLowerCase();

                        switch (true) {
                            case lowerMessage.includes("new year"): iconClass = 'fa-solid fa-champagne-glasses'; break;
                            case lowerMessage.includes("christmas"): iconClass = 'fa-solid fa-mistletoe'; break;
                            case lowerMessage.includes("labor") || lowerMessage.includes("worker"): iconClass = 'fa-solid fa-briefcase'; break;
                            case lowerMessage.includes("eid") || lowerMessage.includes("al-fitr"): iconClass = 'fa-solid fa-mosque'; break;
                            case lowerMessage.includes("maundy") || lowerMessage.includes("good friday") || lowerMessage.includes("easter"): iconClass = 'fa-solid fa-church'; break;
                            case lowerMessage.includes("araw ng kagitingan") || lowerMessage.includes("valor"): iconClass = 'fa-solid fa-award'; break;
                            case lowerMessage.includes("independence") || lowerMessage.includes("kalayaan"): iconClass = 'fa-solid fa-flag'; break;
                            case lowerMessage.includes("hero") || lowerMessage.includes("rizal") || lowerMessage.includes("bonifacio") || lowerMessage.includes("ninoy"): iconClass = 'fa-solid fa-monument'; break;
                            case lowerMessage.includes("edsa") || lowerMessage.includes("revolution"): iconClass = 'fa-solid fa-people-group'; break;
                            case lowerMessage.includes("anniversary") || lowerMessage.includes("foundation"): iconClass = 'fa-solid fa-cake-candles'; break;
                            case lowerMessage.includes("fiesta") || lowerMessage.includes("festival"): iconClass = 'fa-solid fa-mask'; break;
                            case lowerMessage.includes("special working") || lowerMessage.includes("additional special"): iconClass = 'fa-solid fa-clipboard-check'; break;
                        }
                        $iconBox.css({ 'background': themeBg, 'color': themeColor });
                        $icon.attr('class', iconClass);
                    } else {
                        $iconBox.css({ 'background': '#fff4e5', 'color': '#ffa000' });
                        $icon.attr('class', 'fa-solid fa-circle-exclamation');
                    }
                } else {
                    var defaultMessage = '<strong class="text-success">' + successText + '</strong><br/><br/>Have a great day ahead!';
                    $('#attendanceNotificationMessage').html(defaultMessage);
                    
                    $iconBox.css({ 'background': themeBg, 'color': themeColor });
                    $icon.attr('class', 'fa-solid fa-calendar-check');
                }
                
                $('#attendanceNotificationModal').modal('show');
            }
        });
    }

    $('#clockin_modal').on('click', '#clock-out-previous-button', function () {
        var AttendanceId = $(this).attr("attendance_id");
        var ShiftId = $(this).attr("shift_id");

        $.ajax({
            url: '/Attendance/ClockOut',
            type: "POST",
            data:
            {
                '_id': AttendanceId,
                '_shiftid': ShiftId
            },
            dataType: 'json',
            success: function (result) {
                ShowLoading('HIDE');
                if (result.Status == "SUCCESS") {
                    $("#clockin_modal").modal('hide');
                    GetClockInClockOut();
                    ShowSuccessMessage('You have successfully Clock-Out.')
                }
                else {
                    
                    alert(result.msg);
                }
            }
        });
    });

    $(document).on('click', '#clock-out-button, #clock-out-button-mob', function () {
        var AttendanceId = $(this).attr("attendance_id");
        var ShiftId = $(this).attr("shift_id");

        ShowLoading('SHOW');
        
        if (AttendanceId == 0) {
            $.ajax({
                type: "GET",
                url: '/Attendance/GetPreviousClockIn',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    ShowLoading('HIDE');
                    if (response.Status == "SUCCESS") {
                        $("#div-label-no-clockin-today, #div-label-with-previous-clockin, #div-with-previous-clockin")
                            .addClass("d-none")
                            .css("visibility", "visible");

                        if (response.WithPrevious == true) {
                            $("#div-label-with-previous-clockin").removeClass("d-none");
                            $("#div-with-previous-clockin").removeClass("d-none");
                            
                            $('#label-date-log').text(response.result.DateLog);
                            $('#label-shift-description').text(response.result.ShiftDescription);
                            $('#label-clock-in').text(response.result.ClockIn);
                            $('#label-clock-out').text(response.result.ClockOut || "--:--");
                            
                            $('#clock-out-previous-button')
                                .attr('attendance_id', response.result.Id)
                                .attr('shift_id', response.result.ShiftId);
                        }
                        else {
                            $("#div-label-no-clockin-today").removeClass("d-none");
                        }
                        
                        $("#clockin_modal").modal('show');
                    } else {
                        ShowAccessDenied(response.result);
                    }
                },
                failure: function (response) { LogError(response); },
                error: function (response) { LogError(response); }
            });
        }
        else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        $.ajax({
                            url: '/Attendance/ClockOut',
                            type: "POST",
                            data: {
                                '_id': AttendanceId,
                                '_shiftid': ShiftId,
                                '_latitude': position.coords.latitude,
                                '_longitude': position.coords.longitude
                            },
                            dataType: 'json',
                            success: function (result) {
                                ShowLoading('HIDE');
                                if (result.Status == "SUCCESS") {
                                    GetClockInClockOut();
                                    CheckAttendanceNotification('TIME OUT');
                                } else {
                                    ShowAccessDenied(result.result);
                                }
                            }
                        });
                    },
                    function () {
                        $.ajax({
                            url: '/Attendance/ClockOut',
                            type: "POST",
                            data: {
                                '_id': AttendanceId,
                                '_shiftid': ShiftId,
                                '_latitude': 0,
                                '_longitude': 0
                            },
                            dataType: 'json',
                            success: function (result) {
                                ShowLoading('HIDE');
                                if (result.Status == "SUCCESS") {
                                    GetClockInClockOut();
                                    CheckAttendanceNotification('TIME OUT');
                                } else {
                                    ShowAccessDenied(result.result);
                                }
                            }
                        });
                    }
                );
            } else {
                $.ajax({
                    url: '/Attendance/ClockOut',
                    type: "POST",
                    data: {
                        '_id': AttendanceId,
                        '_shiftid': ShiftId,
                        '_latitude': 0,
                        '_longitude': 0
                    },
                    dataType: 'json',
                    success: function (result) {
                        ShowLoading('HIDE');
                        if (result.Status == "SUCCESS") {
                            GetClockInClockOut();
                            CheckAttendanceNotification('TIME OUT');
                        } else {
                            ShowAccessDenied(result.result);
                        }
                    }
                });
            }
        }
    });


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

    function ShowSuccessMessage(_msg) {
        ShowLoading('HIDE');
        document.getElementById("toasterSuccess-body").innerHTML = _msg;
        const toaster = document.getElementById("toasterSuccess");
        const toasterFunction = bootstrap.Toast.getOrCreateInstance(toaster);
        toasterFunction.show();
    }

    function ShowDangerMessage(_msg) {
        ShowLoading('HIDE');
        document.getElementById("toasterDanger-body").innerHTML = _msg;
        const toaster = document.getElementById("toasterDanger");
        const toasterFunction = bootstrap.Toast.getOrCreateInstance(toaster);
        toasterFunction.show();
    }

    function ShowAccessDenied(_msg) {
        ShowLoading('HIDE');
        document.getElementById("toasterAccess-body").innerHTML = _msg;
        const toaster = document.getElementById("toasterAccess");
        const toasterFunction = bootstrap.Toast.getOrCreateInstance(toaster);
        toasterFunction.show();
    }

});