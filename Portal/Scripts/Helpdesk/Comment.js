$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-helpdesk").addClass("active");


        ShowLoading('HIDE');
        BindTable();
    });


    function ClearTable() {
        var table = $('#comments-table').DataTable();
        table.destroy();
        $('#comments-table').empty();
    };

    function BindTable() {
        var FromDate = document.getElementById("From").value;
        var ToDate = document.getElementById("To").value;

        var e_concerntype = document.getElementById("ConcernType");
        var ConcenTypeId = e_concerntype.value;

        if (ConcenTypeId == "") { ConcenTypeId = 0; }

        var e_status = document.getElementById("Status");
        var Status = e_status.value;

        if (Status == "") { Status = "All"; }

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Helpdesk/_GetPortalHelpdesk",
            data: {
                '_concerntypeid': ConcenTypeId,
                '_status': Status,
                '_fromdate': FromDate,
                '_todate': ToDate
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                ShowLoading('HIDE');
                DisplayConcerns(response);
                $('#filter_helpdesk_modal').modal('hide');
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
    };

    function DisplayConcerns(response) {
        $("#helpdesk-table").DataTable(
            {
                autoWidth: false,
                bLengthChange: true,
                lengthMenu: [[10, -1], [10, "All"]],
                bFilter: true,
                bSort: true,
                bPaginate: true,
                data: response,
                columns: [
                    { 'data': 'ConcernDate' },
                    { 'data': 'ConcernType' },
                    { 'data': 'Remarks' },
                    { 'data': 'FileStatus' },
                    { 'data': 'ConcernStatus' },
                ],
                order: [[0, "desc"]],
                columnDefs: [

                    {
                        title: 'Date filed',
                        target: 0,
                        class: "d-none d-sm-table-cell",
                        "render": function (data, type, row, meta) {
                            const date = new Date(row.ConcernDate);
                            return date.toLocaleDateString('es-pa')
                        }
                    },
                    {
                        title: 'Type',
                        target: 1,
                        "render": function (data, type, row, meta) {
                            return ' <strong class="text-primary">' + row.ConcernType + ' </strong> '
                        }
                    },
                    {
                        title: 'Concern',
                        target: 2
                    },
                    {
                        title: 'File Status',
                        class: "d-none d-sm-table-cell text-center",
                        target: 3
                    },
                    {
                        title: 'Concern Status',
                        class: "d-none d-sm-table-cell text-center",
                        target: 4
                    },
                    {
                        target: 5,
                        className: 'dt-body-right',
                        "render": function (data, type, row, meta) {
                            return '<div class="btn-group"> ' +
                                '   <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"> ' +
                                ' <i class="fa-solid fa-ellipsis-vertical me-2"></i> Option ' +
                                '             </button> ' +
                                ' <ul class="dropdown-menu">' +
                                ' <li> <a class="dropdown-item view-concern"' + row.ViewVisible + ' Concernid="' + row.Id + '"> <i class="fa-regular fa-eye"></i> View</a></li> ' +
                                ' <li> <a class="dropdown-item edit-concern"' + row.EditVisible + ' Concernid="' + row.Id + '"> <i class="fa-solid fa-pen-to-square"></i> Edit</a></li> ' +
                                ' <li> <a class="dropdown-item post-concern"' + row.PostVisible + ' Concernid="' + row.Id + '"> <i class="fa-solid fa-thumbtack"></i> Post</a></li> ' +
                                ' <li> <a class="dropdown-item unpost-concern"' + row.UnpostVisible + ' Concernid="' + row.Id + '"> <i class="fa-solid fa-rotate-left"></i> Unpost</a></li> ' +
                                ' <li> <a class="dropdown-item cancel-concern"' + row.CancelVisible + ' Concernid="' + row.Id + '"> <i class="fa-solid fa-ban"></i> Cancel</a></li> ' +
                                ' <li> <a class="dropdown-item delete-concern"' + row.DeleteVisible + ' Concernid="' + row.Id + '"> <i class="fa-solid fa-trash"></i> Delete</a></li> ' +

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
