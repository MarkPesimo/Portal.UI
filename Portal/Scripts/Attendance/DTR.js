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


    //----------------------------------BEGIN TABLE----------------------------------------------
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
        $("#dtr-table").DataTable(
            {
                autoWidth: false,
                bLengthChange: true,
                lengthMenu: [[-1], ["All"]],
                bFilter: true,
                bSort: true,
                bPaginate: true,
                data: response,
                columns: [
                    { 'data': 'DateFiled' },
                    { 'data': 'Description' },
                    //{ 'data': 'DateFrom' },                   
                    { 'data': 'Status' },
                    { 'data': 'Status' },
                ],
                order: [[1, "desc"]],
                columnDefs: [
                    {
                        title: 'Date Filed',
                        target: 0,
                        class: "d-none d-sm-table-cell text-center",
                        "render": function (data, type, row, meta) {
                            const date = new Date(row.DateFiled);
                            return ' <strong class="text-primary">' + date.toLocaleDateString('es-pa') + ' </strong> '
                        }
                    },                    
                    {
                        title: 'Description',
                        class: "d-none d-sm-table-cell",
                        target: 1,
                    },
                    {
                        title: 'Status',
                        target: 2,
                        class: "d-none d-sm-table-cell text-center",
                        "render": function (data, type, row, meta) {
                            return SetTableBGColor(row.Status)
                        }
                    },
                    {
                        title: 'Details',
                        target: 3,
                        class: "d-xs-block d-sm-none d-m-none d-lg-none",
                        "render": function (data, type, row, meta) {
                            return 'Date Filed : ' + row.DateFiled  + ' ' +
                            '<small class="d-block">Description : ' + row.Description + '</small> ' +
                                '<small class="d-block">Date from : ' + row.DateFrom + '</small> ' +
                                '<small class="d-block">Date to : ' + row.DateTo + '</small> ' +
                                SetTableBGColor(row.Status)

                        }
                    },
                    {
                        target: 4,
                        className: 'dt-body-right',
                        "render": function (data, type, row, meta) {
                            return '<div class="btn-group"> ' +
                                '   <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"> ' +
                                ' <i class="fa-solid fa-ellipsis-vertical me-2"></i> Option ' +
                                '             </button> ' +
                                ' <ul class="dropdown-menu">' +
                                ' <li> <a class="dropdown-item print-dtr"' + row.EditVisible + ' DTRid="' + row.Id + '"><i class="fa-solid fa-print"></i> Print</a></li> ' +
                                ' <li> <a class="dropdown-item edit-dtr"' + row.EditVisible + ' DTRid="' + row.Id + '"> <i class="fa-solid fa-pen-to-square"></i> Edit</a></li> ' +
                                ' <li> <a class="dropdown-item post-dtr"' + row.PostVisible + ' DTRid="' + row.Id + '"> <i class="fa-solid fa-thumbtack"></i> Post</a></li> ' +
                                ' <li> <a class="dropdown-item unpost-dtr"' + row.UnpostVisible + ' DTRid="' + row.Id + '"> <i class="fa-solid fa-rotate-left"></i> Unpost</a></li> ' +
                                ' <li> <a class="dropdown-item cancel-dtr"' + row.CancelVisible + ' DTRid="' + row.Id + '"> <i class="fa-solid fa-ban"></i> Cancel</a></li> ' +
                                '</ul>' +
                                '</div> '
                        }
                    }
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


    function SetTableBGColor(_status) {
        var _font_color = 'white';
        var _color = '#6C757D';
        if (_status == 'Posted') { _color = '#5cb85c'; }
        else if (_status == "Approved") { _color = '#0275d8'; }
        else if (_status == "Cancelled") { _color = '#d9534f'; }
        else if (_status == "Rejected") { _color = '#c94D3B';}
        else { _font_color = 'black'; }

        return '<a href="#" class="mt-2 btn btn-sm " style="background : ' + _color + ';border-radius:10%; color: ' + _font_color + '"> ' + _status + '</a>'
    };

  
    //----------------------------------END TABLE----------------------------------------------

    //----------------------------------BEGIN ADD DTR-----------------------------------
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
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#add_dtr_modal').on('click', '#submit_DTR', function (e) {
        //ShowLoading('SHOW');
        //$.ajax({
        //    url: '/Attendance/_ManageDTR',
        //    type: "POST",
        //    data: $('#dtr-Form').serialize(),
        //    dataType: 'json',
        //    success: function (result) {
        //        if (result.Result == "ERROR") { ValidationError(result); }
        //        else {
        //            $("#add_dtr_modal").modal('hide');

        //            ShowLoading('HIDE');
        //            ShowSuccessMessage('DTR successfully created.');
        //            BindTable();
        //        }
        //    },
        //    failure: function (response) { LogError(response); },
        //    error: function (response) { LogError(response); }
        //});
        ManageDTR('#dtr-Form', '#add_dtr_modal', 'DTR successfully created.')
    });
    //----------------------------------END ADD DTR-----------------------------------

    //----------------------------------BEGIN EDIT DTR--------------------------------------
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
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });
 
    $('#edit_dtr_modal').on('click', '#update_dtr', function (e) {
        //ShowLoading('SHOW');
        //$.ajax({
        //    url: '/Attendance/_ManageDTR',
        //    type: "POST",
        //    data: $('#dtr-Form').serialize(),
        //    dataType: 'json',
        //    success: function (result) {
        //        if (result.Result == "ERROR") { ValidationError(result); }
        //        else {
        //            $("#edit_dtr_modal").modal('hide');

        //            ShowLoading('HIDE');
        //            ShowSuccessMessage('DTR successfully updated.');
        //            BindTable();
        //        }
        //    }
        //});
        ManageDTR('#dtr-Form', '#edit_dtr_modal', 'DTR successfully updated.')
    });
    //----------------------------------END EDIT DTR--------------------------------------

    //----------------------------------BEGIN POST CORRECTION--------------------------------------
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

                DisplayDtrDetails(DTRId);
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#post_dtr_modal').on('click', '#post_dtr', function (e) {
        //ShowLoading('SHOW');
        //$.ajax({
        //    url: '/Attendance/_ManageDTR',
        //    type: "POST",
        //    data: $('#post-dtr-Form').serialize(),
        //    dataType: 'json',
        //    success: function (result) {
        //        if (result.Result == "ERROR") { ValidationError(result); }
        //        else {
        //            $("#post_dtr_modal").modal('hide');

        //            ShowLoading('HIDE');
        //            ShowSuccessMessage('DTR successfully Posted.');
        //            BindTable();
        //        }
        //    }
        //});
        ManageDTR('#post-dtr-Form', '#post_dtr_modal', 'DTR successfully Posted.')
    });

    function DisplayDtrDetails(DTRId) {      
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

    //----------------------------------END POST CORRECTION--------------------------------------

    //----------------------------------BEGIN UNPOST CORRECTION--------------------------------------
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
        //ShowLoading('SHOW');
        //$.ajax({
        //    url: '/Attendance/_ManageDTR',
        //    type: "POST",
        //    data: $('#unpost-dtr-Form').serialize(),
        //    dataType: 'json',
        //    success: function (result) {
        //        if (result.Result == "ERROR") { ValidationError(result); }
        //        else {
        //            $("#unpost_dtr_modal").modal('hide');

        //            ShowLoading('HIDE');
        //            ShowSuccessMessage('DTR successfully Unposted.');
        //            BindTable();
        //        }
        //    }
        //});
        ManageDTR('#unpost-dtr-Form', '#unpost_dtr_modal', 'DTR successfully Unposted.')
    });
    //----------------------------------END UNPOST CORRECTION--------------------------------------

    //----------------------------------BEGIN UNPOST CORRECTION--------------------------------------
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
        //ShowLoading('SHOW');
        //$.ajax({
        //    url: '/Attendance/_ManageDTR',
        //    type: "POST",
        //    data: $('#cancel-dtr-Form').serialize(),
        //    dataType: 'json',
        //    success: function (result) {
        //        if (result.Result == "ERROR") { ValidationError(result); }
        //        else {
        //            $("#cancel_dtr_modal").modal('hide');

        //            ShowLoading('HIDE');
        //            ShowSuccessMessage('DTR successfully Cancelled.');
        //            BindTable();
        //        }
        //    }
        //});
        ManageDTR('#cancel-dtr-Form', '#cancel_dtr_modal', 'DTR successfully Cancelled.')
    });

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
                    $(modal_name).modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage(msg);
                    BindTable();
                }
            }
        });
    }
    //----------------------------------END UNPOST CORRECTION--------------------------------------

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
    //==================================END MISC==================================
});
