using APWModel.ViewModel.Global;
using APWModel.ViewModel.Portal;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;

namespace Portal.Repository
{
    public class ProfileRepository
    {
        public GlobalRepository _globalRepository { get; set; }
        private int _loginuserid { get; set; }
        private int _candidate_id { get; set; }

        public ProfileRepository()
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

        public Profile_model GetPortalProfile()
        {
            try
            {
                Profile_model _obj = new Profile_model();

                string _endpoint = "Employee/PortalProfile/" +
                    _loginuserid.ToString() + "/" +
                    _candidate_id.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<Profile_model>(_value);
                }

                return _obj;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public int UpdatePortalProfile(PortalPersonalinfo_model _model, int _mode)
        {
            int _id = 0;
            string _endpoint = "Employee/UpdatePortalProfile";
            if (_mode == 1) { _endpoint = "Employee/UpdatePendingPortalProfile"; }

            
            var _content_prop = new Dictionary<string, string>
            {
                {"RequestId",               _model.RequestId.ToString() },
                {"EmpId",                   _model.EmpId.ToString() },
                {"CandidateId",             _model.CandidateId.ToString() },
                {"EmpNo",                   _model.EmpNo.ToString()},
                {"FirstName",               _model.FirstName.ToString() },
                {"LastName",                _model.LastName.ToString() },
                {"MiddleName",              _model.MiddleName.ToString() },
                {"Position",                _model.Position.ToString()    },
                {"CivilStatus",             _model.CivilStatus.ToString() },
                {"Gender",                  _model.Gender.ToString() },
                {"BirthDay",                _model.BirthDay.ToString() },
                {"DateHired",               _model.DateHired.ToString()},
                {"Address",                 _model.Address.ToString() },
                {"ContactNo",               _model.ContactNo.ToString() },
                {"EmailAddress",            _model.EmailAddress.ToString() },
            };

            string _body_content = JsonConvert.SerializeObject(_content_prop);
            HttpContent _content = new StringContent(_body_content, Encoding.UTF8, "application/json");

            HttpResponseMessage _response = _globalRepository.GeneratePostRequest(_endpoint, _content);
            if (_response.IsSuccessStatusCode)
            {
                var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                _id = int.Parse(_value);
            }

            return _id;
        }
    }
}