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


        document.getElementById("correction_from").value = curr_year + "-" + curr_month + "-01"; // 
        document.getElementById("correction_to").value = curr_year + "-12-31"; 

        ShowLoading('HIDE');
        BindTable();
    });

    //----------------------------------BEGIN TABLE----------------------------------------------
    function ClearTable(tablename) {
        var table = $(tablename).DataTable();
        table.destroy();
        $(tablename).empty();
    };

    $("#show_correction_filter_btn").click(function (e) {
        e.preventDefault();

        $('#filter_correction_modal').modal('show');
    });

    $('#filter_correction_modal').on('click', '#filter_correction', function (e) {
        BindTable();
    });

    function BindTable() {
        var FromDate = document.getElementById("correction_from").value;
        var ToDate = document.getElementById("correction_to").value;

        var e_status = document.getElementById("Correction-status");
        var Status = e_status.value;

        if (Status == "") { Status = "All"; }

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Attendance/GetAttendanceCorrectionList",
            data: {
                '_fromdate': FromDate,
                '_todate': ToDate,
                '_status': Status
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                ShowLoading('HIDE');
                ClearTable("#correction-table");
                DisplayRecords(response);
                $('#filter_correction_modal').modal('hide');
            },
            failure: function (response) { console.log(response); },
            error: function (response) { console.log(response); }
        });
    };

    function DisplayRecords(response) {
        $("#correction-table").DataTable(
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
                    { 'data': 'DateLog' },
                    { 'data': 'ShiftDescription' },
                    { 'data': 'TimeIn' },
                    { 'data': 'Reason' },
                    
                    
                    { 'data': 'Status' },
                    { 'data': 'Remarks' },
                    { 'data': 'Status' },
                ],
                order: [[1, "desc"]],
                columnDefs: [
                    {
                        title: 'Date of Correction',
                        target: 0,
                        class: "d-none d-sm-table-cell text-center",
                    },
                    {
                        title: 'Date Log',
                        target: 1,
                        class: "d-none d-sm-table-cell",
                        "render": function (data, type, row, meta) {
                            const date = new Date(row.DateLog);
                            return ' <strong class="text-primary">' + date.toLocaleDateString('es-pa') + ' </strong> '
                        }
                    },
                    {
                        title: 'Shift',
                        target: 2,
                        class: "d-none d-sm-table-cell",
                    },
                    {
                        title: 'Time In/Out',
                        target: 3,
                        class: "d-none d-sm-table-cell",
                        "render": function (data, type, row, meta) {
                            const date = new Date(row.DateLog);
                            return '<small class="d-block">' + row.TimeIn + ' </small> ' +
                                ' <small class="d-block">' + row.TimeOut + ' </small> '
                        }
                    },
                    {
                        title: 'Reason',
                        target: 4,
                        class: "d-none d-sm-table-cell",
                    },
                    {
                        title: 'Status',
                        class: "d-none d-sm-table-cell text-center",
                        target: 5,
                        "render": function (data, type, row, meta) {
                            return SetTableBGColor(row.Status)
                        }
                    },
                    {
                        title: 'Remarks',
                        target: 6,
                        class: "d-none d-sm-table-cell",
                    },
            
                               
                    {
                        title: 'Details',
                        class: "d-xs-block d-sm-none d-m-none d-lg-none",
                        target: 7,
                        "render": function (data, type, row, meta) {
                            const date = new Date(row.DateLog);
                            return '<small class="d-block"> Date log : <strong class="text-primary"> ' + row.DateLog + '</strong> </small>  ' +
                                '<small class="d-block">Time In : ' + row.TimeIn + '</small> ' +
                                '<small class="d-block">Time Out : ' + row.TimeOut + '</small> ' +
                                '<small class="d-block">Reason : ' + row.Reason + '</small> ' +
                                SetTableBGColor(row.Status)

                        }
                    },
                    {
                        target: 8,
                        className: 'dt-body-right',
                        "render": function (data, type, row, meta) {
                            return '<div class="btn-group"> ' +
                                '   <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"> ' +
                                ' <i class="fa-solid fa-ellipsis-vertical me-2"></i> Option ' +
                                '             </button> ' +
                                ' <ul class="dropdown-menu">' +
                                ' <li> <a class="dropdown-item edit-correction"' + row.EditVisible + ' Correctionid="' + row.Id + '" guid="' + row.CorrectionGUID + '"> <i class="fa-solid fa-pen-to-square"></i> Edit</a></li> ' +
                                ' <li> <a class="dropdown-item post-correction"' + row.PostVisible + ' Correctionid="' + row.Id + '" guid="' + row.CorrectionGUID + '"> <i class="fa-solid fa-thumbtack"></i> Post</a></li> ' +
                                ' <li> <a class="dropdown-item unpost-correction"' + row.UnpostVisible + ' Correctionid="' + row.Id + '" guid="' + row.CorrectionGUID + '"> <i class="fa-solid fa-rotate-left"></i> Unpost</a></li> ' +
                                ' <li> <a class="dropdown-item print-correction"' + row.PrintVisible + ' Correctionid="' + row.Id + '" guid="' + row.CorrectionGUID + '"> <i class="fa-solid fa-print"></i> Print</a></li> ' +
                                ' <li> <a class="dropdown-item cancel-correction"' + row.CancelVisible + ' Correctionid="' + row.Id + '" guid="' + row.CorrectionGUID + '"> <i class="fa-solid fa-ban"></i> Cancel</a></li> ' +
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

    function SetTableBGColor(_status) {
        var _font_color = 'white';
        var _color = '#6C757D';
        if (_status == 'Posted') { _color = '#5cb85c'; }
        else if (_status == "Approved") { _color = '#0275d8'; }
        else if (_status == "Attached to DTR") { _color = '#0275d8'; }
        else if (_status == "Cancelled") { _color = '#d9534f'; }
        else if (_status == "Rejected") { _color = '#c94D3B'; }
        else { _font_color = 'black'; }

        //return '<a href="#" class="mt-2 btn btn-sm " style="background : ' + _color + ';border-radius:10%; color: ' + _font_color + '"> ' + _status + '</a>'
        return '<span class="badge rounded-pill "  style="background : ' + _color + '">' + _status + '</span>'
    };
    //----------------------------------END TABLE----------------------------------------------

    //----------------------------------BEGIN ADD CORRECTION-----------------------------------
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

                var _modal = '#add_correction_modal';
                var _form = '#attendance-correction-Form';
                document.querySelector(_modal).querySelector(_form).querySelector("#DateLog").addEventListener("change", ChangeDateLogAdd);

                ChangeDateLogAdd();
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    function ChangeDateLogAdd() {
        var _modal = '#add_correction_modal';
        var _form = '#attendance-correction-Form';
        var _datelog = document.querySelector(_modal).querySelector(_form).querySelector("#DateLog").value

        document.querySelector(_modal).querySelector(_form).querySelector("#TimeInDate").value = _datelog;
        document.querySelector(_modal).querySelector(_form).querySelector("#TimeOutDate").value = _datelog;
    };

    function ChangeDateLogEdit() {
        var _modal = '#edit_correction_modal';
        var _form = '#attendance-correction-Form';
        var _datelog = document.querySelector(_modal).querySelector(_form).querySelector("#DateLog").value

        document.querySelector(_modal).querySelector(_form).querySelector("#TimeInDate").value = _datelog;
        document.querySelector(_modal).querySelector(_form).querySelector("#TimeOutDate").value = _datelog;
    };


    $('#add_correction_modal').on('click', '#submit_correction', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Attendance/_AddCorrection',
            type: "POST",
            data: $('#attendance-correction-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#add_correction_modal").modal('hide');


                    $file = $("#Correction_Attachment");
                    var $filepath = $.trim($file.val());

                    if ($filepath != "") {
                        CorrectionAttachment(result.CorrectionId, 'Attendance correction successfully created.')
                        return;
                    }



                    ShowLoading('HIDE');
                    ShowSuccessMessage('Attendance correction successfully created.');

                    BindTable();
                }
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });
    //----------------------------------END ADD CORRECTION-----------------------------------

    //----------------------------------BEGIN EDIT CORRECTION--------------------------------------
    $('#correction-table').on('click', '.edit-correction', function () {
        var CorrectionId = $(this).attr("Correctionid");
        //alert(CorrectionId);
        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_EditCorrection',
            data: { '_id': CorrectionId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#edit_correction_modal').find(".modal-body").html(response);
                $("#edit_correction_modal").modal('show');

                var _form = '#attendance-correction-Form';
                document.querySelector(_form).querySelector("#DateLog").addEventListener("change", ChangeDateLogEdit);
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    function ChangeDateLogEdit() {
        var _form = '#attendance-correction-Form';
        var _datelog = document.querySelector(_form).querySelector("#DateLog").value

        document.querySelector(_form).querySelector("#TimeInDate").value = _datelog;
        document.querySelector(_form).querySelector("#TimeOutDate").value = _datelog;
    };

    $('#edit_correction_modal').on('click', '#update_correction', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Attendance/_EditCorrection',
            type: "POST",
            data: $('#edit-attendance-correction-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#edit_correction_modal").modal('hide');

                    $file = $("#Edit_Correction_Attachment");
                    var $filepath = $.trim($file.val());

                    if ($filepath != "") {
                        CorrectionEditAttachment(result.CorrectionId, 'Attendance correction successfully updated.')
                        return;
                    }


                    ShowLoading('HIDE');
                    ShowSuccessMessage('Attendance Correction successfully updated.');
                    BindTable();
                }
            }
        });
    });

    $('#edit_correction_modal').on('click', '#view_attached_btn', function () {
        var _fileid = document.querySelector('#edit-attendance-correction-Form').querySelector("#Id").value;
        var _extension = document.querySelector('#edit-attendance-correction-Form').querySelector("#FileExtension").value;
 
        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: "/Attendance/_OpenCorrectionFile",
            data: {
                '_fileid': _fileid,
                '_extension': _extension,
            },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $("#open_correction_file_modal").find(".modal-body").html(response);
                $("#open_correction_file_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });
    //----------------------------------END EDIT CORRECTION--------------------------------------

    //----------------------------------BEGIN POST CORRECTION--------------------------------------
    $('#correction-table').on('click', '.post-correction', function () {
        var CorrectionId = $(this).attr("Correctionid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_PostCorrection',
            data: { '_id': CorrectionId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#post_correction_modal').find(".modal-body").html(response);
                $("#post_correction_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#post_correction_modal').on('click', '#post_correction', function (e) {

        ShowLoading('SHOW');
        $.ajax({
            url: '/Attendance/_PostCorrection',
            type: "POST",
            data: $('#post-correction-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#post_correction_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Attendance Correction successfully Posted.');

                    //$.post('/Attendance/GenerateAttendanceCorrectionForm', { _id: result.Id }, function (genResult) {
                    //    if (genResult.Result === "SUCCESS") {
                    //        console.log("Correction form saved: " + genResult.FilePath);
                    //    } else {
                    //        console.error("Correction form generation failed: " + genResult.Message);
                    //    }
                    //});
                    BindTable();
                }
            }
        });
    });
    //----------------------------------END POST CORRECTION--------------------------------------

    //----------------------------------END PRINT CORRECTION--------------------------------------
    $('#correction-table').on('click', '.print-correction', function () {
        var guid = $(this).attr("guid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_PreviewCorrection',
            data: { '_guid': guid },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#preview_correction_modal').find(".modal-body").html(response);
                $("#preview_correction_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });
    //----------------------------------END PRINT CORRECTION--------------------------------------

    //----------------------------------BEGIN UNPOST CORRECTION--------------------------------------
    $('#correction-table').on('click', '.unpost-correction', function () {
        var CorrectionId = $(this).attr("Correctionid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_UnpostCorrection',
            data: { '_id': CorrectionId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#unpost_correction_modal').find(".modal-body").html(response);
                $("#unpost_correction_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#unpost_correction_modal').on('click', '#unpost_correction', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Attendance/_UnpostCorrection',
            type: "POST",
            data: $('#unpost-correction-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#unpost_correction_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Attendance Correction successfully Unposted.');
                    BindTable();
                }
            }
        });
    });
    //----------------------------------END UNPOST CORRECTION--------------------------------------

    //----------------------------------BEGIN CANCEL CORRECTION--------------------------------------
    $('#correction-table').on('click', '.cancel-correction', function () {
        var CorrectionId = $(this).attr("Correctionid");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Attendance/_CancelCorrection',
            data: { '_id': CorrectionId },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#cancel_correction_modal').find(".modal-body").html(response);
                $("#cancel_correction_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });
    });

    $('#cancel_correction_modal').on('click', '#cancel_correction', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Attendance/_CancelCorrection',
            type: "POST",
            data: $('#cancel-correction-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#cancel_correction_modal").modal('hide');

                    ShowLoading('HIDE');
                    ShowSuccessMessage('Attendance Correction successfully Cancelled.');
                    BindTable();
                }
            }
        });
    });
    //----------------------------------END CANCEL CORRECTION--------------------------------------



    function CorrectionAttachment(_id, _msg) {

        var formData = new FormData();
        var _Attachement = $('#Correction_Attachment')[0].files[0];

        formData.append('_id', _id);
        formData.append('Correction_Attachment', _Attachement);

        $.ajax({
            url: '/Attendance/_CorrectionAttachment',
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result == "ERROR") {
                    ShowLoading('HIDE');
                    alert('Error in attaching the ' + $file + ' file!')
                }
                else {
                    //ClearTable('#correction-table');
                    
                    BindTable();                    
                    ShowSuccessMessage(_msg);
                    ShowLoading('HIDE');
                }
            }
        });

    }


    function CorrectionEditAttachment(_id, _msg) {

        var formData = new FormData();
        var _Attachement = $('#Edit_Correction_Attachment')[0].files[0];

        formData.append('_id', _id);
        formData.append('Correction_Attachment', _Attachement);

        $.ajax({
            url: '/Attendance/_CorrectionAttachment',
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result == "ERROR") {
                    ShowLoading('HIDE');
                    alert('Error in attaching the ' + $file + ' file!')
                }
                else {
                    //ClearTable('#correction-table');

                    BindTable();
                    ShowSuccessMessage(_msg);
                    ShowLoading('HIDE');
                }
            }
        });

    }

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
