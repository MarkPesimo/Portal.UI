using APWModel.ViewModel.Global;
using APWModel.ViewModel.Global.Account;
using APWModel.ViewModel.Portal;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Portal.Controllers
{
    [Authorize]
    public class ProfileController : Controller
    {
        private GlobalRepository _globalrepository { get; set; }
        private ProfileRepository _profilerepository { get; set; }
        private int _loginuserid  { get; set; }
        private int _candidate_id { get; set; }

        private string _Profile_Index = "~/Views/Profile/Profile_Index.cshtml";

        public ProfileController()
        {
            if (_globalrepository == null) { _globalrepository = new GlobalRepository(); }
            if (_profilerepository == null) { _profilerepository = new ProfileRepository(); }
            if (_loginuserid == 0) {
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
            Profile_model _model = _profilerepository.GetPortalProfile();
            if (_model.WithPendingRequest)
            {
                ViewBag._WithPendingRequest_profile = "You still have pending request update. APW-ES team is currently reviewing your request.";
            }
            return View(_Profile_Index, _model);
        }

        [HttpPost]
        public ActionResult AttachProfilePicture(HttpPostedFileBase Image_Attachement)
        {
            try
            {
                if (Image_Attachement.ContentLength > 0)
                {
                    string _contenttype = "";

                    if (Image_Attachement.ContentType == "image/jpeg") { _contenttype = ".jpeg"; }
                    else if (Image_Attachement.ContentType == "image/gif") { _contenttype = ".gif"; }
                    else if (Image_Attachement.ContentType == "image/png") { _contenttype = ".png"; }

                    //make the extension always jpeg
                    var path = Path.Combine(Server.MapPath("~/CandidateImages/"), _candidate_id.ToString() + ".jpeg");

                    string _jpeg_path = _candidate_id.ToString() + ".jpeg";
                    if (System.IO.File.Exists(_jpeg_path))
                    {
                        System.IO.File.Delete(_jpeg_path);
                    }


                    Image_Attachement.SaveAs(path);
                    //return Json(new { Success = "OK", ex = "" });
                    return RedirectToAction("Index", "Profile");
                }
                return Json(new { Result = "ERROR", Message = "No file selected." });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }

        }

        [HttpGet]
        public ActionResult _Edit()
        {
            Profile_model _model = _profilerepository.GetPortalProfile();
            ViewBag._Gender = _globalrepository.GetGender().Select(s => new SelectListItem { Text = s.Gender_Desc, Value = s.Value }).ToList();
            ViewBag._CivilStatus = _globalrepository.GetCivilStatus().Select(s => new SelectListItem { Text = s.Decription, Value = s.Value }).ToList();

            if (_model.WithPendingRequest) {
                ViewBag._WithPendingRequest_edit = "Displaying your Previous information request update.";
                return PartialView("~/Views/Profile/Partial/_Edit_Profile_detail.cshtml", _model.PendingPersonalInfo);
            }
            else { return PartialView("~/Views/Profile/Partial/_Edit_Profile_detail.cshtml", _model.PersonalInfo); }                       
        }

        [HttpPost]
        public ActionResult _Edit(PortalPersonalinfo_model _model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    //before saving, check if email address is already exist or any validation here...
                    //if exist prompt a message
                    ModelState.Clear();
                    Profile_model _profile = _profilerepository.GetPortalProfile();
                    int _mode = 0;
                    if (_profile.WithPendingRequest) { _mode = 1; }
                    
                    int _id = _profilerepository.UpdatePortalProfile(_model, _mode);
                    
                    return Json(new { Result = "Success" });
                }

                //return PartialView("_AddPooling_detail", _model);
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