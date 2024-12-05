using APWModel.ViewModel.Global;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using static APWModel.ViewModel.Portal.Helpdesk_model;
using static APWModel.ViewModel.Portal.Helpdesk_model.Comment_model;
using static APWModel.ViewModel.Portal.Helpdesk_model.Monitoring_model;

namespace Portal.Controllers
{
    [Authorize]
    public class HelpdeskController : Controller
    {
        private GlobalRepository _globalrepository { get; set; }
        private HelpdeskRepository _helpdeskrepository { get; set; }
        private int _loginuserid { get; set; }
        private int _candidate_id { get; set; }

        private string _Helpdesk_Index = "~/Views/Helpdesk/Helpdesk_Index.cshtml";

        public HelpdeskController()
        {
            if (_globalrepository == null) { _globalrepository = new GlobalRepository(); }
            if (_helpdeskrepository == null) { _helpdeskrepository = new HelpdeskRepository(); }
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
        // GET: Helpdesk
        public ActionResult Index()
        {
            DateTime firstDayOfMonth = new DateTime(DateTime.Now.Year, 1, 1);
            DateTime currentdate = DateTime.Now;
            DateTime lastDayOfMonth = currentdate.AddMonths(1).AddDays(-1);

            Filter_model _filter = new Filter_model
            {
                UserId = _loginuserid,
                UserType = "User",
                ByConcerntype = false,
                ConcernType = 0,
                ByStatus = false,
                Status = "All",
                ByDate = true,
                From = firstDayOfMonth,
                To = lastDayOfMonth,
                Keyword = "",
                ByClient = false,
                ClientId = 0
            };

            ViewBag._concernTypes = _globalrepository.GetConcernTypes().Select(t => new SelectListItem { Text = t.ConcernType, Value = t.Id.ToString() }).ToList();
            ViewBag._concernStatus = _globalrepository.GetConcernStatus().Select(t => new SelectListItem { Text = t.Description, Value = t.Value }).ToList();
            return View(_Helpdesk_Index, _filter);
        }

        public void HowToUse()
        {
            try
            {
                string _fileextension = ".pdf";
                string _filename = "Helpdesk.pdf";

                Response.ContentType = _fileextension;
                Response.AddHeader("Content-Disposition", @"filename=" + _filename);
                Response.TransmitFile(Path.Combine(Server.MapPath("~/CandidateFiles/helpdesk.pdf")));

            }
            catch (Exception ex)
            {
                Response.Write("<h2>Error occured : Could not find file.</h2>");
            }
        }

        //=============================BEGIN CONCERN================================================
        [HttpGet]
        public ActionResult _GetPortalHelpdesk(int _concerntypeid, string _status, DateTime _fromdate, DateTime _todate)
        {
            try
            {
                List<Concern_model> _obj = _helpdeskrepository.ConcernMonitoring(_concerntypeid, _status, _fromdate, _todate);
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        public ActionResult _AddConcern()
        {
            ConcernModel _model = new ConcernModel();
            ViewBag._concernTypes = _globalrepository.GetConcernTypes().Select(t => new SelectListItem { Text = t.ConcernType, Value = t.Id.ToString() }).ToList();
            _model.UserId = _loginuserid;
            return PartialView("~/Views/Helpdesk/Partial/concern/_Concern_detail.cshtml", _model); 
        }

        [HttpPost]
        public ActionResult _AddConcern(ConcernModel _model)
        {
            try
            {
                if (ModelState.IsValid)
                {                    
                    int _id = _helpdeskrepository.ManageConcern(_model, 0);
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

        [HttpGet]
        public ActionResult _EditConcern(int _id)
        {
            ConcernModel _model = _helpdeskrepository.GetConcern(_id);
            ViewBag._concernTypes = _globalrepository.GetConcernTypes().Select(t => new SelectListItem { Text = t.ConcernType, Value = t.Id.ToString() }).ToList();
            _model.UserId = _loginuserid;

            return PartialView("~/Views/Helpdesk/Partial/concern/_Concern_detail.cshtml", _model);
        }

        [HttpPost]
        public ActionResult _EditConcern(ConcernModel _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    int _id = _helpdeskrepository.ManageConcern(_model, 1);
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

        [HttpGet]
        public ActionResult _PostConcern(int _id)
        {
            ConcernModel _model = _helpdeskrepository.GetConcern(_id);
            return PartialView("~/Views/Helpdesk/Partial/concern/_Post_detail.cshtml", _model);
        }

        [HttpPost]
        public ActionResult _PostConcern(ConcernModel _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    int _id = _helpdeskrepository.ManageConcern(_model, 3);
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

        [HttpGet]
        public ActionResult _UnpostConcern(int _id)
        {
            ConcernModel _model = _helpdeskrepository.GetConcern(_id);
            return PartialView("~/Views/Helpdesk/Partial/concern/_Unpost_detail.cshtml", _model);
        }

        [HttpPost]
        public ActionResult _UnpostConcern(ConcernModel _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    int _id = _helpdeskrepository.ManageConcern(_model, 4);
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

        [HttpGet]
        public ActionResult _CancelConcern(int _id)
        {
            ConcernModel _model = _helpdeskrepository.GetConcern(_id);
            return PartialView("~/Views/Helpdesk/Partial/concern/_Cancel_detail.cshtml", _model);
        }

        [HttpPost]
        public ActionResult _CancelConcern(ConcernModel _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    int _id = _helpdeskrepository.ManageConcern(_model, 2);
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

        [HttpGet]
        public ActionResult _DeleteConcern(int _id)
        {
            ConcernModel _model = _helpdeskrepository.GetConcern(_id);
            return PartialView("~/Views/Helpdesk/Partial/concern/_Delete_detail.cshtml", _model);
        }

        [HttpPost]
        public ActionResult _DeleteConcern(ConcernModel _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    int _id = _helpdeskrepository.ManageConcern(_model, 7);
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
        //=============================END CONCERN================================================

        //=============================BEGIN COMMENT================================================
        [HttpGet]
        public ActionResult _GetComments(int _concernid)
        {
            try
            {
                List<CommentMonitoring_model> _obj = _helpdeskrepository.Comments(_concernid);
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex) { throw; }
        }

        [HttpGet]
        public ActionResult _AddComment()
        {
            CommentModel _model = new CommentModel
            {
                UserId = _loginuserid,
                DateCreated = DateTime.Now
            };
            return PartialView("~/Views/Helpdesk/Partial/comment/_Add_Comment_detail.cshtml", _model);
        }

        [HttpPost]
        public ActionResult _AddComment(CommentModel _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    int _id = _helpdeskrepository.ManageComment(_model);
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
        //=============================END COMMENT================================================
    }
}