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
        private int _client_id { get; set; }

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
                    _client_id = _user.ClientId;
                }
            }
        }
        // GET: Helpdesk
        public ActionResult Index()
        {
            if (_globalrepository.HasClientAccess(_client_id, "HELPDESK"))
            {
                DateTime firstDayOfMonth = new DateTime(DateTime.Now.Year, 1, 1);
                DateTime currentdate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
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

            return View("AccessDenied");
            
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
            return PartialView("~/Views/Helpdesk/Partial/concern/_add_Concern_detail.cshtml", _model); 
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

            return PartialView("~/Views/Helpdesk/Partial/concern/_Edit_Concern_detail.cshtml", _model);
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
                //get concern status
                string _status = _helpdeskrepository.GetConcernStatus(_concernid);

                List<CommentMonitoring_model> _obj = _helpdeskrepository.Comments(_concernid);
                return Json( new { result = _obj, status= _status }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex) { throw; }
        }

        [HttpGet]
        public ActionResult _AddComment(int _concernid)
        {
            CommentModel _model = new CommentModel
            {
                ConcernId = _concernid,
                UserId = _loginuserid,
                DateCreated = DateTime.Now
            };
            return PartialView("~/Views/Helpdesk/Partial/comment/_Add_Comment_detail.cshtml", _model);
        }

        [HttpPost]
        public ActionResult _AddComment(int _concernid, string _comment, HttpPostedFileBase Comment_Attachment)
        {
            CommentModel _model = new CommentModel();
            
            try
            {
                _model.Id = 0;
                _model.ConcernId = _concernid;
                _model.Comment = _comment;
                _model.UserId = _loginuserid;
                _model.DateCreated = DateTime.Now;

                if (ModelState.IsValid)
                {
                    int _id = _helpdeskrepository.ManageComment(_model);
                    //int _commentid = _helpdeskrepository.GetTopConcern(_id);
                    if (AttachFile(_concernid, _id, Comment_Attachment)) { return Json(new { Result = "Success", ConcernId = _concernid }); }
                    else { return Json(new { Result = "Error", ConcernId = _concernid }); }                    
                }

                List<string> _errors = _globalrepository.GetModelErrors(ModelState);
                return Json(new { Result = "ERROR", Message = _errors[1], ElementName = _errors[0] });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

        public bool AttachFile(int _concernid, int _commentid, HttpPostedFileBase Comment_Attachment)
        {
            try
            {
                if (Comment_Attachment.ContentLength > 0)
                {
                    AttachmentModel attach = new AttachmentModel();
                    string _contenttype = _globalrepository.GetExtension(Comment_Attachment);

                    //if location is not yet exist, create it
                    string _check_foloder = Path.Combine(Server.MapPath("~/Attachments/" + _concernid.ToString() + "/"), "");
                    if (Directory.Exists(_check_foloder) == false) { Directory.CreateDirectory(_check_foloder); }

                    var path = Path.Combine(Server.MapPath("~/Attachments/" + _concernid.ToString() + "/"), _commentid.ToString() + _contenttype);
                    if (System.IO.File.Exists(path)) { System.IO.File.Delete(path); }

                    attach.Id = _commentid;
                    attach.UserId = _loginuserid;
                    attach.DateUploaded = DateTime.Now;

                    attach.Location = path;
                    attach.FileName = Comment_Attachment.FileName;
                    attach.DateUploaded = DateTime.Now;
                    attach.ContentType = _contenttype;

                    _helpdeskrepository.UploadCommentAttachment(attach);

                    Comment_Attachment.SaveAs(path);

                    return true;
                }

                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }

        [HttpPost]
        public ActionResult _Attach(int _concernid, int _commentid, HttpPostedFileBase Comment_Attachment)
        {
            try
            {
                if (AttachFile(_concernid, _commentid, Comment_Attachment)) { return Json(new { Result = "Success", ConcernId = _concernid }); }
                else { return Json(new { Result = "Error", ConcernId = _concernid }); }                                
            }
            catch (Exception ex)
            {
                return Json(new { Result = "Error", ConcernId = 0 });
            }
        }

        public void ViewAttachment(int ConcernId, int Id)
        {
            AttachmentModel _obj = _helpdeskrepository.GetAttachment(Id);
            if (_obj != null)
            {
                if (_obj.ContentType != null)
                {
                    Response.ContentType = _obj.ContentType;
                    Response.AddHeader("Content-Disposition", @"filename=" + _obj.FileName + "");


                    var path = Path.Combine(Path.Combine(Server.MapPath("~/Attachments/" + ConcernId.ToString() + ""), _obj.Id.ToString() + _obj.ContentType));

                    if (System.IO.File.Exists(path))
                    {
                        Response.TransmitFile(Path.Combine(Server.MapPath("~/Attachments/" + ConcernId.ToString() + ""), _obj.Id.ToString() + _obj.ContentType));
                    }
                    else { Response.Write("<h2>Attachment not found or missing.</h2>"); }

                }
                else { Response.Write("<h2>Attachment not found or missing.</h2>"); }
            }
            else
            { Response.Write("<h2>Attachment not found or missing.</h2>"); }


            //var _attachment = ifile.GetAttatchment(Id);
            //if (_attachment != null)
            //{
            //    Response.ContentType = _attachment.ContentType;
            //    Response.AddHeader("Content-Disposition", @"filename=" + _attachment.Filename + "");
            //    //Response.TransmitFile(Path.Combine(Server.MapPath("~/App_Data/AttachmentFiles"), _attachment.Filename));
            //    Response.TransmitFile(Path.Combine(Server.MapPath("~/Documents"), _attachment.Filename));
            //}
            //Response.Write("<h2>No attachment found or missing.</h2>");

        }
        //=============================END COMMENT================================================
    }
}