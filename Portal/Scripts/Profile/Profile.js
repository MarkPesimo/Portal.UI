$(function () {
    $(document).ready(function () {
        ShowLoading('HIDE');
    });


    $('#div-candidate-header-menu').on('click', '.edit-profile-btn', function (e) {
        e.preventDefault();

        var _id = e.target.id;
        ShowLoading('SHOW');
        $.ajax({
            type: "GET",
            url: '/Profile/_Edit',
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            success: function (response) {
                ShowLoading('HIDE');
                
                $('#edit_profile_modal').find(".modal-body").html(response);
                $("#edit_profile_modal").modal('show');
            },
            failure: function (response) { LogError(response); },
            error: function (response) { LogError(response); }
        });        
    });

    $('#edit_profile_modal').on('click', '#submit-update-profile-button', function (e) {
        ShowLoading('SHOW');
        $.ajax({
            url: '/Profile/_Edit',
            type: "POST",
            data: $('#edit-profile-Form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.Result == "ERROR") { ValidationError(result); }
                else {
                    $("#edit_profile_modal").modal('hide');
                    ShowLoading('HIDE');
                }
            }
        });
        
    });

    $('#div-full-profile-initial').on('click', '.edit-social-btn', function (e) {
        e.preventDefault();

        $("#attach_image_modal").modal('show');
    });

    $('#attach_image_modal').on('click', '#submit-attach-profile-picture-button', function (e) {
        e.preventDefault();

        $file = $("#image_Attachment");
        var $filepath = $.trim($file.val());

        if ($filepath != "") {
            var formData = new FormData();
            var Attachement = $('#image_Attachment')[0].files[0];

            formData.append('Image_Attachement', Attachement);

            $.ajax({
                url: '/Profile/AttachProfilePicture',
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (result) {
                    //console.log(result);
                    if (result == "ERROR") {
                        alert('Error in attaching the file!')
                    }
                }
            });
        }
        location.reload();
 
    });


    function LogError(response) {
        ShowLoading('HIDE');
        console.log(response.responseText);
    }

    function ShowLoading(show) {
        var x = document.getElementById("preloader");
        if (show === 'SHOW') { x.style.visibility = ''; }
        else { x.style.visibility = 'hidden'; }
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
});

