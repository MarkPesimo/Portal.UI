$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-Attendance").addClass("active");
        $("#nav-Attendance").addClass("bg-primary");

        var date = new Date();
        var curr_date = date.getDate();
        var curr_month = date.getMonth() + 1;
        var curr_year = date.getFullYear();

        if (curr_month.toString().length == 1) { curr_month = "0" + curr_month; }
        if (curr_date.toString().length == 1) { curr_date = "0" + curr_date; }

        document.getElementById("dtr_from").value = curr_year + "-01-01";
        
        var lastMonthDate = new Date(curr_year, date.getMonth(), 0);
        var lastMonthYear = lastMonthDate.getFullYear();
        var lastMonth = ("0" + (lastMonthDate.getMonth() + 1)).slice(-2);
        var lastDayLastMonth = ("0" + lastMonthDate.getDate()).slice(-2);
        
        var lastDayOfYear = new Date(curr_year, 11, 31);
        var lastYearMonth = ("0" + (lastDayOfYear.getMonth() + 1)).slice(-2);
        var lastYearDay = ("0" + lastDayOfYear.getDate()).slice(-2);
        document.getElementById("dtr_to").value = curr_year + "-" + lastYearMonth + "-" + lastYearDay; 
        
        ShowLoading('HIDE');
        BindTable();
    });
   
    function ClearTable(tablename) {
        var table = $(tablename).DataTable();
        table.destroy();
        $(tablename).empty();
    };

    $("#show_dtr_filter_btn").click(function (e) {
        e.preventDefault();

        $('#filter_dtr_modal').modal('show');
    });

    $('#filter_dtr_modal').on('click', '#filter_dtr', function (e) {
        BindTable();
    });

    function BindTable() {
        var FromDate = document.getElementById("dtr_from").value;
        var ToDate = document.getElementById("dtr_to").value;

        var e_status = document.getElementById("dtr-status");
        var Status = e_status.value;

        if (Status == "") { Status = "All"; }

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Attendance/GetDTRList",
            data: {
                '_fromdate': FromDate,
                '_todate': ToDate,
                '_status': Status
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                ShowLoading('HIDE');
                ClearTable("#dtr-table");
                DisplayRecords(response);
                $('#filter_dtr_modal').modal('hide');
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
    };

    function DisplayRecords(response) {
        if ($.fn.DataTable.isDataTable('#dtr-table')) {
            $('#dtr-table').DataTable().destroy();
        }
        
        var mobileLabels = ["DATE FILED", "DESCRIPTION", "STATUS", "ACTIONS"];

        $("#dtr-table").DataTable({
            autoWidth: false,
            data: response,
            order: [[0, "desc"]],
            dom: "<'row'<'col-6'l><'col-6'f>>" + "<'row'<'col-12'tr>>" + "<'row mt-3'<'col-12 col-md-6'i><'col-12 col-md-6'p>>",
            columns: [
                { 'data': 'DateFiled', 'title': 'Date Filed' }, 
                { 'data': 'Description', 'title': 'Description' },
                { 'data': 'Status', 'title': 'Status' },
                { 'data': null, 'title': 'Actions' }
            ],
            columnDefs: [
                {
                    targets: "_all",
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('data-label', mobileLabels[col]);
                    }
                },
                {
                    targets: 0,
                    render: function (data, type, row) {
                        const date = new Date(row.DateFiled);
                        return '<strong>' + date.toLocaleDateString('es-pa') + '</strong>';
                    }
                },
                {
                    targets: 2,
                    render: function (data, type, row) {
                        var displayStatus = (row.Status === 'Posted') ? 'Pending' : row.Status;
                        return SetTableBGColor(displayStatus);
                    }
                },
                {
                    targets: 3, 
                    orderable: false,
                    className: 'dt-body-right',
                    render: function (data, type, row) {
                        return '<div class="btn-group">' +
                            '<button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">' +
                            '<i class="fa-solid fa-ellipsis-vertical me-2"></i> Options' +
                            '</button>' +
                            '<ul class="dropdown-menu dropdown-menu-end shadow border-0">' +
                            '<li><a class="dropdown-item post-dtr"' + row.PostVisible + ' DTRid="' + row.Id + '" guid="' + row.PortalGuid + '"><i class="fa-solid fa-thumbtack text-success me-2"></i>Post</a></li>' +
                            '<li><a class="dropdown-item unpost-dtr"' + row.UnpostVisible + ' DTRid="' + row.Id + '" guid="' + row.PortalGuid + '"><i class="fa-solid fa-rotate-left text-warning me-2"></i>Unpost</a></li>' +
                            '<li><a class="dropdown-item print-dtr"' + row.PrintVisible + ' DTRid="' + row.Id + '" guid="' + row.PortalGuid + '"><i class="fa-solid fa-print text-info me-2"></i>Print</a></li>' +
                            '<li><hr class="dropdown-divider"></li>' +
                            '<li><a class="dropdown-item cancel-dtr"' + row.CancelVisible + ' DTRid="' + row.Id + '" guid="' + row.PortalGuid + '"><i class="fa-solid fa-ban text-danger me-2"></i>Cancel</a></li>' +
                            '</ul></div>';
                    }
                }
            ]
        });

        ShowLoading('HIDE');
    }

    $("#add_dtr_btn").click(function (e) {
        e.preventDefault();

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_AddDTR',
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#add_dtr_modal').find(".modal-body").innerHTML = '';
                $('#add_dtr_modal').find(".modal-body").html(response);
                $('#add_dtr_modal').modal('show');

                var _modal = '#add_dtr_modal';
                var _form = '#dtr-Form';
                document.querySelector(_modal).querySelector(_form).querySelector("#Cutoff").addEventListener("change", SetCutOffDate);
                document.querySelector(_modal).querySelector(_form).querySelector("#Month").addEventListener("change", SetCutOffDate);
                document.querySelector(_modal).querySelector(_form).querySelector("#Year").addEventListener("change", SetCutOffDate);
                SetCutOffDate();
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#add_dtr_modal').on('click', '#submit_DTR', function (e) {
        ManageDTR('#dtr-Form', '#add_dtr_modal', 'DTR successfully created.')
    });

    $('#dtr-table').on('click', '.edit-dtr', function () {

        var DTRId = $(this).attr("DTRid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_EditDTR',
            data: { '_id': DTRId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#edit_dtr_modal').find(".modal-body").html(response);
                $("#edit_dtr_modal").modal('show');

                var _modal = '#edit_dtr_modal';
                var _form = '#dtr-Form';
                document.querySelector(_modal).querySelector(_form).querySelector("#Cutoff").addEventListener("change", SetEditCutOffDate);
                document.querySelector(_modal).querySelector(_form).querySelector("#Month").addEventListener("change", SetEditCutOffDate);
                document.querySelector(_modal).querySelector(_form).querySelector("#Year").addEventListener("change", SetEditCutOffDate);

                SetEditCutOffDate();
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });
 
    $('#edit_dtr_modal').on('click', '#update_dtr', function (e) {
          ManageDTR('#dtr-Form', '#edit_dtr_modal', 'DTR successfully updated.')
    });

    $('#dtr-table').on('click', '.post-dtr', function () {
        var DTRId = $(this).attr("DTRid");
    
        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_PostDTR',
            data: { '_id': DTRId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#post_dtr_modal').find(".modal-body").html(response);
                $("#post_dtr_modal").modal('show');

                //DisplayDtrDetails(DTRId);
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#post_dtr_modal').on('click', '#post_dtr', function (e) {
        ManageDTR('#post-dtr-Form', '#post_dtr_modal', 'DTR successfully Posted.')
    });

    $('#dtr-table').on('click', '.print-dtr', function () {
        var guid = $(this).attr("guid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_PreviewDTR',
            data: { '_guid': guid },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#preview_dtr_modal').find(".modal-body").html(response);
                $("#preview_dtr_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#dtr-table').on('click', '.unpost-dtr', function () {
        var DTRId = $(this).attr("DTRid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_UnpostDTR',
            data: { '_id': DTRId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#unpost_dtr_modal').find(".modal-body").html(response);
                $("#unpost_dtr_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#unpost_dtr_modal').on('click', '#unpost_dtr', function (e) {
        ManageDTR('#unpost-dtr-Form', '#unpost_dtr_modal', 'DTR successfully Unposted.')
    });

    $('#dtr-table').on('click', '.cancel-dtr', function () {
        var DTRId = $(this).attr("DTRid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_CancelDTR',
            data: { '_id': DTRId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#cancel_dtr_modal').find(".modal-body").html(response);
                $("#cancel_dtr_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#cancel_dtr_modal').on('click', '#cancel_dtr', function (e) {
         ManageDTR('#cancel-dtr-Form', '#cancel_dtr_modal', 'DTR successfully Cancelled.')
    });

    function SetTableBGColor(_status) {
        var _font_color = 'white';
        var _color = '#6C757D';

        if (_status == 'Posted') { _color = '#5cb85c'; }
        else if (_status == "Pending") { _color = '#ffc107'; _font_color = 'black'; } 
        else if (_status == "Approved") { _color = '#5cb85c'; } 
        else if (_status == "Attached to DTR") { _color = '#5cb85c'; }
        else if (_status == "Cancelled") { _color = '#d9534f'; }
        else if (_status == "Rejected") { _color = '#c94D3B'; }
        else { _font_color = 'black'; }
        
        return '<span class="badge rounded-pill "  style="background : ' + _color + '; color: ' + _font_color + '">' + _status + '</span>'
    };

    function SetCutOffDate() {
        var _modal = '#add_dtr_modal';
        var _form = '#dtr-Form';

        var cutoff = document.querySelector(_modal).querySelector(_form).querySelector("#Cutoff").value;
        var year = document.querySelector(_modal).querySelector(_form).querySelector("#Year").value;
        var monthInput = document.querySelector(_modal).querySelector(_form).querySelector("#Month").value;
        var month = monthInput ? parseInt(monthInput.split("-")[1]) : 0;

        if (cutoff && month > 0 && year) {
            $.getJSON('/Attendance/GetClientCutoffDate',
                { cutoff: cutoff, month: month, year: year },
                function (data) {
                    if (data.success) {
                        $("#DateFrom").val(data.dateFrom);
                        $("#DateTo").val(data.dateTo);
                    } else {
                        alert("Error: " + data.message);
                    }
                });
        }
    }

    function SetEditCutOffDate() {
        var _modal = '#edit_dtr_modal';
        var _form = '#dtr-Form';

        var cutoff = document.querySelector(_modal).querySelector(_form).querySelector("#Cutoff").value;
        var year = document.querySelector(_modal).querySelector(_form).querySelector("#Year").value;
        var monthInput = document.querySelector(_modal).querySelector(_form).querySelector("#Month").value;
        var month = monthInput ? parseInt(monthInput.split("-")[1]) : 0;

        if (cutoff && month > 0 && year) {
            $.getJSON('/Attendance/GetClientCutoffDate',
                { cutoff: cutoff, month: month, year: year },
                function (data) {
                    if (data.success) {
                        $("#DateFrom").val(data.dateFrom);
                        $("#DateTo").val(data.dateTo);
                    } else {
                        alert("Error: " + data.message);
                    }
                });
        }
    }

    function ShowPostDTR(DTRId) {
        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_PostDTR',
            data: { '_id': DTRId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#post_dtr_modal').find(".modal-body").html(response);
                $("#post_dtr_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    }

    function DisplayDtrDetails(DTRId) {
        alert('dsdsd');
        $.ajax({
            type: "GET",
            url: "/Attendance/GetDTRDetails",
            data: {
                '_id': DTRId
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                ClearTable("#dtr-details-table");
                DisplayDTRDetails(response);
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
    };

    function DisplayDTRDetails(response) {
        $("#dtr-details-table").DataTable(
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
                    { 'data': 'TimeIn' },
                    { 'data': 'TimeOut' },
                    { 'data': 'Remarks' },
                    { 'data': 'Remarks' },
                ],
                order: [[0, "asc"]],
                columnDefs: [
                    {
                        title: 'Date Log',
                        target: 0,
                        //class: "d-none d-sm-table-cell text-center",
                        "render": function (data, type, row, meta) {
                            const date = new Date(row.DateLog);
                            return ' <strong class="text-primary">' + date.toLocaleDateString('es-pa') + ' </strong> '
                        }
                    },
                    {
                        title: 'Date name',
                        class: "d-none d-sm-table-cell",
                        target: 1,
                    },
                    {
                        title: 'Shift Schedule',
                        target: 2,
                        class: "d-none d-sm-table-cell",
                    },
                    {
                        title: 'Time In',
                        target: 3,
                        class: "d-none d-sm-table-cell text-center",
                        //}
                    },
                    {
                        title: 'Time Out',
                        target: 4,
                        class: "d-none d-sm-table-cell text-center",
                    },
                    {
                        title: 'Time Out',
                        target: 5,
                        class: "d-none d-sm-table-cell text-center",
                    },
                    {
                        title: 'Details',
                        target: 6,
                        class: "d-xs-block d-sm-none d-m-none d-lg-none",
                        "render": function (data, type, row, meta) {
                            return '<small class="d-block">Date name : ' + row.DateName + '</small> ' +
                                '<small class="d-block">Shift Schedule : ' + row.ShiftDescription + '</small> ' +
                                '<small class="d-block">Time in : ' + row.TimeIn + '</small> ' +
                                '<small class="d-block">Time out : ' + row.TimeOut + '</small> ' +
                                '<small class="d-block">Remarks : ' + row.Remarks + '</small> '
                        }
                    },

                ]
            });

        //SetTableBGColor();
        $('.dataTables_length').addClass('bs-select ms-2 mt-2');
        $('.dataTables_filter').addClass('me-2 mb-1 mt-2');
        $('.dataTables_paginate').addClass('mt-2 mb-2');
        $('.dataTables_info').addClass('ms-2 mt-2 mb-2');
        $('.sorting').addClass('bg-primary text-white');


        ShowLoading('HIDE');

    };

    function ManageDTR(form_name, modal_name, msg) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Attendance/_ManageDTR',
            type: "POST",
            data: $(form_name).serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    if (result.Result == "ERROR") { ValidationError(result); }
                    else {
                        $(modal_name).modal('hide');

                        ShowLoading('HIDE');
                        ShowSuccessMessage(msg);
                        BindTable();

                        console.log(result);
                        if (modal_name == '#add_dtr_modal') { ShowPostDTR(result.DTRId);}
                    }
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

    function ShowInfoMessage(_msg) {
        ShowLoading('HIDE');
        document.getElementById("toasterInfo-body").innerHTML = _msg;
        const toaster = document.getElementById("toasterInfo");
        const toasterFunction = bootstrap.Toast.getOrCreateInstance(toaster);
        toasterFunction.show();
    }

    function ShowWarningMessage(_msg) {
        ShowLoading('HIDE');
        document.getElementById("toasterWarning-body").innerHTML = _msg;
        const toaster = document.getElementById("toasterWarning");
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
