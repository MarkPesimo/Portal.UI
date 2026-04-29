$(function () {
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    var formatDate = function (d) {
        return d.getFullYear() + "-" +
            ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
            ("0" + d.getDate()).slice(-2);
    };

    $("#dtFrom").val(formatDate(firstDay));
    $("#dtTo").val(formatDate(lastDay));
    
    loadShiftDeptList();

    $("#btnFilter").click(function () {
        loadShiftDeptList();
    });

    function loadShiftDeptList() {
        var _from = $("#dtFrom").val();
        var _to = $("#dtTo").val();

        $.ajax({
            url: '/Attendance/GetAttendanceData',
            type: 'GET',
            data: { _fromdate: _from, _todate: _to },
            beforeSend: function () {
                $("#tblShiftDept tbody").html('<tr><td colspan="6" class="text-center p-4"><i class="fa fa-spinner fa-spin mr-2"></i>Loading records...</td></tr>');
            },
            success: function (data) {
                var html = "";
                $("#tblShiftDept tbody").empty();

                if (data.length > 0) {
                    $.each(data, function (i, x) {
                        var actionHtml = "";
                        if (x.DTRId == 0 || x.DTRId == null) {
                            actionHtml = "<button class='btn btn-link btn-sm text-primary p-0 btn-update' title='Update Shift/Dept'>" +
                                "<i class='fa fa-edit'></i> Update" +
                                "</button>";
                        } else {
                            actionHtml = "<span class='text-muted small'><i class='fa fa-lock'></i> Locked</span>";
                        }

                        html += "<tr>" +
                            "<input type='hidden' class='row-id' value='" + x.Id + "' />" +
                            "<input type='hidden' class='dept-id' value='" + x.Departmentid + "' />" +
                            "<input type='hidden' class='shift-id' value='" + x.ShiftId + "' />" +
                            
                            "<td><span class='text-date'>" + x.DateLog + "</span></td>" +
                            
                            "<td>" +
                            (x.TimeIn ?
                                "<span class='time-highlight-in'><i class='fa fa-sign-in time-icon'></i>" + x.TimeIn + "</span>" :
                                "<span class='text-muted italic small'> - </span>") +
                            "</td>" +
                            
                            "<td>" +
                            (x.TimeOut ?
                                "<span class='time-highlight-out'><i class='fa fa-sign-out time-icon'></i>" + x.TimeOut + "</span>" :
                                "<span class='text-muted italic small'> - </span>") +
                            "</td>" +
                            
                            "<td><span class='badge-soft-primary'>" + x.Department + "</span></td>" +
                            "<td><span class='badge-soft-secondary'>" + x.ShiftDescription + "</span></td>" +
                            
                            "<td class='text-center'>" + actionHtml + "</td>" +
                            "</tr>";
                    });
                } else {
                    html = '<tr><td colspan="6" class="text-center p-4 text-muted small">No records found for the selected range.</td></tr>';
                }

                $("#tblShiftDept tbody").append(html);
            },
            error: function (err) {
                console.error("Error loading attendance data:", err);
                $("#tblShiftDept tbody").html('<tr><td colspan="6" class="text-center text-danger p-4">Error loading data. Please try again.</td></tr>');
            }
        });
    }

    $(document).on('click', '.btn-update', function () {
        var row = $(this).closest('tr');

        var id = row.find('.row-id').val();
        var date = row.find('.text-date').text();
        var currentDeptId = row.find('.dept-id').val();
        var currentShiftId = row.find('.shift-id').val();
        
        var deptName = row.find('td:nth-child(7)').text();  
        var shiftName = row.find('td:nth-child(8)').text(); 

        $('#updId').val(id);
        $('#updDate').val(date);
        
        $('#currentAssignmentLabel').html(
            '<i class="fa fa-clock mr-1"></i> ' + shiftName +
            ' <span class="mx-2">|</span> ' +
            '<i class="fa fa-sitemap mr-1"></i> ' + deptName
        );

        loadDropdown("/Attendance/GetShiftListJson", "#ddlShift", currentShiftId);
        loadDropdown("/Attendance/GetDepartmentListJson", "#ddlDept", currentDeptId);

        $('#modalUpdateAttendance').modal('show');
    });

    function loadDropdown(url, selector, selectedId) {
        $.ajax({
            url: url,
            type: 'GET',
            success: function (data) {
                var items = '<option value="">-- Select --</option>';
                $.each(data, function (i, x) {
                    var id = x.ShiftId || x.DepartmentId;
                    var text = x.ShiftDescription || x.DepartmentName;
                    items += "<option value='" + id + "'>" + text + "</option>";
                });
                $(selector).html(items).val(selectedId);
            }
        });
    }

    $('#btnSaveUpdate').click(function () {
        var model = {
            Id: $('#updId').val(),
            ShiftId: $('#ddlShift').val(),
            Departmentid: $('#ddlDept').val()
        };
        
        if (!model.ShiftId || !model.Departmentid) {
            alert("Please select both a Shift and a Department.");
            return;
        }

        $.ajax({
            url: '/Attendance/ManageShiftDepartmentUI',
            type: 'POST',
            data: JSON.stringify(model),
            contentType: 'application/json; charset=utf-8',
            beforeSend: function () {
            },
            success: function (status) {
                if (status > 0) {
                    $('#modalUpdateAttendance').modal('hide');
                    
                    loadShiftDeptList();
                    
                    ShowSuccessMessage("Attendance record updated successfully!");
                } else {
                    alert("Update failed. The record might be locked or the database is unavailable.");
                }
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                alert("An error occurred. Please try again.");
            }
        });
    });

    $(document).on('click', '[data-dismiss="modal"]', function () {
        $('#modalUpdateAttendance').modal('hide');
    });
});