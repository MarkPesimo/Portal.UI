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
        
        if (Status == "") {
            Status = "Default";
            e_status.value = Status;
        }

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
                        var editVisible = (row.Status === 'Unposted') ? '' : 'style="display:none;"';

                        return '<div class="btn-group">' +
                            '<button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">' +
                            '<i class="fa-solid fa-ellipsis-vertical me-2"></i> Options' +
                            '</button>' +
                            '<ul class="dropdown-menu dropdown-menu-end shadow border-0">' +
                            
                            '<li><a class="dropdown-item edit-dtr" ' + editVisible + ' DTRid="' + row.Id + '" guid="' + row.PortalGuid + '"><i class="fa-solid fa-pen-to-square text-primary me-2"></i>Edit</a></li>' +

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
                $('#add_dtr_modal').find(".modal-body").html(response);
                $('#add_dtr_modal').modal('show');

                var modal = document.querySelector('#add_dtr_modal');
                var form = modal.querySelector('#dtr-Form');
                form.querySelector("#Cutoff").addEventListener("change", FetchAndSetCutoff);
                form.querySelector("#Month").addEventListener("change", FetchAndSetCutoff);
                form.querySelector("#Year").addEventListener("change", FetchAndSetCutoff);
                
                form.querySelector("#DateFrom").addEventListener("change", RefreshTableFromManualDates);
                form.querySelector("#DateTo").addEventListener("change", RefreshTableFromManualDates);
                
                FetchAndSetCutoff();
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    function FetchAndSetCutoff() {
        var _modal = '#add_dtr_modal';
        var form = document.querySelector(_modal).querySelector('#dtr-Form');

        var cutoff = form.querySelector("#Cutoff").value;
        var year = form.querySelector("#Year").value;
        var monthInput = form.querySelector("#Month").value;
        var empId = form.querySelector("#EmpId").value;
        var month = monthInput ? parseInt(monthInput.split("-")[1]) : 0;

        if (cutoff && month > 0 && year) {
            $.getJSON('/Attendance/GetClientCutoffDate',
                { cutoff: cutoff, month: month, year: year },
                function (data) {
                    if (data.success) {
                        $("#DateFrom").val(data.dateFrom);
                        $("#DateTo").val(data.dateTo);
                        
                        loadEmployeeDTR(empId, data.dateFrom, data.dateTo);
                    }
                });
        }
    }

    function RefreshTableFromManualDates() {
        var empId = document.querySelector('#dtr-Form #EmpId').value;
        var dateFrom = $("#DateFrom").val();
        var dateTo = $("#DateTo").val();

        loadEmployeeDTR(empId, dateFrom, dateTo);
    }

    //$('#add_dtr_modal').on('click', '#submit_DTR', function (e) {
    //    ManageDTR('#dtr-Form', '#add_dtr_modal', 'DTR successfully created.')
    //});

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

    $('#add_dtr_modal').on('click', '#post_dtr', function (e) {
        e.preventDefault();

        const dateFrom = $('#DateFrom').val();
        const dateTo = $('#DateTo').val();

        if (!dateFrom || !dateTo) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Date Range',
                text: 'Please select both Date From and Date To before proceeding.'
            });
            return;
        }

        const $btn = $(this);
        $btn.prop('disabled', true);

        $.ajax({
            url: '/Attendance/CheckDtrPortal',
            type: 'GET',
            data: {
                dateFrom: dateFrom,
                dateTo: dateTo
            },
            dataType: 'json',
            success: function (response) {
                $btn.prop('disabled', false);

                if (response && response.success) {
                    const data = response.data;
                    const invalidRecords = [];
                    
                    const parseJsonDate = (jsonDate) => {
                        if (!jsonDate) return 'N/A';
                        
                        if (typeof jsonDate === 'string' && jsonDate.indexOf('/Date(') !== -1) {
                            const milli = parseInt(jsonDate.replace(/\/Date\((.*?)\)\//, '$1'), 10);
                            return new Date(milli).toLocaleDateString();
                        }
                        
                        const parsedDate = new Date(jsonDate);
                        if (!isNaN(parsedDate.getTime())) {
                            return parsedDate.toLocaleDateString();
                        }

                        return jsonDate;
                    };
                    
                    const collectErrors = (remarksList, category) => {
                        if (Array.isArray(remarksList)) {
                            remarksList.forEach(item => {
                                const isInvalid = item.IsValid === false ||
                                    item.is_valid === false ||
                                    item.is_valid === 0 ||
                                    item.IsValid === 0;

                                if (isInvalid) {
                                    const rawDate = item.DateLog !== undefined ? item.DateLog : (item.date_log !== undefined ? item.date_log : item.DATELOG);
                                    const formattedDate = parseJsonDate(rawDate);
                                    const remarkText = item.Remarks || item.remarks || 'No details provided';

                                    invalidRecords.push({
                                        category: category,
                                        date: formattedDate,
                                        remarks: remarkText
                                    });
                                }
                            });
                        }
                    };
                    
                    collectErrors(data.AttendanceRemarks, 'Attendance');
                    collectErrors(data.OvertimeRemarks, 'Overtime');
                    collectErrors(data.LeaveRemarks, 'Leave');
                    
                    if (invalidRecords.length > 0) {
                        const tableRows = invalidRecords.map(rec => `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center; white-space: nowrap;">${rec.date}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${rec.category}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${rec.remarks}</td>
                        </tr>
                    `).join('');

                        Swal.fire({
                            icon: 'error',
                            title: 'Invalid Records Found',
                            width: '600px',
                            html: `
                            <p style="text-align: left; margin-bottom: 10px;">Posting cannot proceed due to the following invalid records:</p>
                            <div style="max-height: 220px; overflow-y: auto; border: 1px solid #ccc;">
                                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                                    <thead>
                                        <tr style="background-color: #f8f9fa;">
                                            <th style="padding: 8px; border: 1px solid #ddd; width: 25%;">Date Log</th>
                                            <th style="padding: 8px; border: 1px solid #ddd; width: 20%;">Category</th>
                                            <th style="padding: 8px; border: 1px solid #ddd; width: 55%;">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tableRows}
                                    </tbody>
                                </table>
                            </div>
                            <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #dc3545; text-align: left; font-size: 13px; color: #555;">
                                <strong>Note:</strong> Kindly coordinate with your account supervisor or approver to correct or approve the detected invalid logs.
                            </div>
                        `,
                            confirmButtonText: 'OK'
                        });
                        return;
                    }
                    
                    executeManageDTRMode3();

                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: response.message || 'An error occurred during DTR validation.'
                    });
                }
            },
            error: function (xhr, status, error) {
                $btn.prop('disabled', false);
                Swal.fire({
                    icon: 'error',
                    title: 'System Error',
                    text: 'An error occurred while verifying DTR details.'
                });
            }
        });

        function executeManageDTRMode3() {
            ManageDTR_Mode3('#dtr-Form', '#add_dtr_modal', 'DTR successfully Posted.', null,
                function (result) {
                    ManageDTR_Mode3('#post-dtr-Form', '#post_dtr_modal', 'DTR successfully Posted.',
                        { Mode: 3, Id: result.DTRId }
                    );
                }
            );
        }
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
        
        var form = document.querySelector(_modal).querySelector(_form);

        var cutoff = form.querySelector("#Cutoff").value;
        var year = form.querySelector("#Year").value;
        var monthInput = form.querySelector("#Month").value;
        var empId = form.querySelector("#EmpId").value;
        var month = monthInput ? parseInt(monthInput.split("-")[1]) : 0;

        if (cutoff && month > 0 && year) {
            $.getJSON('/Attendance/GetClientCutoffDate',
                { cutoff: cutoff, month: month, year: year },
                function (data) {
                    if (data.success) {
                        $("#DateFrom").val(data.dateFrom);
                        $("#DateTo").val(data.dateTo);
                        
                        var actualDateFrom = $("#DateFrom").val();
                        var actualDateTo = $("#DateTo").val();
                        
                        loadEmployeeDTR(empId, actualDateFrom, actualDateTo);
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
                ShowLoading('HIDE');

                if (result.Result == "ERROR") {
                    ShowWarningMessage(result.Message);
 
                }
                else {
                    $(modal_name).modal('hide');
                    ShowSuccessMessage(msg);
                    BindTable();

                    console.log(result);
                    //if (modal_name == '#add_dtr_modal') {
                    //    ShowPostDTR(result.DTRId);
                    //}
                }
            },
            error: function () {
                ShowLoading('HIDE');
                alert("An unexpected error occurred. Please try again.");
            }
        });
    }

    function ManageDTR_Mode3(form_name, modal_name, msg, overrides, onSuccess) {
        ShowLoading('SHOW');

        var formData = $(form_name).serializeArray();
        
        if (overrides) {
            $.each(overrides, function (key, value) {
                formData = $.grep(formData, function (field) {
                    return field.name !== key;
                });
                formData.push({ name: key, value: value });
            });
        }

        $.ajax({
            url: '/Attendance/_ManageDTR',
            type: "POST",
            data: $.param(formData),
            dataType: 'json',
            success: function (result) {
                ShowLoading('HIDE');
                if (result.Result == "ERROR") {
                    ShowWarningMessage(result.Message);
                }
                else {
                    $(modal_name).modal('hide');
                    ShowSuccessMessage(msg);
                    BindTable();
                    console.log(result);

                    if (typeof onSuccess === 'function') {
                        onSuccess(result);
                    }
                }
            },
            error: function () {
                ShowLoading('HIDE');
                alert("An unexpected error occurred. Please try again.");
            }
        });
    }

    function loadEmployeeDTR(empId, fromDate, toDate) {

        $('#dtrContainer').html(
            '<div class="text-center py-5 text-muted">' +
            '<div class="spinner-border spinner-border-sm me-2"></div>' +
            'Loading DTR...' +
            '</div>'
        );

        $.ajax({
            url: '/Attendance/GetEmployeeDTR',
            type: 'GET',
            data: {
                empId: empId,
                fromDate: fromDate,
                toDate: toDate
            },
            success: function (data) {
                if (!data || (data.Attendance.length === 0 && data.Overtime.length === 0 && data.Leave.length === 0)) {
                    $('#dtrContainer').html('<div class="text-center py-5 text-muted">No DTR records found.</div>');
                    return;
                }

                let html = '';
                const fontStyle = 'style="font-size: 0.75rem;"';
                const badgeStyle = 'style="font-size: 0.65rem;"';

                // ====================== ATTENDANCE ======================
                let totalRegHrs = 0;
                let totalLate = 0;
                let totalUnder = 0;

                const renderWorkSchedule = (workSchedule) => {
                    let wsDisplay = (workSchedule || '').trim();

                    if (wsDisplay.includes('0.50 ABSENT')) {
                        wsDisplay = wsDisplay.replace('0.50 ABSENT', '<i class="fa-solid fa-circle-half-stroke text-danger" title="0.50 ABSENT"></i>');
                    } else if (wsDisplay.includes('1.00 ABSENT')) {
                        wsDisplay = wsDisplay.replace('1.00 ABSENT', '<i class="fa-solid fa-circle-xmark text-danger" title="1.00 ABSENT"></i>');
                    }
                    else if (wsDisplay.includes('0.50 Day on leave') || wsDisplay.includes('1.00 Day on leave')) {
                        wsDisplay = wsDisplay.replace(/0.50 Day on leave|1.00 Day on leave/gi, '<i class="fa-solid fa-umbrella-beach text-danger"></i> <span class="fw-bold text-danger">Leave</span>');
                    }
                    else if (wsDisplay.includes('Rest Day')) {
                        wsDisplay = wsDisplay.replace('Rest Day', '<i class="fa-solid fa-calendar-check text-warning"></i> <span class="fw-bold text-warning">Rest Day</span>');
                    }

                    return '<span class="status-hover d-inline-block">' + wsDisplay + '</span>';
                };

                html += '<div class="card mb-3 shadow-sm">';
                html += '<div class="card-header bg-primary text-white py-2"><strong>Attendance</strong></div>';
                html += '<div class="card-body p-0">';
                html += '<div class="table-responsive">';
                html += '<table class="table table-sm table-hover table-striped mb-0 align-middle" ' + fontStyle + '>';
                html += '<thead class="table-dark text-center"><tr>' +
                    '<th>DTR #</th>' +
                    '<th>Date</th>' +
                    '<th>Work Schedule</th>' +
                    '<th>Time In</th>' +
                    '<th>Time Out</th>' +
                    '<th>Reg. hrs</th>' +
                    '<th>Late/Under</th>' +
                    '<th>Department</th>' +
                    '<th>Status</th>' +
                    '<th>Log Entry</th>' +
                    '<th>Reason</th>' +
                    '<th>Remarks</th>' +
                    '</tr></thead><tbody>';

                $.each(data.Attendance, function (i, a) {
                    const isLate = (a.LateColor || '').trim().toUpperCase() === 'RED';
                    const isUndertime = (a.UndertimeColor || '').trim().toUpperCase() === 'RED';
                    const hasTimeLogs = (a.TimeIn && a.TimeIn.trim() !== '') || (a.TimeOut && a.TimeOut.trim() !== '');

                    const hasInLoc = a.TimeInLatitude !== 0 && a.TimeInLongitude !== 0;
                    const hasOutLoc = a.TimeOutLatitude !== 0 && a.TimeOutLongitude !== 0;

                    const workHoursVal = parseFloat(a.WorkHours) || 0;
                    totalRegHrs += workHoursVal;

                    const lateMin = parseInt(a.LateMinute) || 0;
                    const utMin = parseInt(a.UndertimeMinute) || 0;
                    totalLate += lateMin;
                    totalUnder += utMin;

                    const lateClass = lateMin > 0 ? 'text-danger fw-bold' : '';
                    const utClass = utMin > 0 ? 'text-danger fw-bold' : '';
                    const displayWorkHours = (hasTimeLogs && workHoursVal > 0) ? workHoursVal.toFixed(2) : '0.00';
                    const wrapStyle = 'style="min-width: 150px; max-width: 250px; word-wrap: break-word; white-space: nowrap; line-height: 1.2;"';

                    const dtrDisplay = (a.DTRId && a.DTRId !== 0)
                        ? '<span class="badge rounded-pill bg-info text-white border">' + a.DTRId + '</span>'
                        : '<span class="text-muted small">No DTR</span>';

                    const extractTimeAndDate = (value) => {
                        if (!value || value.trim() === '') return { time: '', date: '' };
                        const parsed = new Date(value);
                        if (isNaN(parsed.getTime())) return { time: value, date: '' };
                        const time = parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                        const date = parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        return { time, date };
                    };

                    const renderTimeWithMap = (value, lat, lon, cssClass, isLocationAvailable, iconColor) => {
                        const { time, date } = extractTimeAndDate(value);
                        const titleAttr = date ? ' title="' + date + '"' : '';
                        const content = '<span class="' + cssClass + '"' + titleAttr + '>' + time + '</span>';
                        if (isLocationAvailable) {
                            return '<a href="https://www.google.com/maps/search/?api=1&query=' + lat + ',' + lon + '" ' +
                                'target="_blank" class="map-link text-decoration-none text-reset" title="View Location on Map">' +
                                content + ' <i class="fa-solid fa-location-dot ' + iconColor + ' fa-xs"></i>' +
                                '</a>';
                        }
                        return content;
                    };

                    html += '<tr class="text-center">' +
                        '<td>' + dtrDisplay + '</td>' +
                        '<td class="text-nowrap">' + (a.DateLog || '') + '</td>' +
                        '<td>' + renderWorkSchedule(a.WorkSchedule) + '</td>' +
                        '<td>' + renderTimeWithMap(a.TimeIn, a.TimeInLatitude, a.TimeInLongitude, (isLate ? 'text-danger fw-bold' : ''), hasInLoc, 'text-success') + '</td>' +
                        '<td>' + renderTimeWithMap(a.TimeOut, a.TimeOutLatitude, a.TimeOutLongitude, (isUndertime ? 'text-danger fw-bold' : ''), hasOutLoc, 'text-danger') + '</td>' +
                        '<td>' + displayWorkHours + '</td>' +
                        '<td>' +
                        '<span class="' + lateClass + '">' + lateMin + '</span>' +
                        ' <span class="text-muted">/</span> ' +
                        '<span class="' + utClass + '">' + utMin + '</span>' +
                        '</td>' +
                        '<td>' + (a.DepartmentDescription || '') + '</td>' +
                        '<td><span class="badge ' + (a.Status === 'Approved' ? 'bg-success' : a.Status === 'Pending' || a.Status === 'Posted' ? 'bg-warning text-dark' : 'bg-danger') + '" ' + badgeStyle + '>' + (a.Status || '') + '</span></td>' +
                        '<td>' + (a.AttendanceLogType || '') + '</td>' +
                        '<td class="text-start" ' + wrapStyle + '>' + (a.Reason || '') + '</td>' +
                        '<td class="text-start" ' + wrapStyle + '>' + (a.Remarks || '') + '</td>' +
                        '</tr>';
                });

                html += '</tbody><tfoot class="table-light fw-bold text-center">' +
                    '<tr>' +
                    '  <td colspan="5" class="text-end">Total:</td>' +
                    '  <td class="text-primary">' + totalRegHrs.toFixed(2) + '</td>' +
                    '  <td>' +
                    '    <span class="text-danger">' + totalLate + '</span>' +
                    '    <span class="text-muted"> / </span>' +
                    '    <span class="text-danger">' + totalUnder + '</span>' +
                    '  </td>' +
                    '  <td colspan="5"></td>' +
                    '</tr></tfoot></table></div></div></div>';
                // ====================== OVERTIME ======================
                const extractTimeAndDate = (value) => {
                    if (!value || value.trim() === '') return { time: '', date: '' };

                    const parsed = new Date(value);
                    if (isNaN(parsed.getTime())) {
                        return { time: value, date: '' };
                    }

                    const time = parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    const date = parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    return { time, date };
                };

                let totalApprovedOTHrs = 0;
                html += '<div class="card mb-3 shadow-sm">';
                html += '<div class="card-header bg-info text-white py-2"><strong>Overtime</strong></div>';
                html += '<div class="card-body p-0">';
                html += '<div class="table-responsive">';
                html += '<table class="table table-sm table-hover table-striped mb-0 align-middle" ' + fontStyle + '>';
                html += '<thead class="table-dark text-center"><tr>' +
                    '<th>Date</th>' +
                    '<th>Start</th>' +
                    '<th>End</th>' +
                    '<th>Hours</th>' +
                    '<th>Status</th>' +
                    '<th>Continuous?</th>' +
                    '<th>Reason</th>' +
                    '</tr></thead><tbody>';

                $.each(data.Overtime, function (i, o) {
                    const hours = parseFloat(o.TotalHours || o.Hours) || 0;
                    const status = (o.Status || '').trim().toUpperCase();
                    totalApprovedOTHrs += hours;

                    const startInfo = extractTimeAndDate(o.Start);
                    const endInfo = extractTimeAndDate(o.End);
                    const startTitle = startInfo.date ? ' title="' + startInfo.date + '"' : '';
                    const endTitle = endInfo.date ? ' title="' + endInfo.date + '"' : '';

                    html += '<tr class="text-center">' +
                        '<td>' + (o.Date || '') + '</td>' +
                        '<td><span' + startTitle + '>' + startInfo.time + '</span></td>' +
                        '<td><span' + endTitle + '>' + endInfo.time + '</span></td>' +
                        '<td class="fw-bold">' + hours.toFixed(2) + '</td>' +
                        '<td><span class="badge ' + (status === 'APPROVED' || status === 'POSTED' ? 'bg-success' : 'bg-warning text-dark') + '" ' + badgeStyle + '>' + (o.Status || '') + '</span></td>' +
                        '<td>' + (o.Is_Continues === 'Y' || o.Is_Continues === 'Yes' ? '<span class="text-success fw-bold">Yes</span>' : '<span class="text-muted">No</span>') + '</td>' +
                        '<td class="text-start" style="min-width:150px; word-break: break-word;">' + (o.Reason || '') + '</td>' +
                        '</tr>';
                });

                html += '</tbody><tfoot class="table-light fw-bold">' +
                    '<tr>' +
                    '  <td colspan="3" class="text-end">Total Approved OT:</td>' +
                    '  <td class="text-center text-primary">' + totalApprovedOTHrs.toFixed(2) + '</td>' +
                    '  <td colspan="3"></td>' +
                    '</tr></tfoot></table></div></div></div>';
                // ====================== LEAVE ======================
                html += '<div class="card mb-3 shadow-sm">';
                html += '<div class="card-header bg-warning text-dark py-2"><strong>Leave</strong></div>';
                html += '<div class="card-body p-0">';
                html += '<div class="table-responsive">';
                html += '<table class="table table-sm table-hover table-striped mb-0 align-middle" ' + fontStyle + '>';
                html += '<thead class="table-dark text-center"><tr>' +
                    '<th>Date Filed</th>' +
                    '<th>From</th>' +
                    '<th>To</th>' +
                    '<th>Days</th>' +
                    '<th>Status</th>' +
                    '</tr></thead><tbody>';
                $.each(data.Leave, function (i, l) {
                    html += '<tr class="text-center">' +
                        '<td>' + l.Date + '</td>' +
                        '<td>' + l.LeaveFrom + '</td>' +
                        '<td>' + l.LeaveTo + '</td>' +
                        '<td>' + l.NoOfDays + '</td>' +
                        '<td><span class="badge ' + (l.Status === 'Approved' ? 'bg-success' : 'bg-warning text-dark') + '" ' + badgeStyle + '>' + l.Status + '</span></td>' +
                        '</tr>';
                });
                html += '</tbody></table></div></div>';
                
                // ====================== SIGNATURE & CONFIRMATION ======================
                html += '<div class="card mt-3 mb-2 border-primary">' +
                    '<div class="card-body py-3 text-center">' +
                    '<img src="/Content/ItalizedSignature.png" alt="E-Signature" style="max-height:180px; width:100%; object-fit:contain;" />' +
                    '<div class="small mt-1 mb-3"><span class="bg-warning-subtle text-warning-emphasis px-2 py-1 rounded fw-bold">* Sample e-signature format only</span></div>' +
                    '<hr class="my-2" />' +
                    '<small class="text-muted d-block">' +
                    '<i class="fa-solid fa-circle-info text-primary"></i> ' +
                    'By clicking <strong>"Yes"</strong>, you agree to use the italicized signature shown above as your official electronic signature, ' +
                    'confirming that the DTR details displayed are true and accurate, and your DTR will be created and posted. ' +
                    'Clicking <strong>"No"</strong> will not proceed and no DTR will be created.' +
                    '</small>' +
                    '</div>' +
                    '</div>';

                html += '<div class="d-flex justify-content-center gap-2 mt-3 mb-2 pe-1">' +
                    '<button type="button" class="btn btn-success" id="post_dtr">' +
                    '<i class="fa-regular fa-circle-check"></i> Yes, I agree.' +
                    '</button>' +
                    '<button type="button" class="btn btn-secondary" id="cancel_DTR">' +
                    '<i class="fa-regular fa-circle-xmark"></i> No, I do not.' +
                    '</button>' +
                    '</div>';

                $('#dtrContainer').html(html);
            },
            error: function (xhr) {
                $('#dtrContainer').html('<div class="text-center text-danger py-5">Failed to load DTR details.</div>');
            }
        });
    }

    $(document).on('click', '#cancel_DTR', function () {
        $('#add_dtr_modal').modal('hide');
    });

    function resetDTRPreview() {
        $('#dtrContainer').html(
            '<div class="dtr-empty-state" id="dtrEmptyState">' +
            '<img src="/Content/animation/selectdtr.gif" alt="Select DTR" />' +
            '<p>Select a <strong>Cutoff</strong>, <strong>Month</strong>, and <strong>Date range</strong> above, then choose an employee to preview their DTR.</p>' +
            '</div>'
        );
    }

    $('#add_dtr_modal').on('hidden.bs.modal', function () {
        resetDTRPreview();
    });

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
