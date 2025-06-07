using APWModel.ViewModel.Global;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using static APWModel.ViewModel.HRMS.Employee.Payroll;

namespace Portal.Controllers
{
    [Authorize]
    public class PayrollController : Controller
    {
        private GlobalRepository _globalrepository { get; set; }
        private PayrollRepository _payrollrepository { get; set; }
        private int _loginuserid = 0;
        private int _candidate_id { get; set; }
        private int _client_id { get; set; }

        private string _Payroll_Index = "~/Views/Payroll/Payroll_Index.cshtml";
        private string _Payslip_Index = "~/Views/Payroll/Payslip.cshtml";
        private string _Loan_Index = "~/Views/Payroll/Loan.cshtml";

        public PayrollController()
        {
            if (_globalrepository == null) { _globalrepository = new GlobalRepository(); }
            if (_payrollrepository == null) { _payrollrepository = new PayrollRepository(); }
            if (_loginuserid == 0) {
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
            if (_globalrepository.HasClientAccess(_client_id, "PAYROLL")) { return View(_Payroll_Index); }
            else { return View("AccessDenied"); }
            //return View(_Payroll_Index);
        }

        //----------------------------------------------BEGIN PAYSLIP---------------------------------------------------
        [HttpGet]
        public ActionResult Payslip()
        {
            if (_globalrepository.HasClientAccess(_client_id, "PAYSLIP")) { return View(_Payslip_Index); }
            else { return View("AccessDenied"); }
            //return View(_Payslip_Index);
        }

        [HttpGet]
        public ActionResult _GetEmployeePayslips(string _fromdate = "", string _todate = "")
        {
            try
            {
                List<PayrollList_model> _obj = _payrollrepository.EmployeePayrolls(_fromdate, _todate);
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        ReportDocument _rptfile;

        public void PrintPayslip(int _payrollid)
        {
            _rptfile = new ReportDocument();

            try
            {
                string _filename = System.Web.HttpContext.Current.Server.MapPath("~/") + "Report//Payroll//" + "Payslip.rpt";

                _rptfile.Load(_filename);
                _rptfile.DataDefinition.FormulaFields["Payroll_ID"].Text = "" + _payrollid + "";
                _rptfile.DataDefinition.FormulaFields["EmpID"].Text = "" + _loginuserid + "";

                _rptfile.SetDatabaseLogon(PortalConstant.Username, PortalConstant.dbpassword, PortalConstant.ServerName, PortalConstant.DatabaseName);
                _rptfile.ExportToHttpResponse(ExportFormatType.PortableDocFormat, System.Web.HttpContext.Current.Response, false, "PAYSLIP");

                _rptfile.Close();
                _rptfile.Dispose();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //----------------------------------------------END PAYSLIP---------------------------------------------------

        //----------------------------------------------BEGIN LOAN---------------------------------------------------
        public ActionResult Loan()
        {
            if (_globalrepository.HasClientAccess(_client_id, "LOAN")) {
                //return View(_Payslip_Index);
                var _loan_status = _globalrepository.GetLoanStatuses().Select(t => new SelectListItem { Text = t.Description, Value = t.Value }).ToList();
                ViewBag.LoanStatus = _loan_status;
                return View(_Loan_Index);
            }
            else
            {
                return View("AccessDenied");
            }           
        }

        [HttpGet]
        public ActionResult _GetEmployeeLoans(string _status)
        {
            try
            {
                List<LoanList_model> _obj = _payrollrepository.EmployeeLoans(_status);
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        public JsonResult _GetLoanTransactions(int _loanId)
        {
            try
            {
                List<LoanTransactionPayment_model> _obj = _payrollrepository.GetLoanTransactions(_loanId);
                return Json(_obj, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        //----------------------------------------------END LOAN---------------------------------------------------
    }
}