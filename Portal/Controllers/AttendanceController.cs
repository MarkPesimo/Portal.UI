using APWModel.ViewModel.Global;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using static APWModel.ViewModel.Portal.Attendance_model;
using static APWModel.ViewModel.Portal.DTR_model;

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
        //---------------------------------------END ADD ATTENDANCE CORRECTION---------------------------------------

        //---------------------------------------BEGIN EDIT ATTENDANCE CORRECTION---------------------------------------
        [HttpGet]
        public ActionResult _EditCorrection(int _id)
        {
            Correction_model _obj = _attendancerepository.GetAttendanceCorrection(_id);
            
            ViewBag._ClientShift = _globalrepository.GetClientShift(_client_id).Select(t => new SelectListItem { Text = t.ShiftTypeDescription, Value = t.ShiftTypeId.ToString() }).ToList();
            return PartialView("~/Views/Attendance/Partial/Correction/_correction_detail.cshtml", _obj);
        }

        [HttpPost]
        public ActionResult _EditCorrection(Correction_model _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    int _id = _attendancerepository.ManageAttendanceCorrection(_model, 1);
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
                    int _id = _attendancerepository.ManageAttendanceCorrection(_model, 3);
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
        //---------------------------------------END POST ATTENDANCE CORRECTION---------------------------------------

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
                UserId = 112,
                Mode = 0
            };

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
            _obj.EmpId = _loginuserid;
            _obj.UserId = 112;
            _obj.Mode = 1;
            return PartialView("~/Views/Attendance/Partial/DTR/_dtr_detail.cshtml", _obj);
        }
        //---------------------------------------END EDIT DTR---------------------------------------

        //---------------------------------------BEGIN POST DTR---------------------------------------
        [HttpGet]
        public ActionResult _PostDTR(int _id)
        {
            DTRmodel _obj = _attendancerepository.GetDTR(_id);
            _obj.UserId = 112;
            _obj.Mode = 3;
            return PartialView("~/Views/Attendance/Partial/DTR/_post_detail.cshtml", _obj);
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
                    int _id = _attendancerepository.ManageDTR(_model);
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
        //=======================================END DTR==============================
    }
}