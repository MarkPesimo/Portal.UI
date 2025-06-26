$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-Help").addClass("active");
        $("#nav-Help").addClass("bg-primary");

        ShowLoading('HIDE');

        $("#help-table").DataTable(
            {
                autoWidth: false,
                bLengthChange: true,
                order: [[0, "asc"]],
                //columns: [
                //    { 'data': 'SortNo' },
                //    { 'data': 'Description' },
                //    { 'data': 'ModuleName' }, 
                //],
                //coldecolumnDefs: [
                //    {
                //        target: 1,
                //        visible : false,
                //    },
                //    //{
                //    //    title: 'MOD NAME',
                //    //    target: 1,
                //    //    //class: "d-none d-sm-table-cell text-center",
                //    //    visible: false
                        
                //    //},
                //],
            }
        );
        
        $('.dataTables_length').addClass('bs-select ms-2 mt-2');
        $('.dataTables_filter').addClass('me-2 mb-1 mt-2');
        $('.dataTables_paginate').addClass('mt-2 mb-2');
        $('.dataTables_info').addClass('ms-2 mt-2 mb-2');
        $('.sorting').addClass('bg-primary text-white');

        var dt = $('#help-table').DataTable();
        //hide the first column
        //dt.column(0).visible(false);
        dt.column(2).visible(false);
    });

    $('#help-table').on('click', '.preview-button', function (e) {
        e.preventDefault();

        //alert('clicked');

        var _id = $(this).attr("_id");
        var _description = $(this).attr("_description");
        var _filename = $(this).attr("_filename"); 
        var _modulename = $(this).attr("_modulename");

        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Help/Preview',
            data: {
                '_id': _id ,
                '_description': _description,
                '_filename': _filename,
                '_modulename': _modulename
            },
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                $('#preview_help_modal').find(".modal-body").html(response);
                $("#preview_help_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });

        
        
    });

    $('#preview_help_modal').on('hidden.bs.modal', function () {
        // do something…
        //alert('test');
        $('#preview_help_modal').find(".modal-body").html('');
    })

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