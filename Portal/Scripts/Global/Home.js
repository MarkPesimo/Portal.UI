$(function () {
    $(document).ready(function () {
        $(".navbar-nav").find(".active").removeClass("active");
        $("#nav-Home").addClass("active");
        $("#nav-Home").addClass("bg-primary");

        ShowLoading('HIDE');

        checkAnnouncements();
    });

    $(document).on('click', '.btn-attachment', function (e) {
        var $btn = $(this);
        var announcementId = $btn.data('id');
        var announcementType = $btn.data('type');

        if (announcementType === "All") return;
        if (announcementId) {
            $.ajax({
                url: '/Attendance/MarkAnnouncementAsRead',
                type: 'POST',
                data: { announcementId: announcementId },
                success: function (response) {
                    if (response.Success) {
                        if ($btn.hasClass('btn-mark-read')) {
                            $btn.html('<i class="fa-solid fa-check me-2"></i> COPIED!').prop('disabled', true);
                            $btn.fadeOut(1000, function () {
                                $(this).closest('.mt-3').html('<span class="text-success small fw-bold"><i class="fa-solid fa-circle-check"></i> Acknowledged</span>');
                            });
                        }

                        var currentCount = parseInt($('#announcementCount').text()) || 0;
                        if (currentCount > 0) {
                            $('#announcementCount').text(currentCount - 1);
                        }
                    }
                }
            });
        }
    });

    function checkAnnouncements() {
        $.ajax({
            url: '/Attendance/GetPortalAnnouncements',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data && data.length > 0) {
                    $('#announcementCount').text(data.length);
                    var listContainer = $('#announcementList');
                    listContainer.empty();

                    const statCfg = { 'Announcement': ['fa-bullhorn', '#f43f5e'], 'Information': ['fa-circle-info', '#0ea5e9'] };

                    $.each(data, function (index, item) {
                        const sTxt = item.AnnouncementClass || "Announcement";
                        const tTyp = item.AnnouncementType || "All";
                        const tDisp = tTyp === 'All' ? 'everyone' : `all ${tTyp}s`;
                        const sIco = statCfg[sTxt] || ['fa-tag', '#94a3b8'];
                        const impC = item.AnnouncementImportance === 'High' ? "#ef4444" : (item.AnnouncementImportance === 'Mid' ? "#f59e0b" : "#3b82f6");
                        const bodyId = `body-${item.Id}`;

                        let fIco = 'fa-paperclip';
                        if (item.AttachmentFileType) {
                            const ext = item.AttachmentFileType.toLowerCase().replace('.', '');
                            fIco = ext === 'pdf' ? 'fa-file-pdf' : (['jpg', 'jpeg', 'png'].includes(ext) ? 'fa-file-image' : 'fa-file-word');
                        }

                        const actionNote = item.IsDisappearing ? `<small class="text-muted ms-2" style="font-size:0.7rem;font-style:italic;"><i class="fa-solid fa-info-circle me-1"></i>Hide this announcement from your list.</small>` : '';
                        //<img src="https://asiapeopleworks.com.ph/wp-content/uploads/2021/03/APW_Logo-300x67.png" alt="Cinque Terre" width="1000" height="300">
                        const html = `
                            <div class="announcement-card">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="fa-solid ${sIco[0]}" style="color:${sIco[1]}; font-size:0.9rem;"></i>
                                        <span class="text-muted" style="font-size:0.8rem; font-weight:500;">An ${sTxt} posted for ${tDisp}</span>
                                    </div>
                                    <span style="color:${impC}; font-size:0.75rem;"><i class="fa-solid fa-circle me-1" style="font-size:0.5rem;"></i>${item.AnnouncementImportance}</span>
                                </div>
                                <h5 class="announcement-title">${item.AnnouncementTitle}</h5>
                                <div class="announcement-body-wrapper">
                                
                                    <div id="${bodyId}" class="announcement-body clamped">
                                    
                                        ${item.AnnouncementBody}
                                        
                                    </div>
                                    <a href="javascript:void(0)" class="see-toggle-btn" onclick="toggleBodyText('${bodyId}', this)" style="display:none;">See More</a>
                                </div>
                                ${item.AttachmentFileType ? `
                                <div class="mt-3 pt-2" style="border-top:1px dashed #e2e8f0;">
                                    <div class="d-flex align-items-center">
                                        <a href="/Attendance/ViewAttachment?id=${item.id || item.Id}&fileType=${item.AttachmentFileType}" 
                                           target="_blank" 
                                           class="btn btn-attachment" 
                                           data-id="${item.id || item.Id}" 
                                           data-type="${tTyp}"> 
                                           <i class="fa-solid ${fIco} me-2"></i>OPEN ${item.AttachmentFileType.toUpperCase()}
                                        </a>
                                        ${actionNote}
                                    </div>
                                </div>` : (tTyp !== 'All' ? `
                                <div class="mt-3 pt-2" style="border-top:1px dashed #e2e8f0;">
                                    <div class="d-flex align-items-center">
                                        <button type="button" 
                                                class="btn btn-attachment btn-mark-read" 
                                                style="background-color:#10b981 !important;" 
                                                data-id="${item.id || item.Id}" 
                                                data-type="${tTyp}"> <i class="fa-solid fa-check-double me-2"></i>MARK AS READ
                                        </button>
                                        ${actionNote}
                                    </div>
                                </div>` : '')}
                                <div class="announcement-meta-footer mt-3 pt-3">
                                    <div class="d-flex justify-content-between" style="font-size:0.75rem; color:#64748b;">
                                        <span><i class="fa-regular fa-circle-user me-1"></i>${item.EmployeeName || "Admin"}</span>
                                        <span><i class="fa-regular fa-calendar-check me-1"></i>${formatDate(item.DateCreated)}</span>
                                    </div>
                                </div>
                            </div>`;
                        listContainer.append(html);
                    });

                    var modalEl = document.getElementById('announcementModal');
                    var myModal = new bootstrap.Modal(modalEl);
                    
                    modalEl.addEventListener('shown.bs.modal', function () {
                        $('.announcement-body').each(function () {
                            if (this.scrollHeight > this.clientHeight) {
                                $(this).next('.see-toggle-btn').show();
                            }
                        });
                    }, { once: true });

                    myModal.show();
                }
            }
        });
    }

    function formatDate(dateString) {
        if (!dateString) return "";
        var date = new Date(parseInt(dateString.substr(6))); 
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function ShowLoading(show) {
        var x = document.getElementById("preloader");
        if (show === 'SHOW') { x.style.visibility = ''; }
        else { x.style.visibility = 'hidden'; }
    }
});

function toggleBodyText(id, btn) {
    const el = $(`#${id}`);
    el.toggleClass('clamped');
    if (el.hasClass('clamped')) {
        $(btn).text("See More");
    } else {
        $(btn).text("See Less");
    }
}