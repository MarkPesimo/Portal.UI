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

        

        BindTable(curr_year + "-01-01", curr_year + "-12-31", "Posted");
    };
    
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

                var date = new Date();

                var curr_date = date.getDate();
                var curr_month = date.getMonth() + 1; //Months are zero based
                var curr_year = date.getFullYear();

                document.querySelector('#filter_overtime_modal').querySelector("#OTTo").value = curr_year + "-12-31";
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
        if ($.fn.DataTable.isDataTable(tablename)) {
            var table = $(tablename).DataTable();
            table.clear().destroy();
        }
        $(tablename + " tbody").empty();
    };

    function DisplayOvertimes(response) {
        if ($.fn.DataTable.isDataTable('#overtime-table')) {
            $('#overtime-table').DataTable().destroy();
        }

        $("#overtime-table").DataTable({
            autoWidth: false,
            data: response,
            order: [[0, "desc"]],
            dom: "<'row'<'col-6'l><'col-6'f>>" +
                "<'row'<'col-12'tr>>" +
                "<'row'<'col-6'i><'col-6'p>>",
            columns: [
                { 'data': 'DateFiled' },       
                { 'data': 'OTFrom' },          
                { 'data': 'OTEnd' },           
                { 'data': 'OTHours' },         
                { 'data': 'Reason' },          
                { 'data': 'Status' },          
                { 'data': 'ApprovedOTHours' }, 
                { 'data': 'Remarks' },         
                { 'data': null },              
                { 'data': null }               
            ],
            columnDefs: [
                {
                    targets: 0,
                    className: "align-middle fw-bold",
                    createdCell: function (td) { $(td).attr('data-label', 'Date Filed'); },
                    render: function (data, type, row) {
                        return '<span><i class="fa-regular fa-calendar-check me-2 text-danger"></i>' + row.DateFiled + '</span>';
                    }
                },
                {
                    targets: [1, 2],
                    className: "text-center align-middle",
                    createdCell: function (td, cellData, rowData, row, col) {
                        var labels = ["", "OT Start", "OT End"];
                        if (labels[col]) $(td).attr('data-label', labels[col]);
                    },
                    render: function (data) { return '<span>' + (data || '') + '</span>'; }
                },
                {
                    targets: 3,
                    className: "text-center align-middle fw-bold",
                    createdCell: function (td) { $(td).attr('data-label', 'Hour(s)'); },
                    render: function (data) { return '<span class="text-primary">' + parseFloat(data).toFixed(2) + '</span>'; }
                },
                {
                    targets: 4,
                    className: "align-middle",
                    createdCell: function (td) { $(td).attr('data-label', 'Reason'); },
                    render: function (data) { return '<span class="text-wrap" style="max-width: 200px; display: inline-block;">' + data + '</span>'; }
                },
                {
                    targets: 5,
                    className: "text-center align-middle",
                    createdCell: function (td) { $(td).attr('data-label', 'Status'); },
                    render: function (data, type, row) {
                        var displayStatus = (row.Status === 'Posted') ? 'Pending' : row.Status;
                        return '<div class="status-badge-wrapper">' + SetTableBGColor(displayStatus) + '</div>';
                    }
                },
                {
                    targets: [6, 7],
                    className: "text-center align-middle",
                    createdCell: function (td, cellData, rowData, row, col) {
                        var labels = ["", "", "", "", "", "", "Approved", "Remarks"];
                        if (labels[col]) $(td).attr('data-label', labels[col]);
                    },
                    render: function (data) { return '<span>' + (data || '---') + '</span>'; }
                },
                {
                    targets: 8,
                    visible: true,
                    className: "d-none d-lg-table-cell text-center align-middle",
                    render: function () { return ""; }
                },
                {
                    targets: 9,
                    className: 'text-center align-middle',
                    orderable: false,
                    createdCell: function (td) { $(td).attr('data-label', 'Options'); },
                    render: function (data, type, row) {
                        return '<div class="dropdown">' +
                            '<button class="btn btn-action-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                            '<i class="fa-solid fa-ellipsis-vertical"></i>' +
                            '</button>' +
                            '<ul class="dropdown-menu dropdown-menu-end shadow border-0">' +
                            '<li><a class="dropdown-item edit-overtime" ' + row.EditVisible + ' Overtimeid="' + row.Id + '"><i class="fa-solid fa-pen text-primary me-2"></i>Edit</a></li>' +
                            '<li><a class="dropdown-item print-overtime" ' + row.PrintVisible + ' Overtimeid="' + row.Id + '"><i class="fa-solid fa-print text-info me-2"></i>Print</a></li>' +
                            '<li><hr class="dropdown-divider"></li>' +
                            '<li><a class="dropdown-item cancel-overtime text-danger" ' + row.CancelVisible + ' Overtimeid="' + row.Id + '"><i class="fa-solid fa-ban me-2"></i>Cancel</a></li>' +
                            '</ul></div>';
                    }
                }
            ],
            initComplete: function () { this.api().columns.adjust(); }
        });
        ShowLoading('HIDE');
    }

    function SetTableBGColor(_status) {
        var _font_color = 'white';
        var _color = 'white';

        if (_status == 'Posted') { _color = '#5cb85c'; }
        else if (_status == "Pending") { _color = '#ffc107'; _font_color = 'black'; } 
        else if (_status == "Approved") { _color = '#0275d8'; }
        else if (_status == "Attached to DTR") { _color = '#0275d8'; }
        else if (_status == "Cancelled") { _color = '#d9534f'; }
        else if (_status == "Rejected") { _color = '#c94D3B'; }
        else { _color = '#959A97'; _font_color = 'white'; }

        //return '<a href="#" class="mt-2 btn btn-sm " style="background : ' + _color + ';border-radius:10%; color: ' + _font_color + '"> ' + _status + '</a>'
        return '<span class="badge rounded-pill "  style="background : ' + _color + '; color: ' + _font_color + '">' + _status + '</span>'
    };

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
        document.querySelector(_modal).querySelector(_form).querySelector("#OTTo").value = DateLog;

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


        url = `/Overtime/_isSetIfContinuousOT?_datelog=${DateLog}`;
        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
              
                if (data && !data.error) {
                    document.querySelector(_modal).querySelector(_form).querySelector('#ContinuousOt').checked = data.result;
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => console.error("Request failed:", error));


        url = `/Overtime/_GetSelectedDateValue?_datelog=${DateLog}`;
        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                //console.log(data);
                if (data && !data.error) {
                    document.querySelector(_modal).querySelector(_form).querySelector('#ot-day-type').value = data.DayType;
                    document.querySelector(_modal).querySelector(_form).querySelector('#OTFromTime').value = data.ShiftOut;
                    document.querySelector(_modal).querySelector(_form).querySelector('#OTToTime').value = data.ShiftOut;
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => console.error("Request failed:", error));
    }

    function EditGetShiftOnSelectedDate() {
        var _modal = '#edit_overtime_modal';
        var _form = '#edit-overtime-Form';

        var DateLog = document.querySelector(_modal).querySelector(_form).querySelector("#OTFrom").value;
        document.querySelector(_modal).querySelector(_form).querySelector("#OTTo").value = DateLog;


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


        url = `/Overtime/_isSetIfContinuousOT?_datelog=${DateLog}`;
        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data && !data.error) {
                    document.querySelector(_modal).querySelector(_form).querySelector('#ContinuousOt').checked = data.result;
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => console.error("Request failed:", error));

        url = `/Overtime/_GetSelectedDateValue?_datelog=${DateLog}`;
        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                //console.log(data);
                if (data && !data.error) {
                    document.querySelector(_modal).querySelector(_form).querySelector('#ot-day-type').value = data.DayType;
                    document.querySelector(_modal).querySelector(_form).querySelector('#OTFromTime').value = data.ShiftOut;
                    document.querySelector(_modal).querySelector(_form).querySelector('#OTToTime').value = data.ShiftOut;
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

    $('#overtime-table').on('click', '.edit-approved-overtime', function () {
        var OvertimeId = $(this).attr("Overtimeid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Overtime/_EditApprovedOvertime',
            data: { '_id': OvertimeId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#edit_approved_overtime_modal').find(".modal-body").innerHTML = '';
                $('#edit_approved_overtime_modal').find(".modal-body").html(response);
                $("#edit_approved_overtime_modal").modal('show');


                var _modal = '#edit_approved_overtime_modal';
                var _form = '#edit-approved-overtime-Form';

                //----------------------SHOW/HIDE VIEW BUTTON-----------------------
                var _has_attachment = document.querySelector(_modal).querySelector(_form).querySelector("#HasAttachement").value;
                console.log(_has_attachment);
                var _view_button = document.querySelector(_modal).querySelector('#view_attached_btn');
                _view_button.style.visibility = _has_attachment;
                //----------------------SHOW/HIDE VIEW BUTTON-----------------------

                
                document.querySelector(_modal).querySelector(_form).querySelector("#OTFrom").addEventListener("change", EditGetShiftOnSelectedDate);
                //EditGetShiftOnSelectedDate();

                var DateLog = document.querySelector(_modal).querySelector(_form).querySelector("#OTFrom").value;
                document.querySelector(_modal).querySelector(_form).querySelector("#OTTo").value = DateLog;

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
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#edit_approved_overtime_modal').on('click', '#update-approved-overtime-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Overtime/_ManageOvertime',
            type: "POST",
            data: $('#edit-approved-overtime-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#edit_approved_overtime_modal").modal('hide');

                    $file = $("#Edit_approved_Overtime_Attachment");
                    var $filepath = $.trim($file.val());

                    if ($filepath != "") {
                        OvertimeEditApprovedAttachment(result.OvertimeId, 'Overtime successfully updated.')
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
                var _form = '#edit-overtime-Form';
                document.querySelector(_modal).querySelector(_form).querySelector("#OTFrom").addEventListener("change", EditGetShiftOnSelectedDate);
                EditGetShiftOnSelectedDate();
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#edit_overtime_modal').on('click', '#update-overtime-button', function (e) {
        //console.log($('#overtime-Form').serialize());
        ShowLoading('SHOW');
        $.ajax({
            url: '/Overtime/_ManageOvertime',
            type: "POST",
            data: $('#edit-overtime-Form').serialize(),
            //data: $('#edit_overtime_modal').find('#overtime-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#edit_overtime_modal").modal('hide');

                    $file = $("#Edit_Overtime_Attachment");
                    var $filepath = $.trim($file.val());

                    if ($filepath != "") {
                        OvertimeEditAttachment(result.OvertimeId, 'Overtime successfully updated.')
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
        var _fileid = document.querySelector('#edit-overtime-Form').querySelector("#Id").value;
        var _extension = document.querySelector('#edit-overtime-Form').querySelector("#FileExtension").value;
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

    $('#overtime-table').on('click', '.print-overtime', function () {
        var guid = $(this).attr("guid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Overtime/_PreviewOvertime',
            data: { '_guid': guid },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#preview_overtime_modal').find(".modal-body").html(response);
                $("#preview_overtime_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

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

    $(document).on('change', '#OTFrom', function () {
        var urlPath = '/Overtime/GetFiledOvertime';

        var otDate = $(this).val();

        if (otDate) {
            $.ajax({
                url: urlPath,
                type: 'GET',
                data: { otDate: otDate },
                success: function (res) {
                    var $container = $('#existing-ot-container');
                    var $list = $('#existing-ot-list');

                    if (res.success && res.data && res.data.length > 0) {
                        $list.empty();

                        $.each(res.data, function (i, item) {
                            var from = formatTime(item.OTFrom);
                            var to = formatTime(item.OTTo);
                            var reason = item.Reason ? item.Reason : "No reason provided";

                            $list.append('<li><strong>' + from + ' to ' + to + '</strong> — ' + reason + '</li>');
                        });

                        $container.slideDown();
                    } else {
                        $container.slideUp();
                    }
                },
                error: function (err) {
                    console.error("AJAX Error details:", err);
                }
            });
        }
    });
    
    function formatTime(jsonDate) {
        if (!jsonDate) return "";

        var date;
        if (typeof jsonDate === 'string' && jsonDate.indexOf('Date') >= 0) {
            date = new Date(parseInt(jsonDate.substr(6)));
        } else {
            date = new Date(jsonDate);
        }

        return date.getHours().toString().padStart(2, '0') + ":" +
            date.getMinutes().toString().padStart(2, '0');
    }

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

    function OvertimeEditAttachment(_id, _msg) {

        var formData = new FormData();
        var _Attachement = $('#Edit_Overtime_Attachment')[0].files[0];

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

    function OvertimeEditApprovedAttachment(_id, _msg) {
        var formData = new FormData();
        var _Attachement = $('#Edit_approved_Overtime_Attachment')[0].files[0];

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
});

