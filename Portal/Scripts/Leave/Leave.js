$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-Leave").addClass("active");
        $("#nav-Leave").addClass("bg-primary");

        
        ShowLoading('HIDE');
        LoadDefault();
        GetLeaveBalance(1);
        GetLeaveBalance(2);
    });

    function LoadDefault() {
        var date = new Date();

        var curr_date = date.getDate();
        var curr_month = date.getMonth() + 1; //Months are zero based
        var curr_year = date.getFullYear();

        BindTable(0, curr_year + "-01-01", curr_year + "-12-31");
    };

    function GetLeaveBalance(leavetypeid) {
        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Leave/_GetLeaveBalance",
            data: {
                '_leavetypeid': leavetypeid,
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                //console.log(response);
                ShowLoading('HIDE');
                if (leavetypeid == 1)           //SICK LEAVE
                {
                    document.getElementById('label-sl-balance').innerHTML = 'Balance : <strong class="text-primary">' + response.result.Balance + '</strong> </p>';
                    document.getElementById('label-sl-earned').innerHTML = 'Earned : <strong class="text-primary">' + response.result.Earned + '</strong> </p>';
                    document.getElementById('label-sl-used').innerHTML = 'Used : <strong class="text-primary">' + response.result.Used + '</strong> </p>';

                    document.getElementById('label-sl-entitled').innerHTML = ' Entitled : <strong class="text-primary">' + response.result.EntitledLeave + '</strong></p>';
                    document.getElementById('label-sl-valid-until').innerHTML = 'Valid Until : <strong class="text-primary">' + response.result.ValidUntil + '</strong> </p>';
                    document.getElementById('label-sl-earned-at').innerHTML = 'Credits earned at : <strong class="text-primary">' + response.result.EarnedAt + '</strong> </p>';
                }
                else if (leavetypeid == 2)      //VACATION LEAVE
                {
                    document.getElementById('label-vl-balance').innerHTML = 'Balance : <strong class="text-primary">' + response.result.Balance + '</strong> </p>';
                    document.getElementById('label-vl-earned').innerHTML = 'Earned : <strong class="text-primary">' + response.result.Earned + '</strong> </p>';
                    document.getElementById('label-vl-used').innerHTML = 'Used : <strong class="text-primary">' + response.result.Used + '</strong> </p>';

                    document.getElementById('label-vl-entitled').innerHTML = 'Entitled : <strong class="text-primary">' + response.result.EntitledLeave + '</strong> </p>';
                    document.getElementById('label-vl-valid-until').innerHTML = 'Valid Until : <strong class="text-primary">' + response.result.ValidUntil + '</strong> </p>';
                    document.getElementById('label-vl-earned-at').innerHTML = 'Credits earned at : <strong class="text-primary">' + response.result.EarnedAt + '</strong> </p>';
                }
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
    };

    $("#show_leave_filter_btn").click(function (e) {
        e.preventDefault();

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Leave/_GetLeaveMonitoringFilter",
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#filter_leave_modal').find(".modal-body").html(response);
                $('#filter_leave_modal').modal('show');
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
    });

    $('#filter_leave_modal').on('click', '#filter_leave', function (e) {
        var FromDate = document.getElementById("LeaveFrom").value;
        var ToDate = document.getElementById("LeaveTo").value;

        var e_leavetype = document.getElementById("LeaveTypeId");
        var LeaveTypeId = e_leavetype.value;

        if (LeaveTypeId == "") { LeaveTypeId = 0; }

        ClearTable('#leave-table');
        BindTable(LeaveTypeId, FromDate, ToDate);

    });

    //----------------------------------BEGIN TABLE---------------------------------------------
    function BindTable(LeaveTypeId, FromDate, ToDate) {
        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Leave/_GetLeaveMonitoring",
            data: {
                '_leavetypeid': LeaveTypeId,
                '_datefrom': FromDate,
                '_dateto': ToDate
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                //console.log(response);
                ShowLoading('HIDE');
                ClearTable('leave-table');
                DisplayLeaves(response.result);
                $('#filter_leave_modal').modal('hide');
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
    };

    function ClearTable(tablename) {
        var table = $(tablename).DataTable();
        table.destroy();
        $(tablename).empty();
    };

    function DisplayLeaves(response) {
        $("#leave-table").DataTable(
            {
                autoWidth: false,
                bLengthChange: true,
                lengthMenu: [[10, -1], [10, "All"]],
                bFilter: true,
                bSort: true,
                bPaginate: true,
                data: response,
                columns: [
                    { 'data': 'DateFiled' },        //0
                    { 'data': 'LeaveType' },        //1
                    { 'data': 'DateFrom' },         //2
                    { 'data': 'DateTo' },           //3

                    { 'data': 'NoOfDays' },         //4
                    { 'data': 'Reason' },           //5
                    { 'data': 'Status' },           //6
                    { 'data': 'Status' },
                ],
                order: [[0, "desc"]],
                columnDefs: [
                    {
                        title: 'Date filed',
                        target: 0,
                        class: "d-none d-sm-table-cell",
                        "render": function (data, type, row, meta) {
                            const date = new Date(row.DateFiled);
                            return date.toLocaleDateString('es-pa')
                        }
                    },
                    {
                        title: 'Type',
                        target: 1,
                        class: "d-none d-sm-table-cell text-center",
                        "render": function (data, type, row, meta) {
                            return ' <strong class="text-primary">' + row.LeaveType + ' </strong> '
                        }
                    },
                    {
                        title: 'Leave from',
                        class: "d-none d-sm-table-cell text-center",
                        target: 2
                    },
                    {
                        title: 'Leave to',
                        class: "d-none d-sm-table-cell text-center",
                        target: 3
                    },
                    {
                        title: 'Day(s)',
                        class: "d-none d-sm-table-cell text-center",
                        target: 4
                    },
                    {
                        title: 'Reason',
                        class: "d-none d-sm-table-cell text-center",
                        target: 5
                    },
                    {
                        title: 'Status',
                        class: "d-none d-sm-table-cell text-center",
                        target: 6,
                        "render": function (data, type, row, meta) {
                            return SetTableBGColor(row.Status)
                        }
                    },
                    {
                        title: 'Details',
                        class: "d-xs-block d-sm-none d-m-none d-lg-none",
                        target: 7,
                        "render": function (data, type, row, meta) {
                            return 'Date Filed : ' + row.DateFiled + ' ' +
                                '<small class="d-block">Leave type : <strong class="text-primary">' + row.LeaveType + '</strong></small> ' +
                                '<small class="d-block">Leave date : ' + row.DateFrom + ' to ' + row.DateTo + '</small> ' +
                                '<small class="d-block">Day(s) : ' + row.NoOfDays + '</small> ' +
                                '<small class="d-block">Status : ' + row.Reason + '</small> ' +
                                SetTableBGColor(row.Status)

                        }
                    },
                    {
                        target: 8,
                        className: 'dt-body-right',
                        "render": function (data, type, row, meta) {
                            return '<div class="btn-group"> ' +
                                '   <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"> ' +
                                ' <i class="fa-solid fa-ellipsis-vertical me-2"></i> Option ' +
                                '             </button> ' +
                                ' <ul class="dropdown-menu">' +                                
                                ' <li> <a class="dropdown-item edit-leave"' + row.EditVisible + ' Leaveid="' + row.Id + '"> <i class="fa-solid fa-pen-to-square"></i> Edit</a></li> ' +
                                ' <li> <a class="dropdown-item post-leave"' + row.PostVisible + ' Leaveid="' + row.Id + '"> <i class="fa-solid fa-thumbtack"></i> Post</a></li> ' +
                                ' <li> <a class="dropdown-item unpost-leave"' + row.UnpostVisible + ' Leaveid="' + row.Id + '"> <i class="fa-solid fa-rotate-left"></i> Unpost</a></li> ' +
                                ' <li> <a class="dropdown-item cancel-leave"' + row.CancelVisible + ' Leaveid="' + row.Id + '"> <i class="fa-solid fa-ban"></i> Cancel</a></li> ' +

                                '</ul>' +
                                '</div> '
                        }
                    }
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

        if (_status == 'Posted') { _color = '#5cb85c'; }
        else if (_status == "Approved by Client") { _color = '#0275d8'; }
        else if (_status == "Approved by Payroll") { _color = '#10a9e0'; }
        else if (_status == "Cancelled") { _color = '#d9534f'; }
        else if (_status == "Rejected") { _color = '#c94D3B'; }
        else { _color = '#959A97'; _font_color = 'white'; }

        return '<a href="#" class="mt-2 btn btn-sm " style="background : ' + _color + ';border-radius:10%; color: ' + _font_color + '"> ' + _status + '</a>'
    };
    //----------------------------------END TABLE---------------------------------------------

    function isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    //----------------------------------BEGIN ADD LEAVE--------------------------------------
    $("#file_leave_btn").click(function (e) {
        e.preventDefault();

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Leave/_AddLeave',
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');

                if (isJsonString(response)) {
                    ShowAccessDenied("Sorry, This feature is not supported by your assigned client. Please contact your friendly neighborhood System Administrator.");
                    return;
                }


                $('#add_leave_modal').find(".modal-body").innerHTML = '';
                $('#add_leave_modal').find(".modal-body").html(response);
                $("#add_leave_modal").modal('show');

                var _form = '#leave-Form';
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

    function ToggleFirstHalfAdd() {
        var _form = '#leave-Form';

        if (document.querySelector(_form).querySelector("#FirstHalf").checked)
        {
            document.querySelector(_form).querySelector('#FirstHalf').value = true;

            document.querySelector(_form).querySelector('#SecondHalf').checked = false;
            document.querySelector(_form).querySelector('#SecondHalf').value = false;
        }
        //else {
        //    document.querySelector(_form).querySelector('#SecondHalf').checked = true;
        //    document.querySelector(_form).querySelector('#SecondHalf').value = true;
        //}

        ComputeLeaveDays();
    };

    function ToggleSecondHalfAdd() {
        var _form = '#leave-Form';

        if (document.querySelector(_form).querySelector("#SecondHalf").checked) {
            document.querySelector(_form).querySelector('#SecondHalf').value = true;

            document.querySelector(_form).querySelector('#FirstHalf').checked = false;
            document.querySelector(_form).querySelector('#FirstHalf').value = false;
        }
        //else {
        //    document.querySelector(_form).querySelector('#FirstHalf').checked = true;
        //    document.querySelector(_form).querySelector('#FirstHalf').value = true;
        //}

        ComputeLeaveDays();
    };

    function CheckIsNotHalfdayAdd() {
        var _form = '#leave-Form';
        var _leavefrom = Date.parse( document.querySelector(_form).querySelector("#LeaveFrom").value);
        var _leaveto = Date.parse( document.querySelector(_form).querySelector("#LeaveTo").value);

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

    function CheckIsHalfdayAdd() {
        var _form = '#leave-Form';

       
        //console.log(is_halfday);
        var div_sameday_halfday_details = document.querySelector(_form).querySelector('#div-sameday-halfday-details');
        
        if (document.querySelector(_form).querySelector("#IsHalfday").checked) {
            //alert('checked')
            document.querySelector(_form).querySelector("#IsHalfday").value = true;
            div_sameday_halfday_details.classList.add('d-block');
            div_sameday_halfday_details.classList.remove('d-none');

            document.querySelector(_form).querySelector('#FirstHalf').checked = true;
            document.querySelector(_form).querySelector('#FirstHalf').value  = true;
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

    function ComputeLeaveDays() {
        var _form = '#leave-Form';

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
            //console.log('equal');
            if (document.querySelector(_form).querySelector('#IsHalfday').checked) {
                _minus = 0.5;
            }

            _result = _result + 1;
            _result = _result - _minus;
        }
        else if (_leavefrom < _leaveto) {
            //console.log('less');
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
            //console.log('greater');
            _result = 0;
        }

        //console.log(_result);
        //console.log(_minus);
        
        //console.log(_result);
        document.querySelector(_form).querySelector('#LeaveDays').value = _result;
        //return _result;
    }


    $('#add_leave_modal').on('click', '#submit-leave-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Leave/_ManageLeave',
            type: "POST",
            data: $('#leave-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#add_leave_modal").modal('hide');

                    $file = $("#Leave_Attachment");
                    var $filepath = $.trim($file.val());

                    if ($filepath != "") {
                        LeaveAttachment(result.LeaveId, 'Leave successfully created.')
                        return;
                    }

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Leave successfully created.');

                    ClearTable('#leave-table');
                    LoadDefault();
                }
            } ,
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });
    //----------------------------------END ADD LEAVE--------------------------------------

    function LeaveAttachment(_id, _msg) {
 
        var formData = new FormData();
        var _Attachement = $('#Leave_Attachment')[0].files[0];

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
                    ClearTable('#leave-table');
                    LoadDefault();
                    ShowSuccessMessage(_msg);
                    ShowLoading('HIDE');
                }
            }
        });
    
    }

    //----------------------------------BEGIN EDIT LEAVE--------------------------------------
    $('#leave-table').on('click', '.edit-leave', function () {
        var LeaveId = $(this).attr("Leaveid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Leave/_EditLeave',
            data: { '_id': LeaveId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#edit_leave_modal').find(".modal-body").innerHTML = '';
                $('#edit_leave_modal').find(".modal-body").html(response);
                $("#edit_leave_modal").modal('show');

                var _form = '#leave-Form';
                var is_halfday = document.querySelector(_form).querySelector("#IsHalfday").checked;
                var div_sameday_halfday_details = document.querySelector(_form).querySelector('#div-sameday-halfday-details');

                if (is_halfday == true) { div_sameday_halfday_details.classList.remove('d-none'); }
                else { div_sameday_halfday_details.classList.add('d-none');}

                var _leavefrom = Date.parse(document.querySelector(_form).querySelector("#LeaveFrom").value);
                var _leaveto = Date.parse(document.querySelector(_form).querySelector("#LeaveTo").value);

                var div_sameday_halfday = document.querySelector(_form).querySelector('#div-sameday-halfday');
                var div_not_sameday_halfday = document.querySelector(_form).querySelector('#div-not-sameday-halfday');

                if (_leavefrom < _leaveto) {
                    div_sameday_halfday.classList.add('d-none');
                    div_not_sameday_halfday.classList.remove('d-none');
                }
                
                document.querySelector(_form).querySelector("#IsHalfday").addEventListener("change", CheckIsHalfdayAdd);
                document.querySelector(_form).querySelector("#LeaveFrom").addEventListener("change", CheckIsNotHalfdayAdd);
                document.querySelector(_form).querySelector("#LeaveTo").addEventListener("change", CheckIsNotHalfdayAdd);

                document.querySelector(_form).querySelector("#FirstHalf").addEventListener("change", ToggleFirstHalfAdd);
                document.querySelector(_form).querySelector("#SecondHalf").addEventListener("change", ToggleSecondHalfAdd);

                document.querySelector(_form).querySelector("#FirstDay_SecondHalf").addEventListener("change", ToggleNotSameDayAdd);
                document.querySelector(_form).querySelector("#LastDay_FirstHalf").addEventListener("change", ToggleNotSameDayAdd);

                ComputeLeaveDays();

                //----------------------SHOW/HIDE VIEW BUTTON-----------------------
                var _has_attachment = document.getElementById("HasAttachement").value;
                var _view_button = document.querySelector('#edit_leave_modal').querySelector('#view_attached_btn');
                _view_button.style.visibility = _has_attachment;

                //var _edit_button = document.querySelector('#edit_task_modal').querySelector('#edit_task_btn');
                //if (_det_status == 'Draft') { _edit_button.style.visibility = 'none'; }
                //else { _edit_button.style.visibility = 'hidden'; }
                //----------------------SHOW/HIDE VIEW BUTTON-----------------------
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#edit_leave_modal').on('click', '#update-leave-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Leave/_ManageLeave',
            type: "POST",
            data: $('#leave-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#edit_leave_modal").modal('hide');

                    $file = $("#Leave_Attachment");
                    var $filepath = $.trim($file.val());

                    if ($filepath != "") {
                        LeaveAttachment(result.LeaveId, 'Leave successfully updated.')
                        return;
                    }

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Leave successfully updated.');

                    ClearTable('#leave-table');
                    LoadDefault();
                }
            }
        });
    });

    $('#edit_leave_modal').on('click', '#view_attached_btn', function () {
        var _fileid = document.querySelector('#leave-Form').querySelector("#Id").value;
        var _extension = document.querySelector('#leave-Form').querySelector("#FileExtension").value;
        //alert(_taskid);
        //alert(_extension);

        //return;
        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Leave/_OpenLeaveFile",
            data: {
                '_fileid': _fileid,
                '_extension': _extension,
            },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $("#open_leave_file_modal").find(".modal-body").html(response);
                $("#open_leave_file_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });
    //----------------------------------END EDIT LEAVE--------------------------------------

    //----------------------------------BEGIN POST LEAVE--------------------------------------
    $('#leave-table').on('click', '.post-leave', function () {
        var LeaveId = $(this).attr("Leaveid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Leave/_PostLeave',
            data: { '_id': LeaveId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#post_leave_modal').find(".modal-body").innerHTML = '';
                $('#post_leave_modal').find(".modal-body").html(response);
                $("#post_leave_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#post_leave_modal').on('click', '#post-leave-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Leave/_ManageLeave',
            type: "POST",
            data: $('#post-leave-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#post_leave_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Leave successfully Posted.');

                    ClearTable('#leave-table');
                    LoadDefault();
                }
            }
        });
    });
    //----------------------------------END POST LEAVE--------------------------------------

    //----------------------------------BEGIN UNPOST LEAVE--------------------------------------
    $('#leave-table').on('click', '.unpost-leave', function () {
        var LeaveId = $(this).attr("Leaveid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Leave/_UnpostLeave',
            data: { '_id': LeaveId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#unpost_leave_modal').find(".modal-body").innerHTML = '';
                $('#unpost_leave_modal').find(".modal-body").html(response);
                $("#unpost_leave_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#unpost_leave_modal').on('click', '#unpost-leave-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Leave/_ManageLeave',
            type: "POST",
            data: $('#unpost-leave-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#unpost_leave_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Leave successfully Posted.');

                    ClearTable('#leave-table');
                    LoadDefault();
                }
            }
        });
    });
    //----------------------------------END UNPOST LEAVE--------------------------------------

    //----------------------------------BEGIN CANCEL LEAVE--------------------------------------
    $('#leave-table').on('click', '.cancel-leave', function () {
        var LeaveId = $(this).attr("Leaveid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Leave/_CancelLeave',
            data: { '_id': LeaveId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#cancel_leave_modal').find(".modal-body").innerHTML = '';
                $('#cancel_leave_modal').find(".modal-body").html(response);
                $("#cancel_leave_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#cancel_leave_modal').on('click', '#cancel-leave-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Leave/_ManageLeave',
            type: "POST",
            data: $('#cancel-leave-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#cancel_leave_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Leave successfully Cancelled.');

                    ClearTable('#leave-table');
                    LoadDefault();
                }
            }
        });
    });
    //----------------------------------END CANCEL LEAVE--------------------------------------


    //==================================BEGIN MISC==================================
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

