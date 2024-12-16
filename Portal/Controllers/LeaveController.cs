using APWModel.ViewModel.Global;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
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
                }
            }
        }

        [HttpGet]
        public ActionResult Index()
        {
            return View(_Leave_Index);
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

        //---------------------------------------BEGIN ADD LEAVE---------------------------------------
        [HttpGet]
        public ActionResult _AddLeave()
        {
            LeaveModel _model = new LeaveModel
            {
                EmpId = _loginuserid,
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
            return PartialView("~/Views/Leave/Partial/_post_detail.cshtml", _obj);
        }
        //---------------------------------------END POST LEAVE---------------------------------------

        //---------------------------------------BEGIN POST LEAVE---------------------------------------
        [HttpGet]
        public ActionResult _UnpostLeave(int _id)
        {
            LeaveModel _obj = _leaverepository.GetLeave(_id);
            _obj.Mode = 4;
            return PartialView("~/Views/Leave/Partial/_unpost_detail.cshtml", _obj);
        }
        //---------------------------------------END POST LEAVE---------------------------------------

        //---------------------------------------BEGIN CANCEL LEAVE---------------------------------------
        [HttpGet]
        public ActionResult _CancelLeave(int _id)
        {
            LeaveModel _obj = _leaverepository.GetLeave(_id);
            _obj.Mode = 2;
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

                if (ModelState.IsValid)
                {
                    int _id = _leaverepository.ManageLeave(_model);
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
    }
}