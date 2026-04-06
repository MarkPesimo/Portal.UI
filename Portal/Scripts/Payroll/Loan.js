$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-Payroll").addClass("active");
        $("#nav-Payroll").addClass("bg-primary");

        document.getElementById("_loanstatus").selectedIndex = "1";


        ShowLoading('HIDE');
        BindTable();
    });

    $("#show_loan_filter_btn").click(function (e) {
        e.preventDefault();

        $('#filter_loan_modal').modal('show');
    });

    $("#filter_loan_btn").click(function (e) {
        e.preventDefault();

        if ($.fn.DataTable.isDataTable('#loan-table')) {
            $('#loan-table').DataTable().destroy();
        }

        BindTable();
    });
    
    $('#loan-table').on('click', '.preview-button', function () {
        var LoanId = $(this).attr("_id");

        var table = $('#loan-payment-transaction-table').DataTable();
        table.destroy();
        $('#loan-payment-transaction-table').empty();

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Payroll/_GetLoanTransactions",
            data: {
                "_loanId": LoanId,
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                $('#loan_payment_transaction_modal').modal('show');
                //console.log(response);
                DisplayLoanPaymentTransaction(response);
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
         
    });

    function BindTable() {

        var Status = document.getElementById("_loanstatus").value;
        if (Status == "") { Status = "All" }
        // console.log(Status);

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Payroll/_GetEmployeeLoans",
            data: {
                "_status": Status,
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                ShowLoading('HIDE');
                DisplayLoans(response);
                $('#filter_loan_modal').modal('hide');
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
    };

    function DisplayLoans(response) {
        if ($.fn.DataTable.isDataTable('#loan-table')) {
            $('#loan-table').DataTable().destroy();
        }
        
        var mobileLabels = [
            "Loan Date",
            "Loan Type",
            "Principal",
            "Balance",
            "Status",
            "Payment Status",
            "Created By",
            "Date Created",
            "Action"
        ];

        $("#loan-table").DataTable({
            autoWidth: false,
            data: response,
            dom: "<'row mb-2'<'col-6'l><'col-6'f>>" + "<'row'<'col-12'tr>>" + "<'row mt-3'<'col-12 col-md-6'i><'col-12 col-md-6'p>>",
            columns: [
                { 'data': 'LoanDate' },
                { 'data': 'LoanType' },
                { 'data': 'LoanAmount' },
                { 'data': 'LoanBalance' },
                { 'data': 'LoanStatus' },
                { 'data': 'IsPaid' },
                { 'data': 'CreatedBy' },
                { 'data': 'DateCreated' },
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
                    className: "text-center",
                    render: function (data, type, row) {
                        const date = new Date(row.LoanDate);
                        return '<strong class="text-info">' + date.toLocaleDateString('es-pa') + '</strong>';
                    }
                },
                {
                    targets: 2,
                    className: 'text-end fw-bold',
                    render: $.fn.dataTable.render.number(',', '.', 2, '₱ ')
                },
                {
                    targets: 3, 
                    className: 'text-end fw-bold text-danger',
                    render: $.fn.dataTable.render.number(',', '.', 2, '₱ ')
                },
                {
                    targets: [4, 5, 6],
                    className: "text-center"
                },
                {
                    targets: 7, 
                    className: "text-center",
                    render: function (data, type, row) {
                        const date = new Date(row.DateCreated);
                        return '<small class="text-muted">' + date.toLocaleDateString('es-pa') + '</small>';
                    }
                },
                {
                    targets: 8, 
                    orderable: false,
                    className: "text-center",
                    render: function (data, type, row) {
                        return '<a href="#" class="btn btn-sm btn-primary w-80 preview-button" data-toggle="tooltip" title="Preview" _id="' + row.LoanId + '">' +
                            '<i class="fa-regular fa-folder-open me-2"></i> View Details' +
                            '</a>';
                    }
                }
            ]
        });

        ShowLoading('HIDE');
    }

    function DisplayLoanPaymentTransaction(response) {
        $("#loan-payment-transaction-table").DataTable(
            {
                autoWidth: false,
                bLengthChange: true,
                lengthMenu: [[10, -1], [10, "All"]],
                bFilter: true,
                bSort: true,
                bPaginate: true,
                data: response,
                columns: [
                    { 'data': 'TransactionDate' },
                    { 'data': 'PayrollDescription' },
                    { 'data': 'Amount' }
                ],
                order: [[0, "desc"]],
                columnDefs: [
                    {
                        title: 'Transaction Date',
                        target: 0,
                        class: "d-none d-sm-table-cell text-center",
                        "render": function (data, type, row, meta) {
                            const date = new Date(row.TransactionDate);
                            return ' <strong class="text-info">' + date.toLocaleDateString('es-pa') + ' </strong> '
                        }
                    },
                    {
                        title: 'Description',
                        target: 1
                    },
                    {
                        title: 'Amount',
                        target: 2,
                        className: 'dt-body-right',
                        render: $.fn.dataTable.render.number(',', '.', 2, '')
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

    function ShowLoading(show) {
        var x = document.getElementById("preloader");
        if (show === 'SHOW') { x.style.visibility = ''; }
        else { x.style.visibility = 'hidden'; }
    }
});

