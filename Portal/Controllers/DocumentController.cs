using APWModel.ViewModel.Global;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
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
    public class DocumentController : Controller
    {
        private GlobalRepository _globalrepository { get; set; }
        private DocumentRepository _documentrepository { get; set; }
        private int _loginuserid = 0;
        private int _candidate_id { get; set; }
        private int _client_id { get; set; }    

        private string _Document_Index = "~/Views/Document/Document_index.cshtml";
        private string _COE_Index = "~/Views/Document/COE.cshtml";

        public DocumentController()
        {
            if (_globalrepository == null) { _globalrepository = new GlobalRepository(); }
            if (_documentrepository == null) {  _documentrepository = new DocumentRepository(); }
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
            if (_globalrepository.HasClientAccess(_client_id, "DOCUMENT"))
            {
                return View(_Document_Index);
            }

            return View("AccessDenied"); 
        }

        [HttpGet]
        public ActionResult Requirements()
        {
            if (_globalrepository.HasClientAccess(_client_id, "REQUIREMENTS"))
            {
                return View(_Document_Index);
            }

            return View("AccessDenied");
        }

        [HttpGet]
        public ActionResult COE()
        {
            if (_globalrepository.HasClientAccess(_client_id, "GENERATE COE"))
            {
                ViewBag._Reasons = _globalrepository.GetCOEReasons().Select(s => new SelectListItem { Text = s.Description, Value = s.Value }).ToList();
                return View(_COE_Index);
            }

            return View("AccessDenied");
        }

        ReportDocument _rptfile;

        [HttpPost]
        public ActionResult CanGenerateCOE(string reason)
        {
            try
            {
                bool canGenerate = _documentrepository.CheckGenerateCOE(); 
                return Json(new { success = canGenerate, message="Success"  }, JsonRequestBehavior.AllowGet);                
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public void GenerateCOE(string _reason)
        {
            _rptfile = new ReportDocument();
            Guid _guid = Guid.NewGuid();

            try
            {
                string _filename = System.Web.HttpContext.Current.Server.MapPath("~/") + "Report//Document//" + "COE with Compensation - Annual.rpt";

                _rptfile.Load(_filename);
                _rptfile.DataDefinition.FormulaFields["Purpose"].Text = "'" + _reason + "'";
                _rptfile.DataDefinition.FormulaFields["EmpID"].Text = "" + _loginuserid.ToString() + "";


                //string _password = _globalrepository.Dcrypt(PortalConstant.dbpassword);
                _rptfile.SetDatabaseLogon(PortalConstant.Username, PortalConstant.dbpassword, PortalConstant.ServerName, PortalConstant.DatabaseName);

                string localPath = System.Web.HttpContext.Current.Server.MapPath("~/GeneratedReports/" + _loginuserid.ToString());
                if (!Directory.Exists(localPath))
                {
                    Directory.CreateDirectory(localPath);
                }

                string localFileName = localPath + @"\" + _guid.ToString() + ".pdf"; 
                _rptfile.ExportToDisk(ExportFormatType.PortableDocFormat, localFileName);
                
                bool isStored = _documentrepository.SaveCOEGeneration(_reason, _guid.ToString() + ".pdf" );             //insert logs in the database
                bool isEmail = _documentrepository.NotifyCOEGeneration( _guid.ToString() + ".pdf");                     //send email notif

                _rptfile.ExportToHttpResponse(ExportFormatType.PortableDocFormat, System.Web.HttpContext.Current.Response, false, "COE");

                _rptfile.Close();
                _rptfile.Dispose();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}