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
                //console.log(response);
                document.getElementById('my-shift').innerHTML = '<i class="fa-solid fa-business-time"></i> Shift Sched : ' + response.ShiftDescription;
                //get the current date, store it on the current-date attribute of my-shift button, this will be used as a validation
                //in clocking out to check


                document.getElementById('clock-in-button').setAttribute('attendance_id', response.Id)
                document.getElementById('clock-in-button').setAttribute('shift_id', response.ShiftId)
                document.getElementById('clock-out-button').setAttribute('attendance_id', response.Id)
                document.getElementById('clock-out-button').setAttribute('shift_id', response.ShiftId)

                if (response.ClockIn == '') { document.getElementById('clock-in-button').innerHTML = '<i class="fa-regular fa-clock"></i> Clock In'; }
                else {
                    document.getElementById('clock-in-button').innerHTML = '<i class="fa-regular fa-clock"></i> ' + response.ClockIn;                   
                }

                if (response.ClockOut == '') { document.getElementById('clock-out-button').innerHTML = '<i class="fa-regular fa-clock"></i> Clock Out';                 }
                else {
                    document.getElementById('clock-out-button').innerHTML = '<i class="fa-regular fa-clock"></i> ' + response.ClockOut;                  
                }

            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
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

    

    $('#nav-header').on('click', '#clock-in-button', async function () {
        var AttendanceId = $(this).attr("attendance_id");
        var ShiftId = $(this).attr("shift_id");

 
        ShowLoading('SHOW');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    $.ajax({
                        url: '/Attendance/ClockIn',
                        type: "POST",
                        data:
                        {
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
                                ShowSuccessMessage('You have successfully Clock-In.')
                            }
                            else { ShowAccessDenied(result.result); }
                        }
                    });
                },
                function () {
                    $.ajax({
                        url: '/Attendance/ClockIn',
                        type: "POST",
                        data:
                        {
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
                                ShowSuccessMessage('You have successfully Clock-In.')
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
                data:
                {
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
                        ShowSuccessMessage('You have successfully Clock-In.')
                    }
                    else { ShowAccessDenied(result.result); }
                }
            });
        }

        //ShowLoading('SHOW');
    //    $.ajax({
    //        url: '/Attendance/ClockIn',
    //        type: "POST",
    //        data:
    //        {
    //            '_id': AttendanceId,
    //            '_shiftid': ShiftId,    
    //            '_latitude': _latitude,
    //            '_longitude': _longitude
    //        },
    //        dataType: 'json',
    //        success: function (result) {
    //            ShowLoading('HIDE');
    //            if (result.Status == "SUCCESS") {
    //                GetClockInClockOut();
    //                ShowSuccessMessage('You have successfully Clock-In.')                    
    //            }
    //            else {
    //                ShowAccessDenied(result.result);
    //                //alert(result.result);
    //            }
    //        }
    //    });
    });

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

    $('#nav-header').on('click', '#clock-out-button', function () {
        var AttendanceId = $(this).attr("attendance_id");
        var ShiftId = $(this).attr("shift_id");

        ShowLoading('SHOW');
        if (AttendanceId == 0)          //get clock-in of the previous day
        {
            $.ajax({
                type: "GET",
                url: '/Attendance/GetPreviousClockIn',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    ShowLoading('HIDE');
                    console.log(response);
                    if (response.Status == "SUCCESS") {
                        document.getElementById("div-label-no-clockin-today").style.visibility = "hidden";
                        document.getElementById("div-label-with-previous-clockin").style.visibility = "hidden";


                        if (response.WithPrevious == true) {
                            document.getElementById("div-with-previous-clockin").style.visibility = "visible";
                            document.getElementById("div-label-with-previous-clockin").style.visibility = "visible";

                            document.getElementById('label-date-log').innerHTML = 'Date log : <Strong class="text-primary"> ' + response.result.DateLog + '</strong>';
                            document.getElementById('label-shift-description').innerHTML = 'Shift Description : <Strong class="text-primary">' + response.result.ShiftDescription + '</strong>';
                            document.getElementById('label-clock-in').innerHTML = 'Clock In : <Strong class="text-primary">' + response.result.ClockIn + '</strong>';
                            document.getElementById('label-clock-out').innerHTML = 'Clock Out: <Strong class="text-primary">' + response.result.ClockOut + '</strong>';

                            document.getElementById('clock-out-previous-button').setAttribute('attendance_id', response.result.Id);
                            document.getElementById('clock-out-previous-button').setAttribute('shift_id', response.result.ShiftId);
                        }
                        else {
                            document.getElementById("div-with-previous-clockin").style.visibility = "hidden";
                            document.getElementById("div-label-no-clockin-today").style.visibility = "visible";
                        }

                        $("#clockin_modal").modal('show');
                    }
                    else { ShowAccessDenied(response.result);}
                    
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
                            data:
                            {
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
                                    ShowSuccessMessage('You have successfully Clock-Out.')
                                }
                                else { ShowAccessDenied(result.result); }
                            }
                        });
                    },
                    function () {
                        $.ajax({
                            url: '/Attendance/ClockOut',
                            type: "POST",
                            data:
                            {
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
                                    ShowSuccessMessage('You have successfully Clock-Out.')
                                }
                                else { ShowAccessDenied(result.result); }
                            }
                        });
                    });
            }
            else {
                $.ajax({
                    url: '/Attendance/ClockOut',
                    type: "POST",
                    data:
                    {
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
                            ShowSuccessMessage('You have successfully Clock-Out.')
                        }
                        else { ShowAccessDenied(result.result); }
                    }
                });
            }

            //$.ajax({
            //    url: '/Attendance/ClockOut',
            //    type: "POST",
            //    data:
            //    {
            //        '_id': AttendanceId,
            //        '_shiftid': ShiftId
            //    },
            //    dataType: 'json',
            //    success: function (result) {
            //        ShowLoading('HIDE');
            //        if (result.Status == "SUCCESS") {
            //            GetClockInClockOut();
            //            ShowSuccessMessage('You have successfully Clock-Out.')
            //        }
            //        else {
            //            ShowAccessDenied(result.result);
            //        }
            //    }
            //});
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

    function ShowAccessDenied(_msg) {
        ShowLoading('HIDE');
        document.getElementById("toasterAccess-body").innerHTML = _msg;
        const toaster = document.getElementById("toasterAccess");
        const toasterFunction = bootstrap.Toast.getOrCreateInstance(toaster);
        toasterFunction.show();
    }

});