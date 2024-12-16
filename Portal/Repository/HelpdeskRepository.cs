using APWModel.ViewModel.Global;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;
using static APWModel.ViewModel.Portal.Helpdesk_model;
using static APWModel.ViewModel.Portal.Helpdesk_model.Comment_model;
using static APWModel.ViewModel.Portal.Helpdesk_model.Monitoring_model;

namespace Portal.Repository
{
    public class HelpdeskRepository
    {
        public GlobalRepository _globalRepository { get; set; }
        private int _loginuserid { get; set; }
        private int _candidate_id { get; set; }

        public HelpdeskRepository()
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

        public List<Concern_model> ConcernMonitoring(int _concerntypeid, string _status, DateTime _datefrom, DateTime _dateto)
        {
            try
            {
                List<Concern_model> _obj = new List<Concern_model>();
             
                string _endpoint = "Helpdesk/PortalMonitoring/" + 
                    _loginuserid.ToString() + "/" +
                    _concerntypeid.ToString() + "/" +
                    _status + "/" +
                    _datefrom.ToShortDateString().Replace("/", "-") + "/" +
                    _dateto.ToShortDateString().Replace("/", "-");
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<Concern_model>>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }

        public ConcernModel GetConcern(int _id)
        {
            try
            {
                ConcernModel _obj = new ConcernModel();

                string _endpoint = "Helpdesk/GetConcern/" + _id.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<ConcernModel>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }

        public string GetConcernStatus(int _id)
        {
            string _result = "";
            try
            {
                
                string _endpoint = "Helpdesk/GetConcernStatus/" + _id.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _result = JsonConvert.DeserializeObject<string>(_value);
                }

                return _result;
            }
            catch (Exception) { throw; }
        }

        public int GetTopConcern(int _concernid)
        {
            int _result = 0;
            try
            {

                string _endpoint = "Helpdesk/GetTopComment/" + _concernid.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _result = JsonConvert.DeserializeObject<int>(_value);
                }

                return _result;
            }
            catch (Exception) { throw; }
        }

        public int ManageConcern(ConcernModel _model, int _mode)
        {
            int _id = 0;
            string _endpoint = "Helpdesk/CreateConcern";
            if (_mode == 1) { _endpoint = "Helpdesk/UpdateConcern"; }
            if (_mode == 2) { _endpoint = "Helpdesk/CancelConcern"; }
            if (_mode == 3) { _endpoint = "Helpdesk/PostConcern"; }
            if (_mode == 4) { _endpoint = "Helpdesk/UnpostConcern"; }
            if (_mode == 7) { _endpoint = "Helpdesk/DeleteConcern"; }


            var _content_prop = new Dictionary<string, string>
            {
                {"Id",                      _model.Id.ToString() },
                {"ConcernTypeId",           _model.ConcernTypeId.ToString() },
                {"Description",             _model.Description.ToString() },
                {"UserId",                  _model.UserId.ToString()},
                {"DateCreated",             _model.DateCreated.ToString() },
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

        //-----------------------------------BEGIN COMMENTS------------------------------
        public List<CommentMonitoring_model> Comments(int _concernid)
        {
            try
            {
                List<CommentMonitoring_model> _obj = new List<CommentMonitoring_model>();

                string _endpoint = "Helpdesk/Comments/" + 
                    _concernid.ToString() + "/" +
                    _loginuserid.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<CommentMonitoring_model>>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }

        public int ManageComment(CommentModel _model)
        {
            int _id = 0;
            string _endpoint = "Helpdesk/CreateComment";

            var _content_prop = new Dictionary<string, string>
            {
                {"Id",                      _model.Id.ToString() },
                {"ConcernId",               _model.ConcernId.ToString() },
                {"Comment",                 _model.Comment.ToString() },
                {"UserId",                  _model.UserId.ToString()},
                {"DateCreated",             _model.DateCreated.ToString() },
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

        public AttachmentModel GetAttachment(int _Id)
        {
            try
            {
                AttachmentModel _obj = new AttachmentModel();

                string _endpoint = "Helpdesk/GetAttachment/" + _Id.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<AttachmentModel>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }


        public int UploadCommentAttachment(AttachmentModel _model)
        {
            int _id = 0;
            string _endpoint = "Helpdesk/UploadCommentAttachment";

            var _content_prop = new Dictionary<string, string>
            {
                {"Id",                      _model.Id.ToString() },
                {"Location",                _model.Location.ToString() },
                {"FileName",                _model.FileName.ToString() },
                {"ContentType",             _model.ContentType.ToString() },
                {"UserId",                  _model.UserId.ToString()},
                {"DateUploaded",            _model.DateUploaded.ToString() },
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
        //-----------------------------------END COMMENTS------------------------------
    }
}