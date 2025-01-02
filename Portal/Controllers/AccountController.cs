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
    public class AccountController : Controller
    {
        private GlobalRepository _globalrepository { get; set; }
        private AccountRepository _accountrepository { get; set; }
         
        public AccountController()
        {
            if (_globalrepository == null) { _globalrepository = new GlobalRepository(); }
            if (_accountrepository == null) { _accountrepository = new AccountRepository(); }
        }

        [HttpGet]
        public ActionResult Login()
        {
            LoginModel model = new LoginModel
            {
                AppModuleId = 12
            };
            return View("Login", model);
        }

        [HttpPost]
        public ActionResult Login(LoginModel model, string returnUrl)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    model.Password = _globalrepository.Md5HashPassword(model.Password);

                    string _login_result = _accountrepository.Login(model);
                    if (_login_result == "Ok")
                    {
                        string _urlreferrer = Request.UrlReferrer.ToString();
                        int _index = _urlreferrer.IndexOf("ReturnUrl");
                        string _redirecttourl = "";
                        if (_index > 0)
                        {
                            _redirecttourl = _urlreferrer.Substring(_index + 10, (_urlreferrer.Length - (_index + 10)));
                        }

                        if (_redirecttourl != "")
                        {
                            _redirecttourl = _redirecttourl.Replace("%2F", "/");
                            _redirecttourl = _redirecttourl.Replace("%3F", "?");
                            _redirecttourl = _redirecttourl.Replace("%3D", "=");
                            //return Redirect(_redirecttourl);
                            return Json(new { Result = "Success", URL = _redirecttourl });
                        }
                        else
                        {
                            return Json(new { Result = "Success", URL = "/Home/Index" });
                        }
                    }
                    else
                    {
                        return Json(new { Result = "ERROR", Message = _login_result, ElementName = "UserName" });
                    }
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
        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            HttpContext.Request.Cookies.Remove(FormsAuthentication.FormsCookieName);
            Session.Abandon();

            return Json(new { Result = "Success" }, JsonRequestBehavior.AllowGet);
        }

        //--------------------------------------------------BEGIN FORGOT PASSWORD--------------------------------------------------------------------
        [HttpGet]
        public ActionResult ForgotPassword()
        {
            Portal_ForgotPassword_model _model = new Portal_ForgotPassword_model();
            _model.Username = "";
            _model.EmailAddress = "";
            _model.Middlename = "";
            _model.Birthdate = DateTime.Now;
            return View(_model);
        }

        [HttpPost]
        public ActionResult ForgotPassword(Portal_ForgotPassword_model model)
        {
            if (ModelState.IsValid)
            {
                if (_accountrepository.ForgotPassowrd(model) == "Account Located")
                {
                    ReturnedMessageModel _message = new ReturnedMessageModel();
                    _message.HeaderMessage = "Account Located!";
                    _message.BodyMessage = "We've sent you a link to your email to reset your password.";

                    return View("~/Views/Account/Confirmation.cshtml", _message);
                }
                else
                {
                    ModelState.AddModelError("", "Sorry...The information your provided is not existing in our Database.");
                    return View(model);
                }
            }

            return View(model);
        }
        //--------------------------------------------------END FORGOT PASSWORD--------------------------------------------------------------------

        //--------------------------------------------------BEGIN RESET PASSWORD--------------------------------------------------------------------
        [HttpGet]
        public ActionResult ResetPassword(string username, string reset)
        {

            try
            {
                if (!Request.IsAuthenticated)
                {
                    Portal_AccountModel _model = _accountrepository.ResetPassword(username, reset);
                    Portal_NewPasswordModel _password_model = new Portal_NewPasswordModel();

                    if (_model != null)
                    {
                        ViewBag.Status = "Valid";
                        _password_model.UserID = int.Parse(_model.EmpId.ToString());
                        return View(_password_model);
                    }
                    else
                    {
                        ModelState.AddModelError("", "Sorry...You cannot reset your password, the link is invalid.");
                        ViewBag.Status = "InvalidLink";
                        return View(_password_model);
                    }
                }
                return RedirectToAction("Login", "Account");
            }
            catch (Exception ex)
            {
                HandleErrorInfo _error = new HandleErrorInfo(ex.InnerException, "Account", "ResetPassword");
                return View("Error", _error);
            }

        }

        [HttpPost]
        public ActionResult ResetPassword(Portal_NewPasswordModel model)
        {
            if (ModelState.IsValid)
            {
                if (model.ConfirmPassword == model.NewPassword)
                {

                    string _result = _accountrepository.ResetPassword(model);
                    if (_result == "Success")
                    {
                        ReturnedMessageModel _message = new Portal.Models.ReturnedMessageModel();
                        _message.HeaderMessage = "Success!";
                        _message.BodyMessage = "We've successfully update your password.";


                        return View("~/Views/Account/Success.cshtml", _message);
                    }
                    else
                    {
                        ModelState.AddModelError("", "An Error occured. Kindly try again later.");
                    }
                }
                else
                {
                    ModelState.AddModelError("", "New Password and Confirm password did not match.");
                }
            }

            return View(model);
        }
        //--------------------------------------------------END RESET PASSWORD--------------------------------------------------------------------

    }
}