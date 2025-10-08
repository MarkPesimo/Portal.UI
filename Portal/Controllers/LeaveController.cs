using APWModel.ViewModel.Global;
using ClosedXML.Excel;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ClosedXML.Excel;
using Excel = Microsoft.Office.Interop.Excel;
using System.Runtime.InteropServices;

using static APWModel.ViewModel.Portal.Leave_model;

namespace Portal.Controllers
{
    [Authorize]
    public class LeaveController : Controller
    {
        private GlobalRepository _globalrepository { get; set; }
        private LeaveRepository _leaverepository { get; set; }
        private int _loginuserid { get; set; }
        private int _candidate_id { get; set; }
        public int _client_id { get; set; }
        private string _EmployeeName { get; set; }

        private string _LeaveAttendance_Index = "~/Views/Leave/LeaveAttendance_Index.cshtml";
        private string _Leave_Index = "~/Views/Leave/Leave_index.cshtml";

        public LeaveController()
        {
            if (_globalrepository == null) { _globalrepository = new GlobalRepository(); }
            if (_leaverepository == null) { _leaverepository = new LeaveRepository(); }
            if (_loginuserid == 0)
            {
                LoginUser_model _user = _globalrepository.GetLoginUser();
                if (_user != null)
                {
                    _loginuserid = _user.UserId;
                    _candidate_id = _user.CandidateId;
                    _client_id = _user.ClientId;
                    _EmployeeName = _user.EmployeeName;
                }
            }
        }

        [HttpGet]
        public ActionResult Index()
        {
            if (_globalrepository.HasClientAccess(_client_id, "LEAVE")) { return View(_Leave_Index); }
            else { return View("AccessDenied"); }
        }

        [HttpGet]
        public ActionResult _GetLeaveBalance(int _leavetypeid)
        {
            try
            {
                LeaveBalance_model _obj = _leaverepository.GetLeaveBalance(_leavetypeid);
                return Json(new { Status = "SUCCESS", result = _obj, }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = "ERROR", Msg = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult _GetLeaveMonitoringFilter()
        {
            LeaveMonitoringFilter_model _filter = new LeaveMonitoringFilter_model
            {
                EmpId = _loginuserid,
                LeaveTypeId = 1,
            };
            ViewBag._LeaveTypes = _globalrepository.GetLeaveTypes().Select(t => new SelectListItem { Text = t.LeaveType, Value = t.Id.ToString() }).ToList();
            return PartialView("~/Views/Leave/partial/_leave_filter_detail.cshtml", _filter);
        }

        [HttpGet]
        public ActionResult _GetLeaveMonitoring(int _leavetypeid, DateTime _datefrom, DateTime _dateto)
        {
            LeaveMonitoringFilter_model _filter = new LeaveMonitoringFilter_model();
            try
            {
                _filter.EmpId = _loginuserid;
                _filter.LeaveTypeId = _leavetypeid;
                _filter.LeaveFrom = _datefrom;
                _filter.LeaveTo = _dateto;

                List< LeaveMonitoring_model> _obj = _leaverepository.GetLeaveMonitoring(_filter);
                return Json(new { Status = "SUCCESS", result = _obj }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = "ERROR", Msg = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //---------------------------------------BEGIN ADD POST LEAVE---------------------------------------
        [HttpGet]
        public ActionResult _AddPostLeave(DateTime _datelog)
        {
            LeaveModel _model = new LeaveModel
            {
                LeaveFrom = _datelog,
                LeaveTo = _datelog,
                EmpId = _loginuserid,
                UserId = 112,
                Mode = 0,
            };

            ViewBag._LeaveTypes = _globalrepository.GetLeaveTypes().Select(t => new SelectListItem { Text = t.LeaveType, Value = t.Id.ToString() }).ToList();
            return PartialView("~/Views/Attendance/Partial/Leave/_post_leave_detail.cshtml", _model);
        }

        [HttpPost]
        public ActionResult _AddPostLeave(LeaveModel _model)
        {
            try
            {
                if (_model.Remarks == null) { _model.Remarks = ""; }
                if (_model.Message == null) { _model.Message = ""; }

                if (_model.IsHalfday)
                {
                    if (_model.FirstHalf) { _model.LeaveFromAMPM = "AM"; _model.LeaveToAMPM = "AM"; }
                    else if (_model.SecondHalf) { _model.LeaveFromAMPM = "PM"; _model.LeaveToAMPM = "PM"; }
                }
                else
                {
                    if (_model.FirstDay_SecondHalf) { _model.LeaveFromAMPM = "PM"; }
                    else { _model.LeaveFromAMPM = "AM"; }

                    if (_model.LastDay_FirstHalf) { _model.LeaveFromAMPM = "AM"; }
                    else { _model.LeaveFromAMPM = "PM"; }
                }

                if (_model.Mode == 0 || _model.Mode == 1)
                {
                    if (_model.LeaveFrom.Date > _model.LeaveTo.Date)
                    {
                        return Json(new { Result = "ERROR", Message = "The date of leave [from] cannot be ahead to the date of leave [to].", ElementName = "LeaveFrom" });
                    }

                    if (_model.LeaveDays <= 0)
                    {
                        return Json(new { Result = "ERROR", Message = "Leave day(s) cannot be Zero or less than Zero.", ElementName = "LeaveDays" });
                    }

                    if (_model.LeaveFrom.Year > DateTime.Now.Year || _model.LeaveTo.Year > DateTime.Now.Year)
                    {
                        return Json(new { Result = "ERROR", Message = "You can't advance filing for next year.", ElementName = "LeaveFrom" });
                    }

                    //check leave balance
                    LeaveBalance_model _obj = _leaverepository.GetLeaveBalance(_model.LeaveTypeId);
                    if (_obj != null)
                    {
                        if (decimal.Parse(_obj.Balance) <= 0)
                        {
                            return Json(new { Result = "ERROR", Message = "Insufficient leave balance.", ElementName = "LeaveFrom" });
                        }

                        if (decimal.Parse(_model.LeaveDays.ToString()) > decimal.Parse(_obj.Balance))
                        {
                            return Json(new { Result = "ERROR", Message = "Insufficient leave balance.", ElementName = "LeaveFrom" });
                        }
                    }
                }

                if (ModelState.IsValid)
                {
                    int _id = _leaverepository.ManageLeave(_model);

                    _model.Id = _id;
                    _model.Mode = 3;
                    _id = _leaverepository.ManageLeave(_model);

                    return Json(new { Result = "Success", LeaveId = _id });
                }

                List<string> _errors = _globalrepository.GetModelErrors(ModelState);
                return Json(new { Result = "ERROR", Message = _errors[1], ElementName = _errors[0] });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

        //---------------------------------------END ADD LEAVE---------------------------------------

        //---------------------------------------BEGIN ADD LEAVE---------------------------------------
        [HttpGet]
        public ActionResult _AddLeave()
        {
            if (!_globalrepository.HasClientAccess(_client_id, "FILE LEAVE")) { return Json(new { Result = "ACCESS DENIED" }, JsonRequestBehavior.AllowGet); }


            LeaveModel _model = new LeaveModel
            {
                EmpId = _loginuserid,
                UserId = 112,
                Mode = 0,
            };

            ViewBag._LeaveTypes = _globalrepository.GetLeaveTypes().Select(t => new SelectListItem { Text = t.LeaveType, Value = t.Id.ToString() }).ToList();
            return PartialView("~/Views/Leave/Partial/_leave_detail.cshtml", _model);
        }
        //---------------------------------------END ADD LEAVE---------------------------------------

        //---------------------------------------BEGIN EDIT LEAVE---------------------------------------
        [HttpGet]
        public ActionResult _EditLeave(int _id)
        {
            LeaveModel _obj = _leaverepository.GetLeave(_id);
            _obj.Mode = 1;
            _obj.UserId = 112;

            ViewBag._LeaveTypes = _globalrepository.GetLeaveTypes().Select(t => new SelectListItem { Text = t.LeaveType, Value = t.Id.ToString() }).ToList();
            return PartialView("~/Views/Leave/Partial/_leave_detail.cshtml", _obj);
        }
        //---------------------------------------END EDIT LEAVE---------------------------------------

        //---------------------------------------BEGIN POST LEAVE---------------------------------------
        [HttpGet]
        public ActionResult _PostLeave(int _id)
        {
            LeaveModel _obj = _leaverepository.GetLeave(_id);
            _obj.Mode = 3;
            _obj.UserId = 112;
            return PartialView("~/Views/Leave/Partial/_post_detail.cshtml", _obj);
        }
        //---------------------------------------END POST LEAVE---------------------------------------

        //---------------------------------------BEGIN UNPOST LEAVE---------------------------------------
        [HttpGet]
        public ActionResult _UnpostLeave(int _id)
        {
            if (!_globalrepository.HasClientAccess(_client_id, "UNPOST LEAVE")) { return Json(new { Result = "ACCESS DENIED" }, JsonRequestBehavior.AllowGet); }



            LeaveModel _obj = _leaverepository.GetLeave(_id);
            _obj.Mode = 4;
            _obj.UserId = 112;
            return PartialView("~/Views/Leave/Partial/_unpost_detail.cshtml", _obj);
        }
        //---------------------------------------END UNPOST LEAVE---------------------------------------

        //---------------------------------------BEGIN CANCEL LEAVE---------------------------------------
        [HttpGet]
        public ActionResult _CancelLeave(int _id)
        {
            LeaveModel _obj = _leaverepository.GetLeave(_id);
            _obj.Mode = 2;
            _obj.UserId = 112;
            return PartialView("~/Views/Leave/Partial/_cancel_detail.cshtml", _obj);
        }
        //---------------------------------------END CANCEL LEAVE---------------------------------------


        [HttpPost]
        public ActionResult _ManageLeave(LeaveModel _model)
        {
            try
            {
                if (_model.Remarks == null) { _model.Remarks = ""; }
                if (_model.Message == null) { _model.Message = ""; }

                if (_model.IsHalfday)
                {
                    if (_model.FirstHalf) { _model.LeaveFromAMPM = "AM"; _model.LeaveToAMPM = "AM"; }
                    else if (_model.SecondHalf) { _model.LeaveFromAMPM = "PM"; _model.LeaveToAMPM = "PM"; }
                }
                else
                {
                    if (_model.FirstDay_SecondHalf) { _model.LeaveFromAMPM = "PM"; }
                    else { _model.LeaveFromAMPM = "AM"; }

                    if (_model.LastDay_FirstHalf) { _model.LeaveFromAMPM = "AM"; }
                    else { _model.LeaveFromAMPM = "PM"; }
                }

                if (_model.Mode == 0 || _model.Mode == 1)
                {
                    if (_model.LeaveFrom.Date > _model.LeaveTo.Date)
                    {
                        return Json(new { Result = "ERROR", Message = "The date of leave [from] cannot be ahead to the date of leave [to].", ElementName = "LeaveFrom" });
                    }
                 
                    if (_model.LeaveDays <= 0)
                    {
                        return Json(new { Result = "ERROR", Message = "Leave day(s) cannot be Zero or less than Zero.", ElementName = "LeaveDays" });
                    }

                    //check leave balance
                    LeaveBalance_model _obj = _leaverepository.GetLeaveBalance(_model.LeaveTypeId);
                    if (_obj!= null)
                    {
                        if (decimal.Parse( _obj.Balance) <= 0)
                        {
                            return Json(new { Result = "ERROR", Message = "Insufficient leave balance.", ElementName = "LeaveFrom" });
                        }

                        if (decimal.Parse(_model.LeaveDays.ToString()) > decimal.Parse(_obj.Balance))
                        {
                            return Json(new { Result = "ERROR", Message = "Insufficient leave balance.", ElementName = "LeaveFrom" });
                        }
                    }
                }

                if (ModelState.IsValid)
                {
                    if (_model.Mode == 3) { GenerateLeaveForm(_model.Id); }

                    int _id = _leaverepository.ManageLeave(_model);
                    return Json(new { Result = "Success", LeaveId = _id });
                }

                List<string> _errors = _globalrepository.GetModelErrors(ModelState);
                return Json(new { Result = "ERROR", Message = _errors[1], ElementName = _errors[0] });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    Result = "ERROR",
                    Message = ex.InnerException != null ? ex.InnerException.Message : ex.Message
                });
            }
        }

        [HttpPost]
        public ActionResult GenerateLeaveForm(int id)
        {
            try
            {
                LeaveModel leave = _leaverepository.GetLeave(id);
                if (leave == null)
                    return Json(new { Result = "ERROR", Message = "Leave record not found." });

                string guid = leave.guid.ToString();

                string templatePath = Server.MapPath("~/LeaveAttachments/Leave_Notification_Form_Template.xlsx");
                if (!System.IO.File.Exists(templatePath))
                    return Json(new { Result = "ERROR", Message = "Template not found." });

                string baseFolder = Server.MapPath("~/LeaveAttachments/LeaveFormsGenerated/Posted/");
                if (!Directory.Exists(baseFolder)) Directory.CreateDirectory(baseFolder);

                string guidFolder = Path.Combine(baseFolder, leave.guid.ToString());
                if (!Directory.Exists(guidFolder)) Directory.CreateDirectory(guidFolder);

                string outputPdf = Path.Combine(guidFolder, leave.guid + ".pdf");
                
                using (XLWorkbook wb = new XLWorkbook(templatePath))
                {
                    var ws = wb.Worksheet(1);

                    ws.Cell("G7").Value = leave.DateFiled.ToString("MM/dd/yyyy");
                    ws.Cell("D9").Value = leave.EmpName;
                    ws.Cell("D10").Value = leave.ClientName;
                    switch (leave.LeaveTypeId)
                    {
                        case 1:
                            ws.Cell("D12").Value = "Sick Leave";
                            break;
                        case 2:
                            ws.Cell("D12").Value = leave.EmergencyLeave
                                ? "Vacation Leave (Emergency Leave)"
                                : "Vacation Leave";
                            break;
                        case 3:
                            ws.Cell("D12").Value = "Emergency Leave";
                            break;
                        case 4:
                            ws.Cell("D12").Value = "Maternity Leave";
                            break;
                        case 5:
                            ws.Cell("D12").Value = "Paternity Leave";
                            break;
                    }

                    ws.Cell("D13").Value = leave.LeaveFrom.ToString("MM/dd/yyyy");
                    ws.Cell("D14").Value = leave.LeaveTo.ToString("MM/dd/yyyy");
                    ws.Cell("D15").Value = leave.LeaveDays;
                    ws.Cell("D17").Value = leave.Reason;


                    ws.Cell("B25").Value = _EmployeeName;

                    using (var ms = new MemoryStream())
                    {
                        // --- QR Code Embedding ---
                        using (var client = new System.Net.WebClient())
                        {
                            string _url = PortalConstant.RootPath + "_PreviewLeaveForm";

                            //string baseUrl = "http://localhost:50393/Leave/_PreviewPostedLeaveForm";
                            string baseUrl = _url;
                            string qrText = baseUrl + "?_guid=" + guid;

                            string qrUrl = "https://quickchart.io/qr?text=" +
                                           Uri.EscapeDataString(qrText) +
                                           "&dark=950808&light=ffffff";

                            byte[] qrBytes = client.DownloadData(qrUrl);

                            using (var qrStream = new MemoryStream(qrBytes))
                            {
                                var picture = ws.AddPicture(qrStream)
                                                .MoveTo(ws.Cell("B35"))
                                                .Scale(1.2);
                            }
                        }
                        // -------------------------

                        wb.SaveAs(ms);
                        ms.Position = 0;
                        
                        string tempPath = Path.GetTempFileName() + ".xlsx";
                        System.IO.File.WriteAllBytes(tempPath, ms.ToArray());

                        Excel.Application excelApp = new Excel.Application();
                        excelApp.Visible = false;
                        Excel.Workbook excelWorkbook = excelApp.Workbooks.Open(tempPath);

                        try
                        {
                            excelWorkbook.ExportAsFixedFormat(
                                Excel.XlFixedFormatType.xlTypePDF,
                                outputPdf
                            );
                        }
                        finally
                        {
                            excelWorkbook.Close(false);
                            excelApp.Quit();

                            Marshal.ReleaseComObject(excelWorkbook);
                            Marshal.ReleaseComObject(excelApp);
                            
                            if (System.IO.File.Exists(tempPath))
                                System.IO.File.Delete(tempPath);
                        }
                    }
                }

                return Json(new
                {
                    Result = "SUCCESS",
                    FilePath = "/LeaveAttachments/LeaveFormsGenerated/Posted/" + leave.guid + "/" + leave.guid + ".pdf"
                });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

        [HttpGet]
        public ActionResult _PreviewPostedLeaveForm(string _guid)
        {
            string approvedBaseFolder = Server.MapPath($"~/LeaveAttachments/LeaveFormsGenerated/Posted/{_guid}/{_guid}.pdf");

            if (!System.IO.File.Exists(approvedBaseFolder))
            {
                return HttpNotFound("PDF file not found.");
            }

            return File(approvedBaseFolder, "application/pdf");
        }


        [HttpPost]
        public ActionResult _LeaveAttachment(int _id, HttpPostedFileBase Leave_Attachment)
        {
            try
            {
                string _fileextension = _globalrepository.GetExtension(Leave_Attachment);
                int _mode = 91;

                LeaveModel _model = new LeaveModel();
                _model.Id = _id;

                _model.EmpId = _loginuserid;
                _model.LeaveTypeId = 0;
                _model.DateFiled = DateTime.Now;

                _model.LeaveFrom = DateTime.Now;

                _model.LeaveFromAMPM = _fileextension;

                _model.LeaveTo = DateTime.Now;
                _model.LeaveToAMPM = "PM";
                _model.LeaveDays = 1;
                _model.IsHalfday = false;
                _model.FirstHalf = false;
                _model.SecondHalf = false;
                _model.FirstDay_SecondHalf = false;
                _model.LastDay_FirstHalf = false;
                _model.Reason = "";
                _model.Remarks = "";
                _model.Mode = _mode;
                _model.Message = "";
                _model.UserId = 112;


                _id = _leaverepository.ManageLeave(_model);
                //update table for the file extension 

                //check if candidate id folder already exist, if not create a folder
                //string _check_foloder = Path.Combine(Server.MapPath("~/LeaveAttachments/Filing/" + _id.ToString()), "");
                //if (Directory.Exists(_check_foloder) == false) { Directory.CreateDirectory(_check_foloder); }


                var path = Path.Combine(Server.MapPath("~/LeaveAttachments/Filing/" + _id.ToString() + _fileextension));

                if (System.IO.File.Exists(path)) { System.IO.File.Delete(path); }

                Leave_Attachment.SaveAs(path);
                //attached procedure ends here------------------------------------------------------------------------------

                return Json(new { Result = "Success" });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

        [HttpGet]
        public ActionResult _OpenLeaveFile(int _fileid, string _extension)
        {
            LeaveModel _model = new LeaveModel
            {
                Id = _fileid,
                FileExtension = _extension
            };

            return PartialView("~/Views/Leave/partial/_view_attachment.cshtml", _model);
        }

        [HttpGet]
        public JsonResult GetComputedFiledLeaveDays(DateTime d1, DateTime d2, bool isFirstDayHalf, bool isLastDayHalf)
        {
            try
            {
                var result = _leaverepository.GetComputedFiledLeaveDays(d1, d2, isFirstDayHalf, isLastDayHalf);
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}