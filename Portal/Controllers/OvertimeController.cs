using APWModel.ViewModel.Global;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using static APWModel.ViewModel.Portal.Overtime_model;

namespace Portal.Controllers
{
    [Authorize]
    public class OvertimeController : Controller
    {
        private GlobalRepository _globalrepository { get; set; }
        private OvertimeRepository _overtimerepository { get; set; }
        private int _loginuserid { get; set; }
        private int _candidate_id { get; set; }
        public int _client_id { get; set; }

        //private string _LeaveAttendance_Index = "~/Views/Leave/LeaveAttendance_Index.cshtml";
        private string _Overtime_Index = "~/Views/Overtime/Overtime_index.cshtml";


        public OvertimeController()
        {
            if (_globalrepository == null) { _globalrepository = new GlobalRepository(); }
            if (_overtimerepository == null) { _overtimerepository = new OvertimeRepository(); }
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

        // GET: Overtime
        public ActionResult Index()
        {
            if (_globalrepository.HasClientAccess(_client_id, "LEAVE")) { return View(_Overtime_Index); }
            else { return View("AccessDenied"); }            
        }


        //---------------------------------------BEGIN FILTER---------------------------------------
        [HttpGet]
        public ActionResult _Filter()
        {
            FiledOvertimeMonitoringFilter_model _model = new FiledOvertimeMonitoringFilter_model();
            ViewBag._Status = _overtimerepository.GetStatus().Select(t => new SelectListItem { Text = t.Description, Value = t.Value }).ToList();
            return PartialView("~/Views/Overtime/Partial/_overtime_filter_detail.cshtml", _model);
        }
        //---------------------------------------END FILTER---------------------------------------


        //---------------------------------------BEGIN GET---------------------------------------
        [HttpGet]
        public ActionResult _GetOvertimeMonitoring(DateTime _otfrom, DateTime _otto, string _status)
        {
            FiledOvertimeMonitoringFilter_model _filter = new FiledOvertimeMonitoringFilter_model();
            try
            {
                _filter.EmpId = _loginuserid;
                _filter.OTFrom = _otfrom;
                _filter.OTTo  = _otto;
                _filter.Status = _status;

                List<FiledOvertimeMonitoring_model> _obj = _overtimerepository.GetOvertimeMonitoring(_filter);
                return Json(new { Status = "SUCCESS", result = _obj }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = "ERROR", Msg = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        
        
        
        //---------------------------------------END GET---------------------------------------

        //---------------------------------------BEGIN ADD OVERTIME---------------------------------------
        [HttpGet]
        public ActionResult _AddOvertime()
        {
            OvertimeModel _model = new OvertimeModel
            {
                EmpId = _loginuserid,
                UserId = 112,
                ClientId = _client_id,
                Mode = 0,
            };

            return PartialView("~/Views/Overtime/Partial/_overtime_detail.cshtml", _model);
        }
        //---------------------------------------END ADD OVERTIME---------------------------------------

        //---------------------------------------BEGIN EDIT OVERTIME---------------------------------------
        [HttpGet]
        public ActionResult _EditOvertime(int _id)
        {
            OvertimeModel _obj = _overtimerepository.GetOvertime(_id);
            _obj.Mode = 1;
            _obj.UserId = 112;

            return PartialView("~/Views/Overtime/Partial/_overtime_detail.cshtml", _obj);
        }
        //---------------------------------------END EDIT OVERTIME---------------------------------------

        //---------------------------------------BEGIN POST OVERTIME---------------------------------------
        [HttpGet]
        public ActionResult _PostOvertime(int _id)
        {
            try
            {
                OvertimeModel _obj = _overtimerepository.GetOvertime(_id);
                _obj.Mode = 3;
                _obj.UserId = 112;
                return PartialView("~/Views/Overtime/Partial/_post_detail.cshtml", _obj);
            }
            catch (Exception ex)
            {
                throw ex;
            }            
        }
        //---------------------------------------END POST OVERTIME---------------------------------------

        //---------------------------------------BEGIN UNPOST OVERTIME---------------------------------------
        [HttpGet]
        public ActionResult _UnpostOvertime(int _id)
        {
            try
            {
                OvertimeModel _obj = _overtimerepository.GetOvertime(_id);
                _obj.Mode = 4;
                _obj.UserId = 112;
                return PartialView("~/Views/Overtime/Partial/_unpost_detail.cshtml", _obj);
            }
            catch (Exception ex)
            {
                throw ex;
            }            
        }
        //---------------------------------------END UNPOST OVERTIME---------------------------------------

        //---------------------------------------BEGIN CANCEL OVERTIME---------------------------------------
        [HttpGet]
        public ActionResult _CancelOvertime(int _id)
        {
            try
            {
                OvertimeModel _obj = _overtimerepository.GetOvertime(_id);
                _obj.Mode = 2;
                _obj.UserId = 112;
                return PartialView("~/Views/Overtime/Partial/_cancel_detail.cshtml", _obj);
            }
            catch (Exception ex)
            {
                throw ex;
            }           
        }
        //---------------------------------------END CANCEL OVERTIME---------------------------------------

        [HttpPost]
        public ActionResult _ManageOvertime(OvertimeModel _model)
        {
            try
            {
                if (_model.Remarks == null) { _model.Remarks = ""; }
                if (_model.Message == null) { _model.Message = ""; }

  

                if (_model.Mode == 0 || _model.Mode == 1)
                {
                    if (_model.OTFrom.Date > _model.OTTo.Date)
                    {
                        return Json(new { Result = "ERROR", Message = "The date of Overtime [from] cannot be ahead to the date of Overtime [to].", ElementName = "OTFrom" });
                    }

                    DateTime _from = DateTime.Parse(_model.OTFrom.ToShortDateString() + " " + _model.OTFromTime.ToShortTimeString());
                    DateTime _to = DateTime.Parse(_model.OTTo.ToShortDateString() + " " + _model.OTToTime.ToShortTimeString());

                    if (_from > _to)
                    {
                        return Json(new { Result = "ERROR", Message = "The Overtime [from] cannot be ahead to the date of Overtime [to].", ElementName = "OTFrom" });
                    }

                
                }

                if (ModelState.IsValid)
                {
                    int _id = _overtimerepository.ManageOvertime(_model);
                    return Json(new { Result = "Success", OvertimeId = _id });
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
        public ActionResult _OvertimeAttachment(int _id, HttpPostedFileBase Overtime_Attachment)
        {
            try
            {
                string _fileextension = _globalrepository.GetExtension(Overtime_Attachment);
                int _mode = 91;

                OvertimeModel _model = new OvertimeModel();
                _model.Id = _id;

                _model.EmpId = _loginuserid;
                _model.ClientId = 0;
                _model.DateFiled = DateTime.Now;

                _model.OTFrom = DateTime.Now;

                _model.OTFromTime = DateTime.Now;

                _model.OTTo = DateTime.Now;
                _model.OTToTime = DateTime.Now;
                _model.OTHours = 0;

                _model.Reason = "";
                _model.Remarks = _fileextension;
                _model.Mode = _mode;
                _model.Message = "";
                _model.UserId = 112;


                _id = _overtimerepository.ManageOvertime(_model);
                //update table for the file extension 

                //check if candidate id folder already exist, if not create a folder
                //string _check_foloder = Path.Combine(Server.MapPath("~/LeaveAttachments/Filing/" + _id.ToString()), "");
                //if (Directory.Exists(_check_foloder) == false) { Directory.CreateDirectory(_check_foloder); }


                var path = Path.Combine(Server.MapPath("~/OvertimeAttachments/Filing/" + _id.ToString() + _fileextension));

                if (System.IO.File.Exists(path)) { System.IO.File.Delete(path); }

                Overtime_Attachment.SaveAs(path);
                //attached procedure ends here------------------------------------------------------------------------------

                return Json(new { Result = "Success" });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

        [HttpGet]
        public ActionResult _OpenOvertimeFile(int _fileid, string _extension)
        {
            OvertimeModel _model = new OvertimeModel
            {
                Id = _fileid,
                FileExtension = _extension
            };

            return PartialView("~/Views/Overtime/partial/_view_attachment.cshtml", _model);
        }
    }
}