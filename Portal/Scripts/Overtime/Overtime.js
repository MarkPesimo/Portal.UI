$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-Overtime").addClass("active");
        $("#nav-Overtime").addClass("bg-primary");


        ShowLoading('HIDE');
        LoadDefault();
        //GetLeaveBalance(1);
        //GetLeaveBalance(2);
    });

    function LoadDefault() {
        var date = new Date();

        var curr_date = date.getDate();
        var curr_month = date.getMonth() + 1; //Months are zero based
        var curr_year = date.getFullYear();

        BindTable(curr_year + "-01-01", curr_year + "-12-31", "All");
    };

    //-----------------------------------BEGIN FILTER-----------------------------------
    $("#show_overtime_filter_btn").click(function (e) {
        e.preventDefault();

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Overtime/_Filter",
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#filter_overtime_modal').find(".modal-body").html('');
                $('#filter_overtime_modal').find(".modal-body").html(response);
                $('#filter_overtime_modal').modal('show');
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
    });

    $('#filter_overtime_modal').on('click', '#filter_overtime', function (e) {
        var OTFrom = document.getElementById("OTFrom").value;
        var OTTo = document.getElementById("OTTo").value;

        var e_status = document.getElementById("Status");
        var Status = e_status.value;

        if (Status == "") { Status = "All"; }

        ClearTable('#overtime-table');
        BindTable(OTFrom, OTTo, Status);

    });
    //-----------------------------------END FILTER-----------------------------------

    //----------------------------------BEGIN TABLE---------------------------------------------
    function BindTable(FromDate, ToDate, Status) {
        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Overtime/_GetOvertimeMonitoring",
            data: {
                '_otfrom': FromDate,
                '_otto': ToDate,
                '_status': Status
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                ShowLoading('HIDE');
                ClearTable('overtime-table');
                DisplayOvertimes(response.result);
                $('#filter_overtime_modal').modal('hide');
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

    function DisplayOvertimes(response) {
        $("#overtime-table").DataTable(
            {
                autoWidth: false,
                bLengthChange: true,
                lengthMenu: [[10, -1], [10, "All"]],
                bFilter: true,
                bSort: true,
                bPaginate: true,
                data: response,
                columns: [
                    { 'data': 'DateFiled' },
                    { 'data': 'OTFrom' },
                    { 'data': 'OTEnd' },
                    { 'data': 'OTHours' },

                    { 'data': 'Reason' },
                    { 'data': 'Status' },
                    { 'data': 'ApprovedOTHours' },
                    { 'data': 'Remarks' },
                    { 'data': 'Status' },
                ],
                order: [[0, "desc"]],
                columnDefs: [
                    {
                        title: 'OT Date',
                        target: 0,
                        class: "d-none d-sm-table-cell",
                        "render": function (data, type, row, meta) {
                            const date = new Date(row.OTFrom);
                            return date.toLocaleDateString('es-pa')
                        }
                    }, 
                    {
                        title: 'From',
                        class: "d-none d-sm-table-cell text-center",
                        target: 1,

                    },
                    {
                        title: 'To',
                        class: "d-none d-sm-table-cell text-center",
                        target: 2
                    },
                    {
                        title: 'Filed OT Hour(s)',
                        class: "d-none d-sm-table-cell text-center",
                        target: 3
                    },
                    {
                        title: 'Reason',
                        class: "d-none d-sm-table-cell text-center",
                        target: 4
                    },
                    {
                        title: 'Status',
                        class: "d-none d-sm-table-cell text-center",
                        target: 5,
                        "render": function (data, type, row, meta) {
                            return SetTableBGColor(row.Status)
                        }
                    },
                    {
                        title: 'Approved OT Hour(s)',
                        class: "d-none d-sm-table-cell text-center",
                        target: 6,
                        //"render": function (data, type, row, meta) {
                        //    return '0.00'
                        //}
                    },
                    {
                        title: 'Remarks',
                        class: "d-none d-sm-table-cell text-center",
                        target: 7,
                    },
                    {
                        title: 'Details',
                        class: "d-xs-block d-sm-none d-m-none d-lg-none ",
                        target: 8,
                        "render": function (data, type, row, meta) {
                            return 'Date Filed : ' + row.DateFiled + ' ' +
                                '<small class="d-block">OT from : ' + row.OTFrom + '</small> ' +
                                '<small class="d-block">OT to : ' + row.OTEnd + '</small> ' +
                                '<small class="d-block">Filed OT Hour(s) : ' + row.OTHours + '</small> ' +
                                '<small class="d-block">Approved OT Hour(s) : ' + row.ApprovedOTHours + '</small> ' +
                                '<small class="d-block">Reason : ' + row.Reason + '</small> ' +
                                SetTableBGColor(row.Status)
                        }
                    },
                    {
                        target: 9,
                        className: 'dt-body-right',
                        "render": function (data, type, row, meta) {
                            return '<div class="btn-group"> ' +
                                ' <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"> ' +
                                ' <i class="fa-solid fa-ellipsis-vertical me-2"></i> Option ' +
                                '             </button> ' +
                                ' <ul class="dropdown-menu">' +
                                ' <li> <a class="dropdown-item edit-overtime"' + row.EditVisible + ' Overtimeid="' + row.Id + '"> <i class="fa-solid fa-pen-to-square"></i> Edit</a></li> ' +
                                ' <li> <a class="dropdown-item post-overtime"' + row.PostVisible + ' Overtimeid="' + row.Id + '"> <i class="fa-solid fa-thumbtack"></i> Post</a></li> ' +
                                ' <li> <a class="dropdown-item unpost-overtime"' + row.UnpostVisible + ' Overtimeid="' + row.Id + '"> <i class="fa-solid fa-rotate-left"></i> Unpost</a></li> ' +
                                ' <li> <a class="dropdown-item cancel-overtime"' + row.CancelVisible + ' Overtimeid="' + row.Id + '"> <i class="fa-solid fa-ban"></i> Cancel</a></li> ' +
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
        else if (_status == "Approved") { _color = '#0275d8'; }
        else if (_status == "Cancelled") { _color = '#d9534f'; }
        else if (_status == "Rejected") { _color = '#c94D3B'; }
        else { _color = '#959A97'; _font_color = 'white'; }

        return '<a href="#" class="mt-2 btn btn-sm " style="background : ' + _color + ';border-radius:10%; color: ' + _font_color + '"> ' + _status + '</a>'
    };
    //----------------------------------END TABLE---------------------------------------------


    //----------------------------------BEGIN ADD OVERTIME--------------------------------------
    $("#file_overtime_btn").click(function (e) {
        e.preventDefault();

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Overtime/_AddOvertime',
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#add_overtime_modal').find(".modal-body").innerHTML = '';
                $('#add_overtime_modal').find(".modal-body").html(response);
                $("#add_overtime_modal").modal('show');

                var _modal = '#add_overtime_modal';
                var _form = '#overtime-Form';
                document.querySelector(_modal).querySelector(_form).querySelector("#OTFrom").addEventListener("change", GetShiftOnSelectedDate);
                GetShiftOnSelectedDate();                
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });
    
    function GetShiftOnSelectedDate() {
        var _modal = '#add_overtime_modal';
        var _form = '#overtime-Form';

        var DateLog = document.querySelector(_modal).querySelector(_form).querySelector("#OTFrom").value;

        var url = `/Overtime/GetShift?_datelog=${DateLog}`;

        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data && !data.error) {
                    document.querySelector(_modal).querySelector(_form).querySelector('#ot-shift-in').value = data.ShiftIn;
                    document.querySelector(_modal).querySelector(_form).querySelector('#ot-shift-out').value = data.ShiftOut;
                    //console.log(data);
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => console.error("Request failed:", error));
    }

    function EditGetShiftOnSelectedDate() {
        var _modal = '#edit_overtime_modal';
        var _form = '#overtime-Form';

        var DateLog = document.querySelector(_modal).querySelector(_form).querySelector("#OTFrom").value;

        var url = `/Overtime/GetShift?_datelog=${DateLog}`;

        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data && !data.error) {
                    document.querySelector(_modal).querySelector(_form).querySelector('#ot-shift-in').value = data.ShiftIn;
                    document.querySelector(_modal).querySelector(_form).querySelector('#ot-shift-out').value = data.ShiftOut;
                    //console.log(data);
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => console.error("Request failed:", error));
    }

    $('#add_overtime_modal').on('click', '#submit-overtime-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Overtime/_ManageOvertime',
            type: "POST",
            data: $('#overtime-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#add_overtime_modal").modal('hide');

                    $file = $("#Overtime_Attachment");
                    var $filepath = $.trim($file.val());

                    if ($filepath != "") {
                        OvertimeAttachment(result.OvertimeId, 'Overtime successfully created.')
                        return;
                    }

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Overtime successfully created.');

                    ClearTable('#overtime-table');
                    LoadDefault();
                }
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });
    //----------------------------------END ADD OVERTIME--------------------------------------

    //----------------------------------BEGIN EDIT OVERTIME--------------------------------------
    $('#overtime-table').on('click', '.edit-overtime', function () {
        var OvertimeId = $(this).attr("Overtimeid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Overtime/_EditOvertime',
            data: { '_id': OvertimeId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#edit_overtime_modal').find(".modal-body").innerHTML = '';
                $('#edit_overtime_modal').find(".modal-body").html(response);
                $("#edit_overtime_modal").modal('show');

                //----------------------SHOW/HIDE VIEW BUTTON-----------------------
                var _has_attachment = document.getElementById("HasAttachement").value;
                var _view_button = document.querySelector('#edit_overtime_modal').querySelector('#view_attached_btn');
                _view_button.style.visibility = _has_attachment;


                //var _edit_button = document.querySelector('#edit_task_modal').querySelector('#edit_task_btn');
                //if (_det_status == 'Draft') { _edit_button.style.visibility = 'none'; }
                //else { _edit_button.style.visibility = 'hidden'; }
                //----------------------SHOW/HIDE VIEW BUTTON-----------------------

                var _modal = '#edit_overtime_modal';
                var _form = '#overtime-Form';
                document.querySelector(_modal).querySelector(_form).querySelector("#OTFrom").addEventListener("change", EditGetShiftOnSelectedDate);
                EditGetShiftOnSelectedDate();
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#edit_overtime_modal').on('click', '#update-overtime-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Overtime/_ManageOvertime',
            type: "POST",
            data: $('#overtime-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#edit_overtime_modal").modal('hide');

                    $file = $("#Overtime_Attachment");
                    var $filepath = $.trim($file.val());

                    if ($filepath != "") {
                        OvertimeAttachment(result.OvertimeId, 'Overtime successfully updated.')
                        return;
                    }

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Overtime successfully updated.');

                    ClearTable('#overtime-table');
                    LoadDefault();
                }
            }
        });
    });

    $('#edit_overtime_modal').on('click', '#view_attached_btn', function () {
        var _fileid = document.querySelector('#overtime-Form').querySelector("#Id").value;
        var _extension = document.querySelector('#overtime-Form').querySelector("#FileExtension").value;
        //alert(_taskid);
        //alert(_extension);

        //return;
        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Overtime/_OpenOvertimeFile",
            data: {
                '_fileid': _fileid,
                '_extension': _extension,
            },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $("#open_overtime_file_modal").find(".modal-body").html(response);
                $("#open_overtime_file_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });
    //----------------------------------END EDIT OVERTIME--------------------------------------

    //----------------------------------BEGIN POST OVERTIME--------------------------------------
    $('#overtime-table').on('click', '.post-overtime', function () {
        var OvertimeId = $(this).attr("Overtimeid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Overtime/_PostOvertime',
            data: { '_id': OvertimeId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#post_overtime_modal').find(".modal-body").innerHTML = '';
                $('#post_overtime_modal').find(".modal-body").html(response);
                $("#post_overtime_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#post_overtime_modal').on('click', '#post-overtime-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Overtime/_ManageOvertime',
            type: "POST",
            data: $('#post-overtime-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#post_overtime_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Overtime successfully Posted.');
                    console.log(result);
                    ClearTable('#overtime-table');
                    LoadDefault();
                }
            }
        });
    });
    //----------------------------------END POST LEAVE--------------------------------------

    //----------------------------------BEGIN UNPOST OVERTIME--------------------------------------
    $('#overtime-table').on('click', '.unpost-overtime', function () {
        var OvertimeId = $(this).attr("Overtimeid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Overtime/_UnpostOvertime',
            data: { '_id': OvertimeId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#unpost_overtime_modal').find(".modal-body").innerHTML = '';
                $('#unpost_overtime_modal').find(".modal-body").html(response);
                $("#unpost_overtime_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#unpost_overtime_modal').on('click', '#unpost-overtime-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Overtime/_ManageOvertime',
            type: "POST",
            data: $('#unpost-overtime-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#unpost_overtime_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Overtime successfully Posted.');

                    ClearTable('#overtime-table');
                    LoadDefault();
                }
            }
        });
    });
    //----------------------------------END UNPOST OVERTIME--------------------------------------


    //----------------------------------BEGIN CANCEL OVERTIME--------------------------------------
    $('#overtime-table').on('click', '.cancel-overtime', function () {
        var OvertimeId = $(this).attr("Overtimeid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Overtime/_CancelOvertime',
            data: { '_id': OvertimeId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#cancel_overtime_modal').find(".modal-body").innerHTML = '';
                $('#cancel_overtime_modal').find(".modal-body").html(response);
                $("#cancel_overtime_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#cancel_overtime_modal').on('click', '#cancel-overtime-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Overtime/_ManageOvertime',
            type: "POST",
            data: $('#cancel-overtime-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#cancel_overtime_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Overtime successfully Cancelled.');

                    ClearTable('#overtime-table');
                    LoadDefault();
                }
            }
        });
    });
    //----------------------------------END CANCEL OVERTIME--------------------------------------



    function OvertimeAttachment(_id, _msg) {

        var formData = new FormData();
        var _Attachement = $('#Overtime_Attachment')[0].files[0];

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
                    ClearTable('#overtime-table');
                    LoadDefault();
                    ShowSuccessMessage(_msg);
                    ShowLoading('HIDE');
                }
            }
        });

    }

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

