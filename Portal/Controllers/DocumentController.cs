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

        private string _Document_Index = "~/Views/Document/Document_index.cshtml";
        private string _COE_Index = "~/Views/Document/COE.cshtml";

        public DocumentController()
        {
            if (_globalrepository == null) { _globalrepository = new GlobalRepository(); }
            if (_documentrepository == null) {  _documentrepository = new DocumentRepository(); }
            if (_loginuserid == 0) { _loginuserid = _globalrepository.GetLoginUser().UserId; }
        }

        [HttpGet]
        public ActionResult Index()
        {
            return View(_Document_Index);
        }

        [HttpGet]
        public ActionResult COE()
        {
            ViewBag._Reasons = _globalrepository.GetCOEReasons().Select(s => new SelectListItem { Text = s.Description, Value = s.Value }).ToList();
            return View(_COE_Index);
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

                
                _rptfile.SetDatabaseLogon(PortalConstant.Username, PortalConstant.dbpassword, PortalConstant.ServerName, PortalConstant.DatabaseName);

                string localPath = System.Web.HttpContext.Current.Server.MapPath("~/GeneratedReports/" + _loginuserid.ToString());
                if (!Directory.Exists(localPath))
                {
                    Directory.CreateDirectory(localPath);
                }

                string localFileName = localPath + @"\" + _guid.ToString() + ".pdf"; 
                _rptfile.ExportToDisk(ExportFormatType.PortableDocFormat, localFileName);
                
                bool isStored = _documentrepository.SaveCOEGeneration(_reason, _guid.ToString() + ".pdf" );
                bool isEmail = _documentrepository.NotifyCOEGeneration( _guid.ToString() + ".pdf");

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