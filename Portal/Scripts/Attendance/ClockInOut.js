$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-Attendance").addClass("active");
        $("#nav-Attendance").addClass("bg-primary");

        var date = new Date();


        var curr_date = date.getDate();
        var curr_month = date.getMonth() + 1; //Months are zero based
        var curr_year = date.getFullYear();


        if (curr_month.toString().length == 1) { curr_month = "0" + curr_month; }
        if (curr_date.toString().length == 1) { curr_date = "0" + curr_date; }


        document.getElementById("clockinout_datepicker_from").value = curr_year + "-" + curr_month  + "-01"; //  firstDay.toString( "yy-mm-dd"); "2021-01-01";  //
        document.getElementById("clockinout_datepicker_to").value = curr_year + "-" + curr_month + "-" + curr_date; //lastDay;

        ShowLoading('HIDE');
        BindTable();
    });

    function ClearTable(tablename) {
        var table = $(tablename).DataTable();
        table.destroy();
        $(tablename).empty();
    };

    $("#show_clockinout_filter_btn").click(function (e) {
        e.preventDefault();

        $('#filter_clockinout_modal').modal('show');
    });

    //----------------------------------BEGIN ADD-----------------------------------
    $("#add_correction_btn").click(function (e) {
        e.preventDefault();

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_AddCorrection',
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#add_correction_modal').find(".modal-body").innerHTML = '';
                $('#add_correction_modal').find(".modal-body").html(response);
                $('#add_correction_modal').modal('show');

                var _form = '#attendance-correction-Form';
                document.querySelector(_form).querySelector("#DateLog").addEventListener("change", ChangeDateLogAdd);

            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
        
    });

    function ChangeDateLogAdd() {        
        var _form = '#attendance-correction-Form';
        var _datelog = document.querySelector(_form).querySelector("#DateLog").value

        document.querySelector(_form).querySelector("#TimeInDate").value = _datelog;
        document.querySelector(_form).querySelector("#TimeOutDate").value = _datelog;
    };

    function ChangeDateLogAddPost() {
        var _form = '#post-attendance-correction-Form';
        var _datelog = document.querySelector(_form).querySelector("#DateLog").value

        document.querySelector(_form).querySelector("#TimeInDate").value = _datelog;
        document.querySelector(_form).querySelector("#TimeOutDate").value = _datelog;
    };

    $('#add_correction_modal').on('click', '#submit_correction', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Attendance/_AddCorrection',
            type: "POST",
            data: $('#attendance-correction-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#add_correction_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Attendance correction successfully created.');
                     
                    BindTable();
                }
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });
    //----------------------------------END ADD-----------------------------------

    $('#filter_clockinout_modal').on('click', '#filter_clockincout', function (e) {
        BindTable();
    });

    function BindTable() {
        var FromDate = document.getElementById("clockinout_datepicker_from").value;
        var ToDate = document.getElementById("clockinout_datepicker_to").value;

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Attendance/GetClockInClockOutList",
            data: {
                "_fromdate": FromDate,
                "_todate": ToDate
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                ShowLoading('HIDE');
                ClearTable("#clockinout-table");
                DisplayRecords(response);
                $('#filter_clockinout_modal').modal('hide');
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
    };

    function DisplayRecords(response) {
        $("#clockinout-table").DataTable(
            {
                autoWidth: false,
                bLengthChange: true,
                lengthMenu: [[-1], ["All"]],
                bFilter: true,
                bSort: true,
                bPaginate: true,
                data: response,
                columns: [
                    { 'data': 'DateLog' },
                    { 'data': 'DateName' },
                    { 'data': 'ShiftDescription' },
                    { 'data': 'ClockIn' },
                    { 'data': 'ClockOut' },
                    { 'data': 'Status' },
                    { 'data': 'Status' },
                    { 'data': 'Status' },
                ],
                order: [[0, "desc"]],
                columnDefs: [
                    {
                        title: 'Date Log',
                        target: 0,
                        class: "d-none d-sm-table-cell",
                        "render": function (data, type, row, meta) {
                            const date = new Date(row.DateLog);
                            return ' <strong class="text-primary">' + date.toLocaleDateString('es-pa') + ' </strong> '
                        }
                    },
                    {
                        title: 'Day',
                        class: "d-none d-sm-table-cell",
                        target: 1
                    },
                    {
                        title: 'Shift',
                        class: "d-none d-sm-table-cell",
                        target: 2
                    },
                    {
                        title: 'Time In',
                        class: "d-none d-sm-table-cell",
                        target: 3
                    },
                    {
                        title: 'Time Out',
                        class: "d-none d-sm-table-cell",
                        target: 4
                    },
                    {
                        title: 'Details',
                        class: "d-xs-block d-sm-none  d-m-none d-lg-none",
                        target: 5,
                        "render": function (data, type, row, meta) {
                            return 'Date Log : ' + row.DateLog + ' ' +
                                '<small class="d-block">Day : ' + row.DateName + '</small> ' +
                                '<small class="d-block">Shift : ' + row.ShiftDescription + '</small> ' +
                                '<small class="d-block">Time In : ' + row.ClockIn + '</small> ' +
                                '<small class="d-block">Time Out : ' + row.ClockOut + '</small> ' +
                                '<small class="d-block">Remarks : ' + row.Status + '</small> ' +
                                SetTableBGColor(row.Status)
                        }
                    },
                    {
                        title: 'Remarks',
                        class: "d-none d-sm-table-cell text-center",
                        target: 6,
                        "render": function (data, type, row, meta) {
                            return SetTableBGColor(row.Status)
                        }
                    },
                    {
                        target: 7,
                        title: 'Action',
                        className: 'dt-body-right',
                        "render": function (data, type, row, meta) {
                            return '<div class="btn-group"> ' +
                                '   <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"> ' +
                                ' <i class="fa-solid fa-ellipsis-vertical me-2"></i> Option ' +
                                '             </button> ' +
                                ' <ul class="dropdown-menu">' +
                                ' <li> <a class="dropdown-item file-correction" DateLog="' + row.DateLog + '"> <i class="fa-solid fa-calendar-check"></i> File Attendance Correction</a></li> ' +
                                ' <li> <a class="dropdown-item file-overtime"   DateLog="' + row.DateLog + '"> <i class="fa-solid fa-business-time"></i> File Overtime</a></li> ' +
                                ' <li> <a class="dropdown-item file-leave"      DateLog="' + row.DateLog + '"> <i class="fa-solid fa-plane"></i> File Leave</a></li> ' +

                                '</ul>' +
                                '</div> '
                        }
                    },
                ]
            });

        $('.dataTables_length').addClass('bs-select ms-2 mt-2');
        $('.dataTables_filter').addClass('me-2 mb-1 mt-2');
        $('.dataTables_paginate').addClass('mt-2 mb-2');
        $('.dataTables_info').addClass('ms-2 mt-2 mb-2');
        $('.sorting').addClass('bg-primary text-white');


        ShowLoading('HIDE');
    };

    function SetTableBGColor(_status) {
        var _font_color = 'white';
        var _color = 'white';
        console.log(_status);
        if (_status == 'Posted') { _color = '#5cb85c'; }
        else if (_status == "Filed Leave") { _color = '#0275d8'; }
        else if (_status == "With Correction") { _color = '#10a9e0'; }
        else if (_status == "Approved Correction") { _color = '#1DE23F'; }
        else if (_status == "Approved Leave") { _color = '#38ca35'; }
        else if (_status == 'Virtual | Approved Leave') { _color = '#c94D3B'; }
        else if (_status == "Virtual") { _color = '#ec72df'; _font_color = 'white'; }             //VIRTUAL
        else { _color = '#aba7ae'; _font_color = 'white'; }
        return '<a href="#" class="mt-2 btn btn-sm " style="background : ' + _color + ';border-radius:10%; color: ' + _font_color + '"> ' + _status + '</a>'
    };

    //----------------------------------BEGIN ADD POST OVERTIME-----------------------------------
    $('#clockinout-table').on('click', '.file-overtime', function () {
        var DateLog = $(this).attr("DateLog");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Overtime/_AddPostOvertime',
            data: { '_datelog': DateLog },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#add_post_overtime_modal').find(".modal-body").innerHTML = '';
                $('#add_post_overtime_modal').find(".modal-body").html(response);
                $("#add_post_overtime_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#add_post_overtime_modal').on('click', '#submit_post_overtime', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Overtime/_AddPostOvertime',
            type: "POST",
            data: $('#post-overtime-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#add_post_overtime_modal").modal('hide');

                    $file = $("#Overtime_Post_Attachment");
                    var $filepath = $.trim($file.val());

                    if ($filepath != "") {
                        OvertimeAttachment(result.OvertimeId, 'Overtime successfully Posted.')
                        return;
                    }

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Overtime successfully Posted.');

                    BindTable();
                }
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    function OvertimeAttachment(_id, _msg) {
        var formData = new FormData();
        var _Attachement = $('#Overtime_Post_Attachment')[0].files[0];

        formData.append('_id', _id);
        formData.append('Overtime_Attachment', _Attachement);

        $.ajax({
            url: '/Overtime/_OvertimeAttachment',
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result == "ERROR") {
                    ShowLoading('HIDE');
                    alert('Error in attaching the ' + $file + ' file!')
                }
                else {
                    ShowSuccessMessage(_msg);
                    BindTable();
                    ShowLoading('HIDE');
                }
            }
        });

    }
    //----------------------------------END ADD POST OVERTIME-----------------------------------

    //----------------------------------BEGIN ADD POST ATTENDANCE CORRECTION-----------------------------------
    $('#clockinout-table').on('click', '.file-correction', function () {
        var DateLog = $(this).attr("DateLog");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_AddPostCorrection',
            data: { '_datelog': DateLog },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#add_post_correction_modal').find(".modal-body").innerHTML = '';
                $('#add_post_correction_modal').find(".modal-body").html(response);
                $("#add_post_correction_modal").modal('show');

                var _form = '#post-attendance-correction-Form';
                document.querySelector(_form).querySelector("#DateLog").addEventListener("change", ChangeDateLogAddPost);

                ChangeDateLogAddPost();
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#add_post_correction_modal').on('click', '#submit_post_correction', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Attendance/_AddPostCorrection',
            type: "POST",
            data: $('#post-attendance-correction-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#add_post_correction_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Attendance correction successfully Posted.');

                    BindTable();
                }
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });
    //----------------------------------END ADD POST ATTENDANCE CORRECTION-----------------------------------

    //----------------------------------BEGIN ADD POST LEAVE-----------------------------------
    $('#clockinout-table').on('click', '.file-leave', function () {
        var DateLog = $(this).attr("DateLog");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Leave/_AddPostLeave',
            data: { '_datelog': DateLog },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#add_post_leave_modal').find(".modal-body").innerHTML = '';
                $('#add_post_leave_modal').find(".modal-body").html(response);
                $("#add_post_leave_modal").modal('show');

                var _form = '#post-leave-Form';
                document.querySelector(_form).querySelector("#IsHalfday").addEventListener("change", CheckIsHalfdayAdd);
                document.querySelector(_form).querySelector("#LeaveFrom").addEventListener("change", CheckIsNotHalfdayAdd);
                document.querySelector(_form).querySelector("#LeaveTo").addEventListener("change", CheckIsNotHalfdayAdd);

                document.querySelector(_form).querySelector("#FirstHalf").addEventListener("change", ToggleFirstHalfAdd);
                document.querySelector(_form).querySelector("#SecondHalf").addEventListener("change", ToggleSecondHalfAdd);

                document.querySelector(_form).querySelector("#FirstDay_SecondHalf").addEventListener("change", ToggleNotSameDayAdd);
                document.querySelector(_form).querySelector("#LastDay_FirstHalf").addEventListener("change", ToggleNotSameDayAdd);

                ComputeLeaveDays();
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });


    function ToggleNotSameDayAdd() {
        ComputeLeaveDays();
    };

    function CheckIsHalfdayAdd() {
        var _form = '#post-leave-Form';


        //console.log(is_halfday);
        var div_sameday_halfday_details = document.querySelector(_form).querySelector('#div-sameday-halfday-details');

        if (document.querySelector(_form).querySelector("#IsHalfday").checked) {
            //alert('checked')
            document.querySelector(_form).querySelector("#IsHalfday").value = true;
            div_sameday_halfday_details.classList.add('d-block');
            div_sameday_halfday_details.classList.remove('d-none');

            document.querySelector(_form).querySelector('#FirstHalf').checked = true;
            document.querySelector(_form).querySelector('#FirstHalf').value = true;
            document.querySelector(_form).querySelector('#SecondHalf').checked = false
            document.querySelector(_form).querySelector('#SecondHalf').value = false;
        }
        else {
            //alert('not checked')
            document.querySelector(_form).querySelector("#IsHalfday").value = false;
            div_sameday_halfday_details.classList.add('d-none');
            div_sameday_halfday_details.classList.remove('d-block');

            document.querySelector(_form).querySelector('#FirstHalf').checked = false;
            document.querySelector(_form).querySelector('#FirstHalf').value = false;
            document.querySelector(_form).querySelector('#SecondHalf').checked = false
            document.querySelector(_form).querySelector('#SecondHalf').value = false;
        }

        ComputeLeaveDays();
    };

    function CheckIsNotHalfdayAdd() {
        var _form = '#post-leave-Form';
        var _leavefrom = Date.parse(document.querySelector(_form).querySelector("#LeaveFrom").value);
        var _leaveto = Date.parse(document.querySelector(_form).querySelector("#LeaveTo").value);

        var div_sameday_halfday = document.querySelector(_form).querySelector('#div-sameday-halfday');
        var div_not_sameday_halfday = document.querySelector(_form).querySelector('#div-not-sameday-halfday');

        document.querySelector(_form).querySelector('#IsHalfday').checked = false;
        document.querySelector(_form).querySelector('#IsHalfday').value = false;
        var div_sameday_halfday_details = document.querySelector(_form).querySelector('#div-sameday-halfday-details');
        div_sameday_halfday_details.classList.add('d-none');

        if (_leavefrom == _leaveto) {
            div_not_sameday_halfday.classList.add('d-none');
            div_sameday_halfday.classList.remove('d-none');

            document.querySelector(_form).querySelector('#FirstHalf').checked = true;
            document.querySelector(_form).querySelector('#FirstHalf').value = true;
            document.querySelector(_form).querySelector('#SecondHalf').checked = false;
            document.querySelector(_form).querySelector('#SecondHalf').value = false;
        }
        else if (_leavefrom < _leaveto) {
            div_sameday_halfday.classList.add('d-none');
            div_not_sameday_halfday.classList.remove('d-none');

            document.querySelector(_form).querySelector('#FirstDay_SecondHalf').checked = false;
            document.querySelector(_form).querySelector('#FirstDay_SecondHalf').value = false;
            document.querySelector(_form).querySelector('#LastDay_FirstHalf').checked = false;
            document.querySelector(_form).querySelector('#LastDay_FirstHalf').value = false;
        }
        else if (_leavefrom > _leaveto) {
            div_not_sameday_halfday.classList.add('d-none');
            div_sameday_halfday.classList.add('d-none');
        }

        ComputeLeaveDays();
    };

    function ToggleFirstHalfAdd() {
        var _form = '#post-leave-Form';

        if (document.querySelector(_form).querySelector("#FirstHalf").checked) {
            document.querySelector(_form).querySelector('#FirstHalf').value = true;

            document.querySelector(_form).querySelector('#SecondHalf').checked = false;
            document.querySelector(_form).querySelector('#SecondHalf').value = false;
        }

        ComputeLeaveDays();
    };

    function ToggleSecondHalfAdd() {
        var _form = '#post-leave-Form';

        if (document.querySelector(_form).querySelector("#SecondHalf").checked) {
            document.querySelector(_form).querySelector('#SecondHalf').value = true;

            document.querySelector(_form).querySelector('#FirstHalf').checked = false;
            document.querySelector(_form).querySelector('#FirstHalf').value = false;
        }

        ComputeLeaveDays();
    };

    function ComputeLeaveDays() {
        var _form = '#post-leave-Form';

        var _leavefrom = Date.parse(document.querySelector(_form).querySelector("#LeaveFrom").value);
        var _leaveto = Date.parse(document.querySelector(_form).querySelector("#LeaveTo").value);

        const a = new Date(_leavefrom);
        const b = new Date(_leaveto);
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;

        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        var _result = Math.floor((utc2 - utc1) / _MS_PER_DAY);
        var _minus = 0;
        if (_leavefrom == _leaveto) {
            if (document.querySelector(_form).querySelector('#IsHalfday').checked) {
                _minus = 0.5;
            }

            _result = _result + 1;
            _result = _result - _minus;
        }
        else if (_leavefrom < _leaveto) {
            if (document.querySelector(_form).querySelector('#FirstDay_SecondHalf').checked) {
                document.querySelector(_form).querySelector('#FirstDay_SecondHalf').value = true;
                _minus = _minus + 0.5;
            }

            if (document.querySelector(_form).querySelector('#LastDay_FirstHalf').checked) {
                document.querySelector(_form).querySelector('#LastDay_FirstHalf').value = true;
                _minus = _minus + 0.5;
            }

            _result = _result + 1;
            _result = _result - _minus;
        }
        else {
            _result = 0;
        }
   
        document.querySelector(_form).querySelector('#LeaveDays').value = _result;
    }

    $('#add_post_leave_modal').on('click', '#submit_post_leave', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Leave/_AddPostLeave',
            type: "POST",
            data: $('#post-leave-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#add_post_leave_modal").modal('hide');

                    $file = $("#Leave_Post_Attachment");
                    var $filepath = $.trim($file.val());

                    if ($filepath != "") {
                        LeaveAttachment(result.LeaveId, 'Leave successfully Posted.')
                        return;
                    }

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Leave successfully Posted.');

                    BindTable();
                }
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    function LeaveAttachment(_id, _msg) {

        var formData = new FormData();
        var _Attachement = $('#Leave_Post_Attachment')[0].files[0];

        formData.append('_id', _id);
        formData.append('Leave_Attachment', _Attachement);

        $.ajax({
            url: '/Leave/_LeaveAttachment',
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result == "ERROR") {
                    ShowLoading('HIDE');
                    alert('Error in attaching the ' + $file + ' file!')
                }
                else {
                    ShowSuccessMessage(_msg);
                    ShowLoading('HIDE');
                    BindTable();
                }
            }
        });
    }
    //----------------------------------END ADD POST LEAVE-----------------------------------


    //==================================BEGIN MISC==================================
    function ShowSuccessMessage(_msg) {
        ShowLoading('HIDE');
        document.getElementById("toasterSuccess-body").innerHTML = _msg;
        const toaster = document.getElementById("toasterSuccess");
        const toasterFunction = bootstrap.Toast.getOrCreateInstance(toaster);
        toasterFunction.show();
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

    function ShowLoading(show) {
        var x = document.getElementById("preloader");
        if (show === 'SHOW') { x.style.visibility = ''; }
        else { x.style.visibility = 'hidden'; }
    }
    //==================================END MISC==================================
});

