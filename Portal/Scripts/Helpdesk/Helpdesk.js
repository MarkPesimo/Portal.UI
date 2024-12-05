$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-helpdesk").addClass("active");

        ShowLoading('HIDE');
        BindTable();
    });
    
    $("#how-to-button").click(function (e) {
        e.preventDefault();
                
        var url = '/Helpdesk/HowToUse';
        window.open("" + url + "", 'Attachment', 'top=100, status=no, toolbar=no, resizable=yes, scrollbars=yes, width=800, height=600');
    });

       
    
    $("#show_helpdesk_filter_btn").click(function (e) {
        e.preventDefault();

        $('#filter_helpdesk_modal').modal('show');
    });

    $('#filter_helpdesk_modal').on('click', '#filter_concern', function (e) {

        ShowLoading('SHOW');
        ClearTable('#helpdesk-table');
        BindTable();
    });
       
    function ClearTable(tablename) {
        var table = $(tablename).DataTable();
        table.destroy();
        $(tablename).empty();
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
                '_fromdate' :  FromDate,
                '_todate' : ToDate
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

    /////////////========================================TABLE EVENTS==============================================================

     //----------------------------------BEGIN EDIT CONCERN--------------------------------------
    $('#helpdesk-table').on('click', '.edit-concern', function () {
        var ConcernId = $(this).attr("Concernid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Helpdesk/_EditConcern',
            data: { '_id': ConcernId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');

                $('#edit_concern_modal').find(".modal-body").html(response);
                $("#edit_concern_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#edit_concern_modal').on('click', '#update-concern-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Helpdesk/_EditConcern',
            type: "POST",
            data: $('#concern-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#edit_concern_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Concern successfully updated.');
                    ClearTable('#helpdesk-table');
                    BindTable();
                }
            }
        });
    });
    //----------------------------------END EDIT CONCERN--------------------------------------


    //----------------------------------BEGIN POST CONCERN--------------------------------------
    $('#helpdesk-table').on('click', '.post-concern', function () {
        var ConcernId = $(this).attr("Concernid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Helpdesk/_PostConcern',
            data: { '_id': ConcernId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');

                $('#post_concern_modal').find(".modal-body").html(response);
                $("#post_concern_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#post_concern_modal').on('click', '#post-concern-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Helpdesk/_PostConcern',
            type: "POST",
            data: $('#post-concern-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#post_concern_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Concern successfully Posted.');
                    ClearTable('#helpdesk-table');
                    BindTable();
                }
            }
        });
    });
    //----------------------------------END POST CONCERN--------------------------------------

    //----------------------------------BEGIN UNPOST CONCERN--------------------------------------
    $('#helpdesk-table').on('click', '.unpost-concern', function () {
        var ConcernId = $(this).attr("Concernid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Helpdesk/_UnpostConcern',
            data: { '_id': ConcernId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');

                $('#unpost_concern_modal').find(".modal-body").html(response);
                $("#unpost_concern_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#unpost_concern_modal').on('click', '#unpost-concern-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Helpdesk/_UnpostConcern',
            type: "POST",
            data: $('#unpost-concern-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#unpost_concern_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Concern successfully Unposted.');
                    ClearTable('#helpdesk-table');
                    BindTable();

                }
            }
        });

    });
    //----------------------------------END UNPOST CONCERN--------------------------------------

    //----------------------------------BEGIN CANCEL CONCERN--------------------------------------
    $('#helpdesk-table').on('click', '.cancel-concern', function () {
        var ConcernId = $(this).attr("Concernid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Helpdesk/_CancelConcern',
            data: { '_id': ConcernId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');

                $('#cancel_concern_modal').find(".modal-body").html(response);
                $("#cancel_concern_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#cancel_concern_modal').on('click', '#cancel-concern-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Helpdesk/_CancelConcern',
            type: "POST",
            data: $('#cancel-concern-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#cancel_concern_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Concern successfully Cancelled.');
                    ClearTable('#helpdesk-table');
                    BindTable();

                }
            }
        });

    });
    //----------------------------------END CANCEL CONCERN--------------------------------------

    //----------------------------------BEGIN CANCEL CONCERN--------------------------------------
    $('#helpdesk-table').on('click', '.cancel-concern', function () {
        var ConcernId = $(this).attr("Concernid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Helpdesk/_CancelConcern',
            data: { '_id': ConcernId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');

                $('#cancel_concern_modal').find(".modal-body").html(response);
                $("#cancel_concern_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#cancel_concern_modal').on('click', '#cancel-concern-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Helpdesk/_CancelConcern',
            type: "POST",
            data: $('#cancel-concern-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#cancel_concern_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Concern successfully Cancelled.');
                    ClearTable('#helpdesk-table');
                    BindTable();

                }
            }
        });

    });
    //----------------------------------END CANCEL CONCERN--------------------------------------

    //----------------------------------BEGIN DELETE CONCERN--------------------------------------
    $('#helpdesk-table').on('click', '.delete-concern', function () {
        var ConcernId = $(this).attr("Concernid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Helpdesk/_DeleteConcern',
            data: { '_id': ConcernId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');

                $('#delete_concern_modal').find(".modal-body").html(response);
                $("#delete_concern_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#delete_concern_modal').on('click', '#delete-concern-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Helpdesk/_DeleteConcern',
            type: "POST",
            data: $('#delete-concern-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#delete_concern_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Concern successfully Deleted.');
                    ClearTable('#helpdesk-table');
                    BindTable();

                }
            }
        });

    });
    //----------------------------------END DELETE CONCERN--------------------------------------

    //----------------------------------BEGIN VIEW CONCERN--------------------------------------
    $('#helpdesk-table').on('click', '.view-concern', function () {
        var ConcernId = $(this).attr("Concernid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Helpdesk/_GetComments',
            data: { '_concernid': ConcernId },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                ShowLoading('HIDE');
                //console.log(response);
                $("#comment_modal").modal('show');
                ClearTable('#comments-table');
                DisplayComments(response);
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    function DisplayComments(response) {
        console.log(response);
        $("#comments-table").DataTable(
            {
                autoWidth: false,
                bLengthChange: true,
                lengthMenu: [[10, -1], [10, "All"]],
                bFilter: true,
                bSort: true,
                bPaginate: true,
                data: response,
                columns: [
                    { 'data': 'DateCreated' },
                    { 'data': 'CreatedBy' },
                    { 'data': 'Comment' },
                ],
                //order: [[0, "desc"]],
                columnDefs: [
                    {
                        title: 'Date Created',
                        target: 0,
                        "render": function (data, type, row, meta) {
                            return ' <p>' + row.DateCreated + ' </p> '
                        }
                        //class: "d-none d-sm-table-cell",
                        //"render": function (data, type, row, meta) {
                        //    const date = new Date(row.DateCreated);
                        //    return date.toLocaleDateString('es-pa')
                        //}
                    },
                    {
                        title: 'Written by',
                        target: 1,
                        class: "d-none d-sm-table-cell text-center",
                        "render": function (data, type, row, meta) {
                            return ' <p>' + row.CreatedBy + ' </p> '
                        }
                    },
                    {
                        title: 'Comments',
                        target: 2,
                        "render": function (data, type, row, meta) {
                            return ' <p>' + row.Comment + ' </p> '
                        }
                    },
                    {
                        target: 3,
                        className: 'dt-body-right',
                        "render": function (data, type, row, meta) {
                            return '<div class="btn-group"> ' +
                                '   <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"> ' +
                                ' <i class="fa-solid fa-ellipsis-vertical me-2"></i> Option ' +
                                '             </button> ' +
                                ' <ul class="dropdown-menu">' +
                                ' <li> <a class="dropdown-item comment-view-attachment"' + row.ViewVisible + ' CommentId="' + row.Id + '"> <i class="fa-regular fa-eye"></i> View</a></li> ' +
                                ' <li> <a class="dropdown-item comment-attach"' + row.AttachVisible + ' CommentId="' + row.Id + '"> <i class="fa-solid fa-pen-to-square"></i> Attach</a></li> ' +
                                ' <li> <a class="dropdown-item comment-delete"' + row.DeleteVisible + ' CommentId="' + row.Id + '"> <i class="fa-solid fa-pen-to-square"></i> Delete</a></li> ' +
                                
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
    //----------------------------------END VIEW CONCERN--------------------------------------

    /////////////========================================TABLE EVENTS==============================================================



    //----------------------------------BEGIN ADD COMMENT--------------------------------------
    $('#helpdesk-main-div').on('click', '#add_concern_btn', function (e) {
        e.preventDefault();

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Helpdesk/_AddComment',
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');                
               
                $("#add_concern_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#add_comment_modal').on('click', '#submit-comment-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Helpdesk/_AddConcern',
            type: "POST",
            data: $('#concern-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#add_concern_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Concern successfully created.');
                    ClearTable();
                    BindTable();
                }
            }
        });
    });
    //----------------------------------END ADD COMMENT--------------------------------------

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

