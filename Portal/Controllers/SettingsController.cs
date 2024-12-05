using APWModel.ViewModel.Global;
using APWModel.ViewModel.Global.Account;
using Portal.Models;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace Portal.Controllers
{
    [Authorize]
    public class SettingsController : Controller
    {
        private GlobalRepository _globalrepository { get; set; }
        private PayrollRepository _payrollrepository { get; set; }
        private SettingsRepository _settingsrepository { get; set; }
        private int _loginuserid = 0;

        private string _Settings_Index = "~/Views/Settings/Settings_Index.cshtml";

        public SettingsController()
        {
            if (_globalrepository == null) { _globalrepository = new GlobalRepository(); }
            if (_payrollrepository == null) { _payrollrepository = new PayrollRepository(); }
            if (_settingsrepository == null) { _settingsrepository = new SettingsRepository(); }
            if (_loginuserid == 0) { _loginuserid = _globalrepository.GetLoginUser().UserId; }
        }


        // GET: Settings
        public ActionResult Index()
        {
            return View(_Settings_Index);
        }


        ///---------------------------------------------BEGIN ACCOUNT SETTINGS------------------------------------------------------------------
        /// [HttpGet]
        public ActionResult AccountSetup()
        {
            try
            {
                Portal_AccountSetup_Model _obj = _settingsrepository.AccountSetup();
                if (_obj != null) { return View(_obj); }
                else { return View("NotFound", _obj); }
            }
            catch (Exception ex)
            {
                HandleErrorInfo _error = new HandleErrorInfo(ex.InnerException, "Account", "Setting");
                return View("Error", _error); ;
            }
        }

        [HttpPost]
        public ActionResult AccountSetup(Portal_AccountSetup_Model model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    if (_settingsrepository.UpdateAccountSetup(model) == "Success")
                    {
                        ReturnedMessageModel _message = new ReturnedMessageModel();
                        _message.HeaderMessage = "Success!!!";
                        _message.BodyMessage = "Account settings successfully updated.";

                        return View("~/Views/Account/Success.cshtml", _message);
                    }
                }


                return View("AccountSetting", model);
            }
            catch (Exception ex)
            {
                HandleErrorInfo _error = new HandleErrorInfo(ex.InnerException, "Account", "AccountSetting");
                return View("Error", _error);
            }
        }
        ///---------------------------------------------END ACCOUNT SETTINGS------------------------------------------------------------------


        ///---------------------------------------------BEGIN CHANGE PASSWORD------------------------------------------------------------------
        [HttpGet]
        public ActionResult ChangePassword()
        {
            Portal_ChangePasswordModel _model = new Portal_ChangePasswordModel();
            _model.EmpId = _loginuserid;
            return View(_model);
        }

        [Authorize]
        [HttpPost]
        public ActionResult ChangePassword(Portal_ChangePasswordModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    string _result = _settingsrepository.ChangePassword(model);
                    if (_result == "Success")
                    {
                        ReturnedMessageModel _message = new ReturnedMessageModel();
                        _message.HeaderMessage = "Success!!!";
                        _message.BodyMessage = "Password successfully changed.";

                        FormsAuthentication.SignOut();
                        HttpContext.Request.Cookies.Remove(FormsAuthentication.FormsCookieName);
                        Session.Abandon();


                        return View("~/Views/Account/Success.cshtml", _message);
                    }
                    else
                    {
                        ModelState.AddModelError("", _result);
                    }
                }

                return View("ChangePassword", model);
            }
            catch (Exception ex)
            {
                HandleErrorInfo _error = new HandleErrorInfo(ex.InnerException, "Account", "ChangePassword");
                return View("Error", _error);
            }
        }


        ///---------------------------------------------END CHANGE PASSWORD------------------------------------------------------------------
        ///

        [HttpGet]
        public ActionResult Login()
        {
            LoginModel model = new LoginModel
            {
                AppModuleId = 12
            };
            return View("~/Views/Account/Login.cshtml", model);
        }
    }
}