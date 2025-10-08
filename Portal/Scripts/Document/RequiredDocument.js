$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-Document").addClass("active");
        $("#nav-Document").addClass("bg-primary");

        ShowLoading('HIDE');
        BindTable();
    });

    function ClearTable(tablename) {
        var table = $(tablename).DataTable();
        table.destroy();
        $(tablename).empty();
    };

    function BindTable() {
        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Document/GetRequiredDocuments",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                ShowLoading('HIDE');
                ClearTable("#required-document-table");
                DisplayRecords(response);
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
    };

    function DisplayRecords(response) {
        $("#required-document-table").DataTable(
            {
                autoWidth: false,
                bLengthChange: true,
                lengthMenu: [[-1], ["All"]],
                bFilter: true,
                bSort: true,
                bPaginate: true,
                data: response,
                columns: [
                    { 'data': 'RequiredDocumentId' },
                    { 'data': 'SortNo' },
                    { 'data': 'DocumentName' },
                    { 'data': 'HasDocument' },
                    { 'data': 'IsMandatory' },
                    { 'data': 'DocId' }
                ],
                order: [[1, "asc"]],
                columnDefs: [
      
                    {
                        title: 'reqid',
                        class: "d-none d-sm-table-cell",
                        visible : false,
                        target: 0,
                    },
                    {
                        title: 'Sort no.',
                        class: "d-none d-sm-table-cell",
                        visible: false,
                        target: 1,
                    },
                    {
                        title: 'Document Name',
                        target: 2,
                        //class: "d-none d-sm-table-cell text-center",
                        //"render": function (data, type, row, meta) {
                        //    return SetTableBGColor(row.Status)
                       // }
                    },
                    {
                        title: 'Has Document',
                        target: 3,
                        class: "d-none d-sm-table-cell text-center",
                        //class: "d-none d-sm-table-cell text-center",
                        //"render": function (data, type, row, meta) {
                        //    return SetTableBGColor(row.Status)
                    },
                    {
                        title: 'Mandatory',
                        target: 4,
                        class: "d-none d-sm-table-cell text-center",
                        //"render": function (data, type, row, meta) {
                        //    return SetTableBGColor(row.Status)
                    },
                    {
                        title: 'docid',
                        target: 5,
                        visible: false,
                        class: "d-none d-sm-table-cell text-center",
                        //"render": function (data, type, row, meta) {
                        //    return SetTableBGColor(row.Status)
                    },
                     
                    {
                        target: 6,
                        className: 'dt-body-right',
                        "render": function (data, type, row, meta) {
                            return '<div > ' +
                                ' <button type="button" class="btn btn-primary submit-document-btn"' + row.ButtonVisible + ' DocId="' + row.DocId + '" RequiredDocumentId="' + row.RequiredDocumentId + '"><i class="fa-solid fa-paperclip"></i> Attach</a>  ' +
                                '</div> '
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

    $('#required-document-table').on('click', '.submit-document-btn', function () {
        var DocId = $(this).attr("docid");
        var RequiredDocumentId = $(this).attr("RequiredDocumentId");

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
 
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });


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

    function ShowSuccessMessage(_msg) {
        ShowLoading('HIDE');
        document.getElementById("toasterSuccess-body").innerHTML = _msg;
        const toaster = document.getElementById("toasterSuccess");
        const toasterFunction = bootstrap.Toast.getOrCreateInstance(toaster);
        toasterFunction.show();
    }
});

