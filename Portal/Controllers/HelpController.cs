using APWModel.ViewModel.Global;
using APWModel.ViewModel.iSearch;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Portal.Controllers
{
    [Authorize]
    public class HelpController : Controller
    {
        private GlobalRepository _globalrepository { get; set; }
        private HelpRepository _helprepository { get; set; }
        private int _loginuserid = 0;
        private int _candidate_id { get; set; }
        private int _client_id { get; set; }

        private string _Help_Index = "~/Views/Help/Help_Index.cshtml";

        public HelpController()
        {
            if (_globalrepository == null) { _globalrepository = new GlobalRepository(); }
            if (_helprepository == null) { _helprepository = new HelpRepository(); }
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

        // GET: Help
        public ActionResult Index()
        {
            //List<HelpModel> _model = _helprepository.GetHelpByApp(12);
            HelpList_Model _model = _helprepository.GetHelpByApp2(12);
            return View(_Help_Index, _model);
        }

        [HttpGet]
        public ActionResult Preview(int _id, string _description, string _filename, string _modulename)
        {
            if (_modulename == "") { goto Preview; }
            if (!_globalrepository.HasClientAccess(_client_id, _modulename)) { return PartialView("_AccessDenied"); }

            Preview:
            HelpModel _model = new HelpModel
            {
                Id = _id,
                Description = _description,
                Filename = _filename
            };
            return PartialView("~/Views/Help/Partial/Preview.cshtml", _model);
        }
    }
}