$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-payroll").addClass("active");


        var date = new Date();


        var curr_date = date.getDate();
        var curr_month = date.getMonth() + 1; //Months are zero based
        var curr_year = date.getFullYear();


        if (curr_month.toString().length == 1) { curr_month = "0" + curr_month; }
        if (curr_date.toString().length == 1) { curr_date = "0" + curr_date; }


        document.getElementById("payslip_datepicker_from").value = curr_year + "-01"; //-01"; //  firstDay.toString( "yy-mm-dd"); "2021-01-01";  //
        document.getElementById("payslip_datepicker_to").value = curr_year + "-" + curr_month; // + "-" + curr_date; //lastDay;

        ShowLoading('HIDE');
        BindTable();
    });


    $("#show_payslip_filter_btn").click(function (e) {
        e.preventDefault();

        $('#filter_payslip_modal').modal('show');
    });

    function BindTable() {
        var FromDate = document.getElementById("payslip_datepicker_from").value;
        var ToDate = document.getElementById("payslip_datepicker_to").value;

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Payroll/_GetEmployeePayslips",
            data: {
                "_fromdate": FromDate,
                "_todate": ToDate
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                ShowLoading('HIDE');
                DisplayPayslipList(response);
                $('#filter_payslip_modal').modal('hide');
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
    };

    function DisplayPayslipList(response) {
        $("#payslip-table").DataTable(
            {
                autoWidth: false,
                bLengthChange: true,
                lengthMenu: [[10, -1], [10, "All"]],
                bFilter: true,
                bSort: true,
                bPaginate: true,
                data: response,
                columns: [
                    { 'data': 'PayDate' },
                    { 'data': 'PayrollPeriod' },
                ],
                order: [[0, "desc"]],
                columnDefs: [
 
                    {
                        title: 'Pay Date',
                        target: 0,
                        class: "d-none d-sm-table-cell",
                        "render": function (data, type, row, meta) {
                            const date = new Date(row.PayDate);
                            return ' <strong class="text-primary">' + date.toLocaleDateString('es-pa') + ' </strong> '
                        }
                    },
                    {
                        title: 'Payroll Description',
                        target: 1
                    },
                    {
                        target: 2,
                        data: null,
                        "render": function (data) {
                            return ' <a href="#" class="btn btn-sm btn-primary download-button"     data-toggle="tooltip" title="Download"           _id=' + data.PayrollId + '> ' +
                                ' <i class="fa-regular fa-circle-down"></i> Download' +
                                ' </a>'
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

    $("#filter_payslip").click(function (e) {
        e.preventDefault();

        var table = $('#payslip-table').DataTable();
        table.destroy();
        $('#payslip-table').empty();

        BindTable();
    });

    /////////////========================================TABLE EVENTS==============================================================
    $('#payslip-table').on('click', '.download-button', function () {
        var PayrollID = $(this).attr("_id");

 
        let new_actionURL = '/Payroll/PrintPayslip?_payrollid=' + PayrollID;
        window.open(new_actionURL, 'Payslip', 'top=10, status=no, toolbar=no, resizable=yes, scrollbars=yes, width=800, height=600');
        return false;
    });
    /////////////========================================TABLE EVENTS==============================================================

    function ShowLoading(show) {
        var x = document.getElementById("preloader");
        if (show === 'SHOW') { x.style.visibility = ''; }
        else { x.style.visibility = 'hidden'; }
    }
});

