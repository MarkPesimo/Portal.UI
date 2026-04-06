$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-Payroll").addClass("active");
        $("#nav-Payroll").addClass("bg-primary");

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

    $("#filter_payslip").click(function (e) {
        e.preventDefault();

        var table = $('#payslip-table').DataTable();
        //table.destroy();
        $('#payslip-table').empty();

        BindTable();
    });
    
    $('#payslip-table').on('click', '.download-button', function () {
        var PayrollID = $(this).attr("_id");

 
        let new_actionURL = '/Payroll/PrintPayslip?_payrollid=' + PayrollID;
        window.open(new_actionURL, 'Payslip', 'top=10, status=no, toolbar=no, resizable=yes, scrollbars=yes, width=800, height=600');
        return false;
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
        if ($.fn.DataTable.isDataTable('#payslip-table')) {
            $('#payslip-table').DataTable().destroy();
        }

        var mobileLabels = ["Pay Date", "Payroll Description", "Action"];

        $("#payslip-table").DataTable({
            autoWidth: false,
            data: response,
            order: [[0, "desc"]],
            columns: [
                { 'data': 'PayDate' },
                { 'data': 'PayrollPeriod' },
                { 'data': null }
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
                    render: function (data) {
                        const date = new Date(data);
                        return '<strong>' + date.toLocaleDateString('es-pa') + '</strong>';
                    }
                },
                {
                    targets: 2,
                    orderable: false,
                    render: function (data, type, row) {
                        return '<a href="#" class="btn btn-sm btn-primary w-85 download-button" _id="' + row.PayrollId + '">' +
                            '<i class="fa-regular fa-circle-down me-2"></i> Download' +
                            '</a>';
                    }
                }
            ]
        });

        ShowLoading('HIDE');
    }

    function ShowLoading(show) {
        var x = document.getElementById("preloader");
        if (show === 'SHOW') { x.style.visibility = ''; }
        else { x.style.visibility = 'hidden'; }
    }
});

