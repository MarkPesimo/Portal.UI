using APWModel.ViewModel.Global;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using static APWModel.ViewModel.Portal.Attendance_model;
using static APWModel.ViewModel.Portal.DTR_model;
using System.Runtime.InteropServices;
using ClosedXML.Excel;
using Excel = Microsoft.Office.Interop.Excel;
using System.IO;
using static APWModel.ViewModel.Portal.DTR_model.DTRmodel;
using System.Globalization;

namespace Portal.Controllers
{
    [Authorize]
    public class AttendanceController : Controller
    {
        private GlobalRepository _globalrepository { get; set; }
        private AttendanceRepository _attendancerepository { get; set; }
        private int _loginuserid { get; set; }
        private int _candidate_id { get; set; }
        private int _client_id { get; set; }
        private string _EmployeeName { get; set; }

        private string _Attendance_Index = "~/Views/Attendance/Attendance_index.cshtml";
        private string _ClockInOut = "~/Views/Attendance/ClockInOut.cshtml";
        private string _Correction = "~/Views/Attendance/Correction.cshtml";
        private string _DTR = "~/Views/Attendance/DTR.cshtml";

        public AttendanceController()
        {
            if (_globalrepository == null) { _globalrepository = new GlobalRepository(); }
            if (_attendancerepository == null) { _attendancerepository = new AttendanceRepository(); }
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
            if (!_globalrepository.HasClientAccess(_client_id, "ATTENDANCE")) { return View("AccessDenied"); }
            return View(_Attendance_Index);
        }

        [HttpGet]
        public ActionResult ClockInOut()
        {
            if (!_globalrepository.HasClientAccess(_client_id, "CLOCK IN AND OUT")) { return View("AccessDenied"); }
            return View(_ClockInOut);
        }

        [HttpGet]
        public ActionResult Correction()
        {
            if (!_globalrepository.HasClientAccess(_client_id, "ATTENDANCE CORRECTION")) { return View("AccessDenied"); }                    
            return View(_Correction); 
        }

        [HttpGet]
        public ActionResult DTR()
        {
            if (!_globalrepository.HasClientAccess(_client_id, "DTR SUBMISSION")) { return View("AccessDenied"); }
            return View(_DTR); 
        }


        //---------------------------------BEGIN CLOCK IN & OUT----------------------------------
        public ActionResult GetClockInClockOutList(DateTime _fromdate, DateTime _todate)
        {
            try
            {
                List<ClockInOutList_model> _obj = _attendancerepository.GetClockInOut(_fromdate, _todate);
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public ActionResult GetPreviousClockIn()
        {
            bool WithPrevious = false;
            try
            {
                if (!_globalrepository.HasClientAccess(_client_id, "CLOCK OUT"))
                {
                    return Json(new { Status = "DENIED", result = "Sorry, This feature is not supported by your assigned client. Please contact your friendly neighborhood System Administrator." }, JsonRequestBehavior.AllowGet);
                }

                
                AttendanceToday_model _obj = _attendancerepository.GetPortalPreviousClockIn();
                if (_obj != null)
                {
                    if (_obj.Id == 0) { WithPrevious = false; }
                    else { WithPrevious = true; }
                    
                }

                return Json(new { Status = "SUCCESS", result = _obj, WithPrevious = WithPrevious }, JsonRequestBehavior.AllowGet);                
            }
            catch (Exception ex)
            {
                return Json(new { Status = "FAILED", result = false, msg = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult ClockIn(int _id, int _shiftid, string _latitude, string _longitude)
        {
            try
            {
                if (!_globalrepository.HasClientAccess(_client_id, "CLOCK IN"))
                {
                    return Json(new { Status = "DENIED", result = "Sorry, This feature is not supported by your assigned client. Please contact your friendly neighborhood System Administrator." }, JsonRequestBehavior.AllowGet);
                }
                
                ClockInClockOut_model _obj = new ClockInClockOut_model
                {
                    Id = _id,
                    EmpID = _loginuserid,
                    Type = "CLOCK-IN",
                    ShiftId = _shiftid,
                    Latitude = _latitude,
                    Longitude = _longitude
                };

                bool _result = _attendancerepository.ClockInClockOut(_obj);
                return Json(new { Status = "SUCCESS", result = _result }, JsonRequestBehavior.AllowGet);                                                   
            }
            catch (Exception ex)
            {
                return Json(new { Status = "FAILED", result = false, msg = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult ClockOut(int _id, int _shiftid, string _latitude, string _longitude)
        {
            try
            {
                if (!_globalrepository.HasClientAccess(_client_id, "CLOCK OUT"))
                {
                    return Json(new { Status = "DENIED", result = "Sorry, This feature is not supported by your assigned client. Please contact your friendly neighborhood System Administrator." }, JsonRequestBehavior.AllowGet);
                }

                ClockInClockOut_model _obj = new ClockInClockOut_model
                {
                    Id = _id,
                    EmpID = _loginuserid,
                    Type = "CLOCK-OUT",
                    ShiftId = _shiftid,
                    Latitude = _latitude,
                    Longitude = _longitude
                };

                bool _result = _attendancerepository.ClockInClockOut(_obj);
                return Json(new { Status = "SUCCESS", result = _result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = "ERROR", result = false, msg = ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        public ActionResult GetClockInClockOut()
        {
            try
            {
                AttendanceToday_model _obj = _attendancerepository.GetPortalClockInOut();
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        //---------------------------------END CLOCK IN & OUT----------------------------------

        //=======================================BEGIN ATTENDANCE CORRECTION==============================
        [HttpGet]
        public ActionResult GetAttendanceCorrectionList(DateTime _fromdate, DateTime _todate, string _status)
        {
            try
            {
                List<CorrectionList_model> _obj = _attendancerepository.GetAttendanceCorrectionList(_fromdate, _todate, _status);
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        public ActionResult GetAttendanceCorrection(int _id)
        {
            try
            {
                Correction_model _obj = _attendancerepository.GetAttendanceCorrection(_id);
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        //---------------------------------------BEGIN ADD POST ATTENDANCE CORRECTION---------------------------------------
        [HttpGet]
        public ActionResult _AddPostCorrection(DateTime _datelog)
        {
            Correction_model _model = new Correction_model
            {
                DateLog = _datelog,
                EmpId = _loginuserid,
                UserId = 112
            };

            DefaultShift _defaultshift = _attendancerepository.GetDefaultShift();
            if (_defaultshift != null)
            {
                _model.ShiftId = _defaultshift.ShiftId;
                _model.TimeInDate = _defaultshift.TimeInDate;
                _model.TimeInTime = _defaultshift.TimeInDate;
                _model.TimeOutDate = _defaultshift.TimeOutDate;
                _model.TimeOutDate = _defaultshift.TimeOutDate;
            }

            ViewBag._ClientShift = _globalrepository.GetClientShift(_client_id).Select(t => new SelectListItem { Text = t.ShiftTypeDescription, Value = t.ShiftTypeId.ToString() }).ToList();
            return PartialView("~/Views/Attendance/Partial/Correction/_post_correction_detail.cshtml", _model);
        }

        [HttpPost]
        public ActionResult _AddPostCorrection(Correction_model _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    int _id = _attendancerepository.ManageAttendanceCorrection(_model, 0);
                    _model.Id = _id;
                    _id = _attendancerepository.ManageAttendanceCorrection(_model, 3);
                    return Json(new { Result = "Success", CorrectionId = _id });
                }

                List<string> _errors = _globalrepository.GetModelErrors(ModelState);
                return Json(new { Result = "ERROR", Message = _errors[1], ElementName = _errors[0] });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
        //---------------------------------------END ADD POST  ATTENDANCE CORRECTION---------------------------------------


        //---------------------------------------BEGIN ADD ATTENDANCE CORRECTION---------------------------------------
        [HttpGet]
        public ActionResult _AddCorrection()
        {
            Correction_model _model = new Correction_model
            {
                EmpId = _loginuserid,
                UserId = 112
            };

            DefaultShift _defaultshift = _attendancerepository.GetDefaultShift();
            if (_defaultshift != null)
            {
                _model.ShiftId = _defaultshift.ShiftId;
                _model.TimeInDate = _defaultshift.TimeInDate;
                _model.TimeInTime = _defaultshift.TimeInDate;
                _model.TimeOutDate = _defaultshift.TimeOutDate;
                _model.TimeOutDate = _defaultshift.TimeOutDate;
            }            

            ViewBag._ClientShift = _globalrepository.GetClientShift(_client_id).Select(t => new SelectListItem { Text = t.ShiftTypeDescription, Value = t.ShiftTypeId.ToString() }).ToList();
            return PartialView("~/Views/Attendance/Partial/Correction/_correction_detail.cshtml", _model);
        }

        [HttpPost]
        public ActionResult _AddCorrection(Correction_model _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    int _id = _attendancerepository.ManageAttendanceCorrection(_model, 0);

                    _model.Id = _id;
                    _id = _attendancerepository.ManageAttendanceCorrection(_model, 3);

                    return Json(new { Result = "Success", CorrectionId = _id });
                }

                List<string> _errors = _globalrepository.GetModelErrors(ModelState);
                return Json(new { Result = "ERROR", Message = _errors[1], ElementName = _errors[0] });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
        //---------------------------------------END ADD ATTENDANCE CORRECTION---------------------------------------

        //---------------------------------------BEGIN EDIT ATTENDANCE CORRECTION---------------------------------------
        [HttpGet]
        public ActionResult _EditCorrection(int _id)
        {
            Correction_model _obj = _attendancerepository.GetAttendanceCorrection(_id);
            
            ViewBag._ClientShift = _globalrepository.GetClientShift(_client_id).Select(t => new SelectListItem { Text = t.ShiftTypeDescription, Value = t.ShiftTypeId.ToString() }).ToList();


            //return PartialView("~/Views/Attendance/Partial/Correction/_correction_detail.cshtml", _obj);
            return PartialView("~/Views/Attendance/Partial/Correction/_edit_correction_detail.cshtml", _obj);
        }

        [HttpPost]
        public ActionResult _EditCorrection(Correction_model _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    int _id = _attendancerepository.ManageAttendanceCorrection(_model, 1);

                    _id = _attendancerepository.ManageAttendanceCorrection(_model, 3);
                    return Json(new { Result = "Success", CorrectionId = _id });
                }

                List<string> _errors = _globalrepository.GetModelErrors(ModelState);
                return Json(new { Result = "ERROR", Message = _errors[1], ElementName = _errors[0] });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
        //---------------------------------------END EDIT ATTENDANCE CORRECTION---------------------------------------

        //---------------------------------------BEGIN POST ATTENDANCE CORRECTION---------------------------------------
        [HttpGet]
        public ActionResult _PostCorrection(int _id)
        {
            Correction_model _obj = _attendancerepository.GetAttendanceCorrection(_id);
            _obj.UserId = 112;
            return PartialView("~/Views/Attendance/Partial/Correction/_post_detail.cshtml", _obj);
        }

        [HttpPost]
        public ActionResult _PostCorrection(Correction_model _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    //GenerateAttendanceCorrectionForm(_model.Id);
                    int _id = _attendancerepository.ManageAttendanceCorrection(_model, 3);
                    
                    return Json(new { Result = "SUCCESS", Id = _id });
                }

                List<string> _errors = _globalrepository.GetModelErrors(ModelState);
                return Json(new { Result = "ERROR", Message = _errors[1], ElementName = _errors[0] });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

        [HttpPost]
        public ActionResult GenerateAttendanceCorrectionForm(int _id)
        {
            try
            {
                Correction_model _attndnancecorrection = _attendancerepository.GetAttendanceCorrection(_id);
                if (_attndnancecorrection == null)
                    return Json(new { Result = "ERROR", Message = "Attendance correction record not found." });

                string guid = _attndnancecorrection.guid;
                string templatePath = Server.MapPath("~/AttendanceCorrectionAttachments/Attendance_Correction_Template.xlsx");
                if (!System.IO.File.Exists(templatePath))
                    return Json(new { Result = "ERROR", Message = "Template not found." });

                string baseFolder = Server.MapPath("~/AttendanceCorrectionAttachments/AttendanceCorrectionFormsGenerated/Posted/");
                if (!Directory.Exists(baseFolder)) Directory.CreateDirectory(baseFolder);

                string guidFolder = Path.Combine(baseFolder, _attndnancecorrection.guid.ToString());
                if (!Directory.Exists(guidFolder)) Directory.CreateDirectory(guidFolder);

                string outputPdf = Path.Combine(guidFolder, _attndnancecorrection.guid + ".pdf");

                using (XLWorkbook wb = new XLWorkbook(templatePath))
                {
                    var ws = wb.Worksheet(1);

                    ws.Cell("H8").Value = _attndnancecorrection.DateFiled.ToString("MM/dd/yyyy");
                    ws.Cell("E10").Value = _attndnancecorrection.EmpName;
                    ws.Cell("E11").Value = _attndnancecorrection.ClientName;
                    ws.Cell("E13").Value = _attndnancecorrection.Shift;
                    ws.Cell("E14").Value = _attndnancecorrection.TimeInDate.ToString("MM/dd/yyyy");
                    ws.Cell("H14").Value = _attndnancecorrection.TimeInTime.ToString("hh:mm tt");
                    ws.Cell("E15").Value = _attndnancecorrection.TimeOutDate.ToString("MM/dd/yyyy");
                    ws.Cell("H15").Value = _attndnancecorrection.TimeOutTime.ToString("hh:mm tt");
                    ws.Cell("E17").Value = _attndnancecorrection.Reason;

                    ws.Cell("C25").Value = _EmployeeName;

                    using (var ms = new MemoryStream())
                    {
                        // --- QR Code Embedding ---
                        using (var client = new System.Net.WebClient())
                        {
                            string _url = PortalConstant.RootPath + "_PreviewPostedAttendanceCorrection";
                            //string baseUrl = "http://localhost:50393/Attendance/_PreviewAttendanceCorrection";
                            string baseUrl = _url;
                            string qrText = baseUrl + "?_guid=" + guid;

                            string qrUrl = "https://quickchart.io/qr?text=" +
                                           Uri.EscapeDataString(qrText) +
                                           "&dark=950808&light=ffffff";

                            byte[] qrBytes = client.DownloadData(qrUrl);

                            using (var qrStream = new MemoryStream(qrBytes))
                            {
                                var picture = ws.AddPicture(qrStream)
                                                .MoveTo(ws.Cell("B34"))
                                                .Scale(0.6);
                            }
                        }
                        // -------------------------

                        wb.SaveAs(ms);
                        ms.Position = 0;

                        string tempPath = Path.GetTempFileName() + ".xlsx";
                        System.IO.File.WriteAllBytes(tempPath, ms.ToArray());

                        Excel.Application excelApp = new Excel.Application();
                        excelApp.Visible = false;
                        Microsoft.Office.Interop.Excel.Workbook excelWorkbook = excelApp.Workbooks.Open(tempPath);

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
                    FilePath = "/OvertimeAtAttendanceCorrectionAttachmentstachments/AttendanceCorrectionFormsGenerated/Posted/" + _attndnancecorrection.guid + "/" + _attndnancecorrection.guid + ".pdf"
                });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
        //---------------------------------------END POST ATTENDANCE CORRECTION---------------------------------------

        [HttpGet]
        public ActionResult _PreviewCorrection(string _guid)
        {
            if (_globalrepository.HasAccessToViewGeneratedForm(_loginuserid, "ATTENDANCE CORRECTION", _guid))
            {
                string _filename = _guid;
                return PartialView("~/Views/Attendance/Partial/Correction/_preview_correction_detail.cshtml", _filename);
            }
            else { return PartialView("~/Views/Shared/_AccessDenied.cshtml"); }
        }

        [HttpGet]
        public ActionResult _PreviewApprovedCorrection(string _guid)
        {
            if (_globalrepository.HasAccessToViewGeneratedForm(_loginuserid, "ATTENDANCE CORRECTION", _guid))
            {
                string _filename = _guid;
                return PartialView("~/Views/Attendance/Partial/Correction/_preview_approved_correction_detail.cshtml", _filename);
            }
            else { return PartialView("~/Views/Shared/_AccessDenied.cshtml"); }
        }

        //---------------------------------------BEGIN UNPOST ATTENDANCE CORRECTION---------------------------------------
        [HttpGet]
        public ActionResult _UnpostCorrection(int _id)
        {
            Correction_model _obj = _attendancerepository.GetAttendanceCorrection(_id);
            _obj.UserId = 112;
            return PartialView("~/Views/Attendance/Partial/Correction/_unpost_detail.cshtml", _obj);
        }

        [HttpPost]
        public ActionResult _UnpostCorrection(Correction_model _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    int _id = _attendancerepository.ManageAttendanceCorrection(_model, 4);
                    return Json(new { Result = "Success" });
                }

                List<string> _errors = _globalrepository.GetModelErrors(ModelState);
                return Json(new { Result = "ERROR", Message = _errors[1], ElementName = _errors[0] });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
        //---------------------------------------END UNPOST ATTENDANCE CORRECTION---------------------------------------

        //---------------------------------------BEGIN CANCEL ATTENDANCE CORRECTION---------------------------------------
        [HttpGet]
        public ActionResult _CancelCorrection(int _id)
        {
            Correction_model _obj = _attendancerepository.GetAttendanceCorrection(_id);
            _obj.UserId = 112;
            return PartialView("~/Views/Attendance/Partial/Correction/_cancel_detail.cshtml", _obj);
        }

        [HttpPost]
        public ActionResult _CancelCorrection(Correction_model _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    if (_model.DTRId != 0)
                    {
                        return Json(new { Result = "ERROR", Message = "Attendance correction has already been submitted in the DTR; cancellation will not be processed." });
                    }

                    int _id = _attendancerepository.ManageAttendanceCorrection(_model, 2);
                    return Json(new { Result = "Success" });
                }

                List<string> _errors = _globalrepository.GetModelErrors(ModelState);
                return Json(new { Result = "ERROR", Message = _errors[1], ElementName = _errors[0] });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
        //---------------------------------------END CANCEL ATTENDANCE CORRECTION---------------------------------------
        //=======================================END ATTENDANCE CORRECTION==============================


        //=======================================BEGIN DTR==============================
        [HttpGet]
        public ActionResult GetDTRList(DateTime _fromdate, DateTime _todate, string _status)
        {
            try
            {
                List<DTRList_model> _obj = _attendancerepository.GetdtrList(_fromdate, _todate, _status);
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        public ActionResult GetDTR(int _id)
        {
            try
            {
                DTRmodel _obj = _attendancerepository.GetDTR(_id);
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        //[HttpGet]
        //public ActionResult GetDTRDetails(int _id)
        //{
        //    List<APWModel.ViewModel.Portal.DTR_model.DTRDetail_model> _obj = _attendancerepository.GetDTRDetails(_id);
        //    return PartialView("~/Views/Attendance/Partial/DTR/_post_dtr_detail.cshtml", _obj);
        //}

        [HttpGet]
        public ActionResult GetDTRDetails(int _id)
        {
            try
            {
                List<APWModel.ViewModel.Portal.DTR_model.DTRDetail_model> _obj = _attendancerepository.GetDTRDetails(_id);
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        //---------------------------------------BEGIN ADD DTR---------------------------------------
        [HttpGet]
        public ActionResult _AddDTR()
        {
            DTRmodel _model = new DTRmodel
            {
                EmpId = _loginuserid,
                Mode = 0
            };
            _model.Month = DateTime.Now.Year.ToString() + "-" + DateTime.Now.Month.ToString();
            //DefaultShift _defaultshift = _attendancerepository.GetDefaultShift();
            //if (_defaultshift != null)
            //{
            //    _model.ShiftId = _defaultshift.ShiftId;
            //    _model.TimeInDate = _defaultshift.TimeInDate;
            //    _model.TimeInTime = _defaultshift.TimeInDate;
            //    _model.TimeOutDate = _defaultshift.TimeOutDate;
            //    _model.TimeOutDate = _defaultshift.TimeOutDate;
            //}
            
            return PartialView("~/Views/Attendance/Partial/DTR/_dtr_detail.cshtml", _model);
        }
        //---------------------------------------END ADD DTR---------------------------------------

        //---------------------------------------BEGIN EDIT DTR---------------------------------------
        [HttpGet]
        public ActionResult _EditDTR(int _id)
        {
            DTRmodel _obj = _attendancerepository.GetDTR(_id);
            _obj.Month = _obj.Year.ToString() + "-" + _obj.Month.ToString();
            _obj.Id = _id;
            _obj.EmpId = _loginuserid;
            _obj.Mode = 1;
            return PartialView("~/Views/Attendance/Partial/DTR/_dtr_detail.cshtml", _obj);
        }
        //---------------------------------------END EDIT DTR---------------------------------------

        //---------------------------------------BEGIN POST DTR---------------------------------------
        [HttpGet]
        public ActionResult _PostDTR(int _id)
        {
            DTRmodel _dtr = _attendancerepository.GetDTR(_id);
            _dtr.Mode = 3;
            
            DTRPostDetailResult _postDetails = _attendancerepository.GetPostDTR(_id);
            
            _postDetails.DTR = _dtr;

            return PartialView("~/Views/Attendance/Partial/DTR/_post_detail.cshtml", _postDetails);
        }

        //---------------------------------------END POST DTR---------------------------------------

        //---------------------------------------BEGIN UNPOST DTR---------------------------------------
        [HttpGet]
        public ActionResult _UnpostDTR(int _id)
        {
            DTRmodel _obj = _attendancerepository.GetDTR(_id);
            _obj.UserId = 112;
            _obj.Mode = 4;
            return PartialView("~/Views/Attendance/Partial/DTR/_unpost_detail.cshtml", _obj);
        }
        //---------------------------------------END UNPOST DTR---------------------------------------

        //---------------------------------------BEGIN CANCEL DTR---------------------------------------
        [HttpGet]
        public ActionResult _CancelDTR(int _id)
        {
            DTRmodel _obj = _attendancerepository.GetDTR(_id);
            _obj.UserId = 112;
            _obj.Mode = 2;
            return PartialView("~/Views/Attendance/Partial/DTR/_cancel_detail.cshtml", _obj);
        }
        //---------------------------------------END CANCEL DTR---------------------------------------

        [HttpPost]
        public ActionResult _ManageDTR(DTRmodel _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    if (!string.IsNullOrEmpty(_model.Month))
                    {
                        _model.Month = _model.Month.Split('-')[1]; 
                    }

                    //if (_model.Mode == 3) { GenerateDTRForm(_model.Id); }
                    int _id = _attendancerepository.ManageDTR(_model);

                    if (_id == 0)
                    {
                        return Json(new { Result = "ERROR", Message = "An error occured, please contact system administrator." });
                    }
                    else
                    { 
                        return Json(new { Result = "Success" });
                    }
                }

                List<string> _errors = _globalrepository.GetModelErrors(ModelState);
                return Json(new { Result = "ERROR", Message = _errors[1], ElementName = _errors[0] });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

        [HttpPost]
        public ActionResult GenerateDTRForm(int id)
        {
            try
            {
                //List<APWModel.ViewModel.Portal.DTR_model.DTRDetail_model> _obj = _attendancerepository.GetDTRDetails(id);
                DTRPostDetailResult _obj = _attendancerepository.GetPostDTR(id);
                DTRmodel _getdtr = _attendancerepository.GetDTR(id);

                string guid = _getdtr.guid;
                if (_getdtr == null)
                    return Json(new { Result = "ERROR", Message = "DTR record not found." });

                string templatePath = Server.MapPath("~/DTRAttachments/APW_Portal_DTR_Template.xlsx");
                if (!System.IO.File.Exists(templatePath))
                    return Json(new { Result = "ERROR", Message = "Template not found." });

                string baseFolder = Server.MapPath("~/DTRAttachments/DTRFormsGenerated/Posted/");
                if (!Directory.Exists(baseFolder)) Directory.CreateDirectory(baseFolder);

                string guidFolder = Path.Combine(baseFolder, _getdtr.guid.ToString());
                if (!Directory.Exists(guidFolder)) Directory.CreateDirectory(guidFolder);

                string outputPdf = Path.Combine(guidFolder, _getdtr.guid + ".pdf");

                using (XLWorkbook wb = new XLWorkbook(templatePath))
                {
                    var ws = wb.Worksheet(1);

                    //DateTime monthDate = DateTime.ParseExact(_getdtr.Month, "yyyy-MM", CultureInfo.InvariantCulture);
                    DateTime monthDate = DateTime.Parse( _getdtr.Month.ToString() + "/1/" + _getdtr.Year.ToString());
                    string monthName = monthDate.ToString("MMMM");

                    //ws.Cell("G7").Value = _obj.DateFiled.ToString("MM/dd/yyyy");
                    ws.Cell("C2").Value = _getdtr.EmpName;
                    ws.Cell("C3").Value = _getdtr.ClientName;
                    ws.Cell("C4").Value = _getdtr.CutOff + " - " + monthName + " - " + _getdtr.Year;
                    ws.Cell("D44").Value = _EmployeeName;

                    int startRow = 7;
                    foreach (AttendanceDetail _res in _obj.Attendance)
                    {
                        //var detail = _obj[i];
                        

                        ws.Cell("A" + startRow).Value = _res.DateLog;
                        ws.Cell("B" + startRow).Value = _res.WorkSchedule;

                        if (DateTime.TryParse(_res.TimeIn, out DateTime parsedTimeIn))
                            ws.Cell("C" + startRow).Value = parsedTimeIn.ToString("hh:mm tt");
                        else
                            ws.Cell("C" + startRow).Value = "";

                        if (DateTime.TryParse(_res.TimeOut, out DateTime parsedTimeOut))
                            ws.Cell("F" + startRow).Value = parsedTimeOut.ToString("hh:mm tt");
                        else
                            ws.Cell("F" + startRow).Value = "";


                        startRow++;
                    }


                    startRow = 27;
                    foreach (OvertimeDetail _res in _obj.Overtime)
                    {
                        ws.Cell("A" + startRow).Value = _res.Date;
                        ws.Cell("B" + startRow).Value = _res.ShiftSchedule;
                        ws.Cell("C" + startRow).Value = _res.Start;
                        ws.Cell("E" + startRow).Value = _res.End;
                        ws.Cell("F" + startRow).Value = _res.TotalHours;
                        ws.Cell("G" + startRow).Value = _res.Reason;

                        startRow++;
                    }

                    //for (int i = 0; i < _obj.Count; i++)
                    //{
                    //    var detail = _obj[i];
                    //    int row = startRow + i;

                    //    ws.Cell("A" + row).Value = detail.DateLog;
                    //    ws.Cell("B" + row).Value = detail.ShiftDescription;

                    //    if (DateTime.TryParse(detail.TimeIn, out DateTime parsedTimeIn))
                    //        ws.Cell("C" + row).Value = parsedTimeIn.ToString("hh:mm tt"); 
                    //    else
                    //        ws.Cell("C" + row).Value = "";

                    //    if (DateTime.TryParse(detail.TimeOut, out DateTime parsedTimeOut))
                    //        ws.Cell("F" + row).Value = parsedTimeOut.ToString("hh:mm tt");
                    //    else
                    //        ws.Cell("F" + row).Value = "";
                    //}


                    using (var ms = new MemoryStream())
                    {
                        // --- QR Code Embedding ---
                        using (var client = new System.Net.WebClient())
                        {
                            string _url = PortalConstant.RootPath + "_PreviewPostedDTRForm";
                            string baseUrl = _url;
                            string qrText = baseUrl + "?_guid=" + guid;

                            string qrUrl = "https://quickchart.io/qr?text=" +
                                Uri.EscapeDataString(qrText) + 
                                "&dark=950808&light=ffffff";
                            byte[] qrBytes = client.DownloadData(qrUrl);

                            using (var qrStream = new MemoryStream(qrBytes))
                            {
                                var picture = ws.AddPicture(qrStream)
                                                .MoveTo(ws.Cell("J2"))
                                                .Scale(0.6);
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
                    FilePath = "/DTRAttachments/DTRFormsGenerated/Posted/" + _getdtr.guid + "/" + _getdtr.guid + ".pdf"
                });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

        [HttpGet]
        public ActionResult _PreviewPostedDTRForm(string _guid)
        {
            string approvedBaseFolder = Server.MapPath($"~/DTRAttachments/DTRFormsGenerated/Posted/{_guid}/{_guid}.pdf");

            if (!System.IO.File.Exists(approvedBaseFolder))
            {
                return HttpNotFound("PDF file not found.");
            }

            return File(approvedBaseFolder, "application/pdf");
        }

        [HttpGet]
        public ActionResult _PreviewDTR(string _guid)
        {
            string _filename = _guid;
            return PartialView("~/Views/Attendance/Partial/DTR/_preview_dtr_detail.cshtml", _filename);
        }

        [HttpGet]
        public ActionResult _PreviewApprovedDTR(string _guid)
        {
            string _filename = _guid;
            return PartialView("~/Views/Attendance/Partial/DTR/_preview_approved_dtr_detail.cshtml", _filename);
        }
        //=======================================END DTR==============================

        [HttpGet]
        public ActionResult _PreviewDTRSummary(string _guid)
        {
            if (_globalrepository.HasAccessToViewGeneratedForm(_loginuserid, "DTR", _guid))
            {
                string _filename = _guid;
                return PartialView("~/Views/Attendance/Partial/DTR/_preview_dtrsummary_detail.cshtml", _filename);
            }
            else { return PartialView("~/Views/Shared/_AccessDenied.cshtml"); }
        }

        [HttpGet]
        public ActionResult _PreviewApprovedDTRSummary(string _guid)
        {
            if (_globalrepository.HasAccessToViewGeneratedForm(_loginuserid, "DTR", _guid))
            {
                string _filename = _guid;
                return PartialView("~/Views/Attendance/Partial/DTR/_preview_approved_dtrsummary_detail.cshtml", _filename);
            }
            else { return PartialView("~/Views/Shared/_AccessDenied.cshtml"); }
        }

        [HttpGet]
        public ActionResult _PreviewPostedAttendanceCorrection(string _guid)
        {
            string approvedBaseFolder = Server.MapPath($"~/AttendanceCorrectionAttachments/AttendanceCorrectionFormsGenerated/Posted/{_guid}/{_guid}.pdf");

            if (!System.IO.File.Exists(approvedBaseFolder))
            {
                return HttpNotFound("PDF file not found.");
            }

            return File(approvedBaseFolder, "application/pdf");
        }


        [HttpGet]
        public JsonResult GetClientCutoffDate(string cutoff, int month, int year)
        {
            try
            {
                var result = _attendancerepository.GetClientCutoffDate(_client_id, cutoff, month, year);

                return Json(new
                {
                    success = true,
                    dateFrom = result.DateFrom.ToString("yyyy-MM-dd"),
                    dateTo = result.Dateto.ToString("yyyy-MM-dd")
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult _CorrectionAttachment(int _id, HttpPostedFileBase Correction_Attachment)
        {
            try
            {
                string _fileextension = _globalrepository.GetExtension(Correction_Attachment);
                int _mode = 91;

                Correction_model _model = new Correction_model();
                _model.Id = _id;

                
                _model.DateLog= DateTime.Now;
                _model.DateFiled = DateTime.Now;

                _model.WorkLocation = 0;
                _model.EmpId = _loginuserid;
                _model.EmpName = "";
                _model.ClientName = "";
                _model.ShiftId = 0;
                _model.TimeInDate = DateTime.Now;
                _model.TimeInTime = DateTime.Now;
                _model.TimeOutDate = DateTime.Now;
                _model.TimeOutTime = DateTime.Now;

                _model.Reason = "";
                _model.Remarks = _fileextension;

                _model.mode = _mode;
                _model.UserId = 112;
                _model.guid = "";

                _id = _attendancerepository.ManageAttendanceCorrection(_model, _mode);

                //update table for the file extension 

                //check if candidate id folder already exist, if not create a folder
                //string _check_foloder = Path.Combine(Server.MapPath("~/LeaveAttachments/Filing/" + _id.ToString()), "");
                //if (Directory.Exists(_check_foloder) == false) { Directory.CreateDirectory(_check_foloder); }


                var path = Path.Combine(Server.MapPath("~/AttendanceCorrectionAttachments/Filing/" + _id.ToString() + _fileextension));

                if (System.IO.File.Exists(path)) { System.IO.File.Delete(path); }

                Correction_Attachment.SaveAs(path);
                //attached procedure ends here------------------------------------------------------------------------------

                return Json(new { Result = "Success" });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

        [HttpGet]
        public ActionResult _OpenCorrectionFile(int _fileid, string _extension)
        {
            Correction_model _model = new Correction_model
            {
                Id = _fileid,
                FileExtension = _extension
            };

            return PartialView("~/Views/Attendance/partial/Correction/_view_attachment.cshtml", _model);
        }
    }
}