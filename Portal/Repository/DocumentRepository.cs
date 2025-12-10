using APWModel.ViewModel.Portal;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;
using static APWModel.ViewModel.HRMS.Employee.EmployeeDocument_model;

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
            string _endpoint = "Employee/NotifyCOEGeneration";
            var _content_prop = new Dictionary<string, string>
            {
                {"EmpId", _loginuserid.ToString() },
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

        public List<RequiredDocument_model> GetRequiredDocuments(int _candidateid)
        {
            try
            {
                List<RequiredDocument_model> _obj = new List<RequiredDocument_model>();
                string _endpoint = "Candidate/GetRequiredDocuments/" +
                    _candidateid.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<RequiredDocument_model>>(_value);


                }
                return _obj;
            }
            catch (Exception ex)
            {
                throw;
            }            
        }

        public List<PortalRequiredDocument_model> GetRequiredDocumentsCmb()
        {
            try
            {
                List<PortalRequiredDocument_model> _obj = new List<PortalRequiredDocument_model>();
                string _endpoint = "RequiredDocument/GetRequiredDocuments/";
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<PortalRequiredDocument_model>>(_value);


                }
                return _obj;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public int ManagePortalRequiredDocument(PortalRequiredDocument_model _model)
        {
            int _id = 0;
            string _endpoint = "RequiredDocument/ManagePortalRequiredDocument";

            string _body_content = JsonConvert.SerializeObject(_model);
           
            HttpContent _content = new StringContent(_body_content, Encoding.UTF8, "application/json");

            HttpResponseMessage _response = _globalRepository.GeneratePostRequest(_endpoint, _content);
            if (_response.IsSuccessStatusCode)
            {
                var _value = _response.Content.ReadAsStringAsync().Result;
                _id = int.Parse(_value);
            }
            else
            {
                var errorMessage = _response.Content.ReadAsStringAsync().Result;
                throw new Exception(errorMessage);
            }

            return _id;
        }
    }
}