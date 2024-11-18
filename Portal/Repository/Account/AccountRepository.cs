using APWModel.ViewModel.Global;
using APWModel.ViewModel.Global.Account;
using Newtonsoft.Json;
using Portal.Repository.Global;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Security;

namespace Portal.Repository.Account
{
    public class AccountRepository
    {
        public GlobalRepository _globalRepository { get; set; }

        public AccountRepository()
        {
            if (_globalRepository == null) { _globalRepository = new GlobalRepository(); }
        }

        public string Login(LoginModel model)
        {
            
            //string _hash_password = _globalRepository.Md5HashPassword(model.Password);
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

        public LoginUser_model GetLoginUser()       //HttpCookie authCookie
        {
            var _variable = System.Web.HttpContext.Current.User;
            LoginUser_model _obj = new LoginUser_model();
            string _endpoint = "Account/GetByUserName/" + _variable.Identity.Name.ToString() + "/1";
            HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
            if (_response.IsSuccessStatusCode)
            {
                var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                _obj = JsonConvert.DeserializeObject<LoginUser_model>(_value);
            }
            
            return _obj;
        }

        public string ChangePassword(ChangePassword_model _model)
        {
            string _result = "";
            string _endpoint = "Account/ChangePassword";

            string _current_password = _globalRepository.PasswordHasher(_model.CurrentPassword);
            string _new_password = _globalRepository.PasswordHasher(_model.NewPassword);
            string _confirm_password = _globalRepository.PasswordHasher(_model.ConfirmPassword);

            var _content_prop = new Dictionary<string, string>
            {
                {"Id",                      _model.Id.ToString() },
                {"CurrentPassword",         _current_password },
                {"NewPassword",             _new_password },
                {"ConfirmPassword",         _confirm_password }
            };

            string _body_content = JsonConvert.SerializeObject(_content_prop);
            HttpContent _content = new StringContent(_body_content, Encoding.UTF8, "application/json");

            HttpResponseMessage _response = _globalRepository.GeneratePostRequest(_endpoint, _content);
            if (_response.IsSuccessStatusCode)
            {
                var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                _result = ""; // _id = int.Parse(_value);
            }
            else
            {
                _result = "Encoded current password does not match your Current password.";
            }

            return _result;
        }
    }
}