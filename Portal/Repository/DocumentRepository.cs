using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;

namespace Portal.Repository
{
    public class DocumentRepository
    {
        public GlobalRepository _globalRepository { get; set; }
        private int _loginuserid = 0;

        public DocumentRepository()
        {
            if (_globalRepository == null) { _globalRepository = new GlobalRepository(); }
            if (_loginuserid == 0) { _loginuserid = _globalRepository.GetLoginUser().UserId; }
        }

        public bool CheckGenerateCOE()
        {
            string _endpoint = "Employee/CanGenerateCOE/" +
             _loginuserid.ToString() ;
            HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
            if (_response.IsSuccessStatusCode)
            {
                var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                bool _obj = JsonConvert.DeserializeObject<bool>(_value);

                return _obj;
            }

            return false;
        }
        public bool SaveCOEGeneration(string _reason, string _filename )
        {
            string _endpoint = "Employee/SaveCOEGeneration";

            var _content_prop = new Dictionary<string, string>
            {
                {"EmpId", _loginuserid.ToString() },
                {"Reason", _reason },
                {"Filename",  _filename }
            };


            string _body_content = JsonConvert.SerializeObject(_content_prop);
            HttpContent _content = new StringContent(_body_content, Encoding.UTF8, "application/json");
            
            HttpResponseMessage _response = _globalRepository.GeneratePostRequest(_endpoint, _content);
            if (_response.IsSuccessStatusCode)
            {
                var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                bool _obj = JsonConvert.DeserializeObject<bool>(_value);

                return _obj;
            }
            
            return false;            
        }

        public bool NotifyCOEGeneration(string _filename)
        {
            string _endpoint = "Employee/NotifyCOEGeneration/" +
                _loginuserid.ToString() + "/" +
                _filename;
            HttpResponseMessage _response = _globalRepository.GeneratePostRequest(_endpoint);
            if (_response.IsSuccessStatusCode)
            {
                var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                bool _obj = JsonConvert.DeserializeObject<bool>(_value);

                return _obj;
            }
            
            return false;
        }
    }
}