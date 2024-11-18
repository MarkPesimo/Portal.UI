using APWModel.ViewModel.Global;
using Portal.Repository.Account;
using Portal.Repository.Global;
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
        private string _Settings_Index = "~/Views/Account/Settings.cshtml";

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

        [Authorize]
        [HttpGet]
        public ActionResult Settings()
        {
            return View(_Settings_Index);
        }


        [HttpGet]
        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            HttpContext.Request.Cookies.Remove(FormsAuthentication.FormsCookieName);
            Session.Abandon();

            return Json(new { Result = "Success" }, JsonRequestBehavior.AllowGet);
        }

    }
}