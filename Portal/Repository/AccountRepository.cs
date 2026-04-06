using APWModel.ViewModel.Global;
using APWModel.ViewModel.Global.Account;
using Newtonsoft.Json;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Security;

namespace Portal.Repository
{
    public class AccountRepository
    {
        public GlobalRepository _globalRepository { get; set; }
        private int _loginuserid { get; set; }
        private int _candidate_id { get; set; }

        public AccountRepository()
        {
            if (_globalRepository == null) { _globalRepository = new GlobalRepository(); }

            if (_loginuserid == 0)
            {
                LoginUser_model _user = _globalRepository.GetLoginUser();
                if (_user != null)
                {
                    _loginuserid = _user.UserId;
                    _candidate_id = _user.CandidateId;
                }
            }
        }

        public string Login(LoginModel model)
        {
            var _content_prop = new Dictionary<string, string>
        {
            {"userName", model.UserName },
            {"password", model.Password },
            {"AppModuleId", model.AppModuleId.ToString() }
        };

            string _body_content = JsonConvert.SerializeObject(_content_prop);
            HttpContent _content = new StringContent(_body_content, Encoding.UTF8, "application/json");

            string _endpoint = "Account/Login";
            HttpResponseMessage _response = _globalRepository.GeneratePostRequest(_endpoint, _content);

            if (_response.IsSuccessStatusCode)
            {
                var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                var _CustomPrincipalSerializeModel = JsonConvert.DeserializeObject<LoginUser_model>(_value);

                if (!_CustomPrincipalSerializeModel.Status)
                {
                    return "Your Account is currently Inactive. Kindly coordinate with Employment Services Team.";
                }
                
                _CustomPrincipalSerializeModel.CompanyLogo = GetEmployerName(model.UserName);
                //_CustomPrincipalSerializeModel.CompanyLogo = "APW TECH";
                // ----------------------------

                JavaScriptSerializer serializer = new JavaScriptSerializer();
                string userData = serializer.Serialize(_CustomPrincipalSerializeModel);

                FormsAuthenticationTicket ticket = new FormsAuthenticationTicket(
                        1,
                        model.UserName,
                        DateTime.Now, DateTime.Now.AddDays(1),
                        true,
                        userData, 
                        FormsAuthentication.FormsCookiePath);

                string encryptedTicket = FormsAuthentication.Encrypt(ticket);
                var cookie = new HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
                System.Web.HttpContext.Current.Response.Cookies.Add(cookie);

                return "Ok";
            }

            return "Incorrect Username or Password";
        }

        //public LoginUser_model GetLoginUser()       //HttpCookie authCookie
        //{
        //    var _variable = System.Web.HttpContext.Current.User;
        //    LoginUser_model _obj = new LoginUser_model();
        //    string _endpoint = "Account/GetByUserName/" + _variable.Identity.Name.ToString() + "/1";
        //    HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
        //    if (_response.IsSuccessStatusCode)
        //    {
        //        var _value = _response.Content.ReadAsStringAsync().Result.ToString();
        //        _obj = JsonConvert.DeserializeObject<LoginUser_model>(_value);
        //    }

        //    return _obj;
        //}

        //---------------------------------BEGIN FORGOT PASSWORD-----------------------------------------------------
        public string ForgotPassowrd(Portal_ForgotPassword_model model)
        {
            string _endpoint = "Account/ForgotPortalPassword";

            var _content_prop = new Dictionary<string, string>
            {
                {"UserName", model.Username },
                {"EmailAddress", model.EmailAddress },
                {"Middlename",  model.Middlename },
                {"BirthDate",  model.Birthdate.ToShortDateString() }
            };

            string _body_content = JsonConvert.SerializeObject(_content_prop);
            HttpContent _content = new StringContent(_body_content, Encoding.UTF8, "application/json");


            HttpResponseMessage _response = _globalRepository.GeneratePostRequest(_endpoint, _content);
            if (_response.IsSuccessStatusCode) { return "Account Located"; }
            else { return "Account not Found"; }
        }
        //---------------------------------END FORGOT PASSWORD-----------------------------------------------------


        //---------------------------------BEGIN RESET PASSWORD-----------------------------------------------------
        public Portal_AccountModel ResetPassword(string _username, string _resetlink)
        {
            string _endpoint = "Account/GetPortalUser/" + _username + "/" + _resetlink;
            Portal_AccountModel _model = new Portal_AccountModel();

            HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
            if (_response.IsSuccessStatusCode)
            {
                var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                _model = JsonConvert.DeserializeObject<Portal_AccountModel>(_value);
            }
            return _model;
        }

        public string ResetPassword(Portal_NewPasswordModel model)
        {
            var _content_prop = new Dictionary<string, string>
                {
                    {"UserID",           model.UserID.ToString() },
                    {"NewPassword",     _globalRepository.Md5HashPassword( model.NewPassword) },
                    {"ConfirmPassword", _globalRepository.Md5HashPassword(  model.ConfirmPassword) }
                };

            string _body_content = JsonConvert.SerializeObject(_content_prop);
            HttpContent _content = new StringContent(_body_content, Encoding.UTF8, "application/json");

            string _endpoint = "Account/ResetPortalPassword";
            HttpResponseMessage _response = _globalRepository.GeneratePostRequest(_endpoint, _content);

            if (_response.IsSuccessStatusCode)
            {
                //ZMGModel.ViewModel.GLOBAL.ReturnedMessageModel _message = new ZMGModel.ViewModel.GLOBAL.ReturnedMessageModel();
                //                _message.HeaderMessage = "Success!";
                //_message.BodyMessage = "We've successfully update your password.";

                return "Success";
            }

            else
            {
                return "New Password and Confirm password did not match.";
            }

        }
        //---------------------------------END RESET PASSWORD-----------------------------------------------------

        public string GetEmployerName(string _username)
        {
            try
            {
                string _employerName = string.Empty;
                
                string _endpoint = "Account/GetEmployerName/" + _username;

                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);

                if (_response.IsSuccessStatusCode)
                {
                    _employerName = _response.Content.ReadAsStringAsync().Result.Replace("\"", "");
                }

                return _employerName;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}