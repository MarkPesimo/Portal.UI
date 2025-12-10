using APWModel.ViewModel.Global;
using APWModel.ViewModel.Portal;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using Portal.Models;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using static APWModel.ViewModel.HRMS.Employee.EmployeeDocument_model;
using static Portal.Models.VW_COE;

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
        private int _companyid { get; set; }

        private string _Document_Index = "~/Views/Document/Document_index.cshtml";
        private string _COE_Index = "~/Views/Document/COE.cshtml";
        private string _DocumentRequirement_Index = "~/Views/Document/RequiredDocs.cshtml";

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
                    _companyid = _user.Companyid;
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
                return View(_DocumentRequirement_Index);
            }

            return View("AccessDenied");
        }

        [HttpGet]
        public ActionResult GetRequiredDocuments()
        {
            try
            {
                List<RequiredDocument_model> _obj = _documentrepository.GetRequiredDocuments(_candidate_id);
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        public ActionResult GetRequiredDocumentsCmb()
        {
            try
            {
                List<PortalRequiredDocument_model> _obj = _documentrepository.GetRequiredDocumentsCmb();
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        //=======================================================================================================================================

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
                Guid _guid = Guid.NewGuid();
                return Json(new { success = canGenerate, message="Success"  }, JsonRequestBehavior.AllowGet);                
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //Guid _guid;


        [HttpGet]
        public ActionResult CanGenerateCOE2()
        {
            
            try
            {
                bool canGenerate  = _documentrepository.CheckGenerateCOE();
                return Json(new { success = canGenerate, message = "Success" }, JsonRequestBehavior.AllowGet);                
            }
            catch (Exception ex)
            {
                return Json(new { Status = "ERROR", Msg = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpGet]
        public ActionResult GenerateCOE2(string _compensationtype, string _salarytype, string _reason)
        {
            _rptfile = new ReportDocument();

         
            try
            {
                string _filename = "";

                if (_compensationtype == "With Compensation")
                {
                    if (_companyid == 4)                        //APW
                    {
                        if (_salarytype == "Monthly") { _filename = System.Web.HttpContext.Current.Server.MapPath("~/") + "Report//COE//" + "COE with Compensation - Monthly.rpt"; }
                        else if (_salarytype == "Annual") { _filename = System.Web.HttpContext.Current.Server.MapPath("~/") + "Report//COE//" + "COE with Compensation - Annual.rpt"; }
                    }
                    else if (_companyid == 10)                  //APWTECH
                    {
                        _filename = System.Web.HttpContext.Current.Server.MapPath("~/") + "Report//COE//" + "Not Supported.rpt";
                    }
                }
                else if (_compensationtype == "Without Compensation")
                {
                    if (_companyid == 4) { _filename = System.Web.HttpContext.Current.Server.MapPath("~/") + "Report//COE//" + "COE without Compensation.rpt"; }
                    else if (_companyid == 10) { _filename = System.Web.HttpContext.Current.Server.MapPath("~/") + "Report//COE//APWTech//" + "COE without Compensation.rpt"; }
                }


                _rptfile.Load(_filename);
                _rptfile.DataDefinition.FormulaFields["Purpose"].Text = "'" + _reason + "'";
                _rptfile.DataDefinition.FormulaFields["EmpID"].Text = "" + _loginuserid.ToString() + "";


                //string _password = _globalrepository.Dcrypt(PortalConstant.dbpassword);
                _rptfile.SetDatabaseLogon(PortalConstant.Username, PortalConstant.dbpassword, PortalConstant.ServerName, PortalConstant.DatabaseName);

                string localPath = System.Web.HttpContext.Current.Server.MapPath("~/GeneratedReports/COE/" + _loginuserid.ToString());
                if (!Directory.Exists(localPath))
                {
                    Directory.CreateDirectory(localPath);
                }

                Guid _guid = Guid.NewGuid();
                string localFileName = localPath + @"/" + _guid.ToString() + ".pdf";

           
                _rptfile.ExportToDisk(ExportFormatType.PortableDocFormat, localFileName);

                 

                _rptfile.Close();
                _rptfile.Dispose();

                COE_MODEL _coe = new COE_MODEL();
                _coe.Location = _loginuserid.ToString();
                _coe.Filename = _guid.ToString() + ".pdf";

                Thread.Sleep(5000);

                bool isStored = _documentrepository.SaveCOEGeneration(_reason, _guid.ToString() + ".pdf" );             //insert logs in the database
                bool isEmail = _documentrepository.NotifyCOEGeneration( _guid.ToString() + ".pdf");                     //send email notif

                return PartialView("~/Views/Document/partial/_preview_coe_detail.cshtml", _coe);
              
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void GenerateCOE(string _compensationtype, string _salarytype, string _reason)
        {
            _rptfile = new ReportDocument();

            Guid _guid = Guid.NewGuid();
            try
            {
                string _filename = "";

                if (_compensationtype == "With Compensation")
                {
                    if (_companyid == 4)                        //APW
                    {
                        if (_salarytype == "Monthly") { _filename = System.Web.HttpContext.Current.Server.MapPath("~/") + "Report//COE//" + "COE with Compensation - Monthly.rpt"; }
                        else if (_salarytype == "Annual") { _filename = System.Web.HttpContext.Current.Server.MapPath("~/") + "Report//COE//" + "COE with Compensation - Annual.rpt"; }                        
                    }
                    else if (_companyid == 10)                  //APWTECH
                    {
                        _filename = System.Web.HttpContext.Current.Server.MapPath("~/") + "Report//COE//" + "Not Supported.rpt";
                    }
                }
                else if (_compensationtype == "Without Compensation")
                {
                    if (_companyid == 4) { _filename = System.Web.HttpContext.Current.Server.MapPath("~/") + "Report//COE//" + "COE without Compensation.rpt"; }
                    else if (_companyid == 10) { _filename = System.Web.HttpContext.Current.Server.MapPath("~/") + "Report//COE//APWTech//" + "COE without Compensation.rpt"; }
                }
                                

                _rptfile.Load(_filename);
                _rptfile.DataDefinition.FormulaFields["Purpose"].Text = "'" + _reason + "'";
                _rptfile.DataDefinition.FormulaFields["EmpID"].Text = "" + _loginuserid.ToString() + "";


                //string _password = _globalrepository.Dcrypt(PortalConstant.dbpassword);
                _rptfile.SetDatabaseLogon(PortalConstant.Username, PortalConstant.dbpassword, PortalConstant.ServerName, PortalConstant.DatabaseName);

                string localPath = System.Web.HttpContext.Current.Server.MapPath("~/GeneratedReports/COE/" + _loginuserid.ToString());
                if (!Directory.Exists(localPath))
                {
                    Directory.CreateDirectory(localPath);
                }

                string localFileName = localPath + @"/" +_guid.ToString() + ".pdf";
 
                //DirectoryInfo di = new DirectoryInfo(localPath);
                //FileInfo[] files = di.GetFiles("*.pdf");
                //List<FileInfo> _checker = (from d in files where d.CreationTime.Month == 9 && d.CreationTime.Year == 2025 && d.CreationTime.Day == 12 && d.CreationTime.Hour == 19 && d.CreationTime.Minute == 58 select d).ToList(); //  where d.CreationTime.Month == 9 && d.CreationTime.Year == 2025 && d.CreationTime.Day == 12 && d.CreationTime.Hour == 7 && d.CreationTime.Minute == 55 select d).ToList();
                //if (_checker.Count == 0)
                //{
                    _rptfile.ExportToDisk(ExportFormatType.PortableDocFormat, localFileName);

                    //bool isStored = _documentrepository.SaveCOEGeneration(_reason, _guid.ToString() + ".pdf" );             //insert logs in the database
                    //bool isEmail = _documentrepository.NotifyCOEGeneration( _guid.ToString() + ".pdf");                     //send email notif

                    //if (_guid.ToString() != "00000000-0000-0000-0000-000000000000") {

                    //}
                    _rptfile.ExportToHttpResponse(ExportFormatType.PortableDocFormat, System.Web.HttpContext.Current.Response, false, "COE");

                    _rptfile.Close();
                    _rptfile.Dispose();

                ////}


            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet]
        public ActionResult AddRequiredDocument(int _id, int _docid, string _documentname)
        {
            try
            {
                PortalRequiredDocument_model _obj = new PortalRequiredDocument_model();

                _obj.PortalUserId = _loginuserid;
                _obj.CandId = _candidate_id;
                _obj.Empid = 0;
                _obj.RequiredDocumentId = _id;
                _obj.DocId = _docid;
                _obj.Status = false;
                _obj.DocType = _documentname;

                return PartialView("~/Views/Document/partial/_add_required_document_detail.cshtml", _obj);
            }
            catch (Exception ex)
            {
                return Json(new { Result = "", ex = ex.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult _ManageRequiredDocument(PortalRequiredDocument_model model)
        {
            try
            {
                model.DateRequested = DateTime.Now;
                model.CompletedBy = 2;
                model.DateCompleted = DateTime.Now;

                HttpPostedFileBase file = Request.Files["Document_Attachment"];

                if (file != null && file.ContentLength > 0)
                {
                    string baseFolder = @"\\192.168.20.23\apw system\HRMS\Notes\Portal Document Submitted";

                    if (!Directory.Exists(baseFolder))
                    {
                        Directory.CreateDirectory(baseFolder);
                    }
                    
                    string originalExtension = Path.GetExtension(file.FileName);
                    
                    string fileName = $"{model.CandId}-{model.DocId}{originalExtension}";

                    string finalPath = Path.Combine(baseFolder, fileName);

                    file.SaveAs(finalPath);
                    
                    model.FilePath = $"/RequiredDocument/{fileName}";
                }



                int id = _documentrepository.ManagePortalRequiredDocument(model);

                return Json(new { Result = "OK", Id = id, Message = "Required document successfully submitted." });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }



    }
}