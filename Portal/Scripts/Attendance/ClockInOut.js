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
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
        
    });

    $('#add_correction_modal').on('click', '#submit_correction', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Attendance/_AddCorrection',
            type: "POST",
            data: $('#add-attendance-correction-Form').serialize(),
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
                                '<small class="d-block">Time Out : ' + row.ClockOut + '</small> ' 
                                //SetTableBGColor(row.Status)

                        }
                    },
                    {
                        title: 'Status',
                        class: "text-center",
                        target: 6
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

