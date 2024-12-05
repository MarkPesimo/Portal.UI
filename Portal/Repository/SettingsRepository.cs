using APWModel.ViewModel.Global.Account;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;

namespace Portal.Repository
{
    public class SettingsRepository
    {
        public GlobalRepository _globalRepository { get; set; }
        private int _loginuserid = 0;

        public SettingsRepository()
        {
            if (_globalRepository == null) { _globalRepository = new GlobalRepository(); }
            if (_loginuserid == 0) { _loginuserid = _globalRepository.GetLoginUser().UserId; }
        }

        public string ChangePassword(Portal_ChangePasswordModel _model)
        {
            string _result = "";
            string _endpoint = "Account/UpdatePortalPassword";

            string _current_password = _globalRepository.Md5HashPassword(_model.Password);
            string _new_password = _globalRepository.Md5HashPassword(_model.NewPassword);
            string _confirm_password = _globalRepository.Md5HashPassword(_model.ConfirmPassword);

            if (_new_password != _confirm_password)
            {
                return "New Password must be same with Confirm Password.";
            }

            var _content_prop = new Dictionary<string, string>
            {
                {"EmpId",                      _model.EmpId.ToString() },
                {"Password",                _current_password },
                {"NewPassword",             _new_password },
                {"ConfirmPassword",         _confirm_password }
            };

            string _body_content = JsonConvert.SerializeObject(_content_prop);
            HttpContent _content = new StringContent(_body_content, Encoding.UTF8, "application/json");

            HttpResponseMessage _response = _globalRepository.GeneratePostRequest(_endpoint, _content);
            if (_response.IsSuccessStatusCode)
            {
                var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                _result = "Success"; // _id = int.Parse(_value);
            }
            else
            {
                _result = "Encoded current password does not match your Current password.";
            }

            return _result;
        }

        public Portal_AccountSetup_Model AccountSetup()
        {
            string _endpoint = "Account/PortalAccountSetup/" + _loginuserid;
            HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
            if (_response.IsSuccessStatusCode)
            {
                var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                Portal_AccountSetup_Model _obj = JsonConvert.DeserializeObject<Portal_AccountSetup_Model>(_value);

                return _obj;
            }
            else
            {
                return null;
            }
        }

        public string UpdateAccountSetup(Portal_AccountSetup_Model model)
        {
            string _endpoint = "Account/PortalAccountSetup";
            var _content_prop = new Dictionary<string, string>
            {
                {"EmpId", model.EmpId.ToString() },
                {"Username", model.Username },
                {"EmailAddress",  model.EmailAddress }
            };

            string _body_content = JsonConvert.SerializeObject(_content_prop);
            HttpContent _content = new StringContent(_body_content, Encoding.UTF8, "application/json");


            HttpResponseMessage _response = _globalRepository.GeneratePostRequest(_endpoint, _content);
            if (_response.IsSuccessStatusCode)
            {
                return "Success";
            }
            else
            {
                return "Error";
            }
        }
    }
}