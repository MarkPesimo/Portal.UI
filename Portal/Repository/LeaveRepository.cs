using APWModel.ViewModel.Global;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;
using static APWModel.ViewModel.Portal.Leave_model;

namespace Portal.Repository
{
    public class LeaveRepository
    {
        public GlobalRepository _globalRepository { get; set; }
        private int _loginuserid { get; set; }
        private int _candidate_id { get; set; }

        public LeaveRepository()
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


        public List<LeaveMonitoring_model> GetLeaveMonitoring(LeaveMonitoringFilter_model _filter)
        {
            try
            {
                List< LeaveMonitoring_model> _obj = new List<LeaveMonitoring_model>();

                string _endpoint = "Leave/GetLeaveMonitoring/" + _filter.EmpId.ToString() + "/" +
                    _filter.LeaveTypeId.ToString() + "/" +
                    _filter.LeaveFrom.ToShortDateString().Replace("/", "-") + "/" +
                    _filter.LeaveTo.ToShortDateString().Replace("/", "-") ;

                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<LeaveMonitoring_model>>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }

        public LeaveBalance_model GetLeaveBalance(int _leavetypeid)
        {
            try
            {
                LeaveBalance_model _obj = new LeaveBalance_model();

                string _endpoint = "Leave/GetLeaveBalance/" + _loginuserid.ToString() + "/" +
                    _leavetypeid.ToString() ;

                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<LeaveBalance_model>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }

        public int ManageLeave(LeaveModel _model)
        {
            int _id = 0;
            string _endpoint = "Leave/ManageLeave";
            //if (_mode == 1) { _endpoint = "Leave/Update"; }
            //if (_mode == 2) { _endpoint = "Leave/Cancel"; }
            //if (_mode == 3) { _endpoint = "Leave/Post"; }
            //if (_mode == 4) { _endpoint = "Leave/Unpost"; }
            //if (_mode == 5) { _endpoint = "Leave/Approv"; }
            //if (_mode == 6) { _endpoint = "Leave/Reject"; }


            var _content_prop = new Dictionary<string, string>
            {
                {"Id",                      _model.Id.ToString() },
                {"EmpId",                   _model.EmpId.ToString() },
                {"LeaveTypeId",             _model.LeaveTypeId.ToString() },
                {"EmergencyLeave",          _model.EmergencyLeave.ToString() },
                {"DateFiled",               _model.DateFiled.ToString()},
                {"LeaveFrom",               _model.LeaveFrom.ToString() },
                {"LeaveFromAMPM",           _model.LeaveFromAMPM.ToString() },
                {"LeaveTo",                 _model.LeaveTo.ToString() },
                {"LeaveToAMPM",             _model.LeaveToAMPM.ToString() },
                {"LeaveDays",               _model.LeaveDays.ToString() },
                {"IsHalfday",               _model.IsHalfday.ToString() },
                {"FirstHalf",               _model.FirstHalf.ToString() },
                {"SecondHalf",              _model.SecondHalf.ToString() },
                {"FirstDay_SecondHalf",     _model.FirstDay_SecondHalf.ToString() },
                {"LastDay_FirstHalf",       _model.LastDay_FirstHalf.ToString() },
                {"Reason",                  _model.Reason.ToString() },
                {"Remarks",                 _model.Remarks.ToString() },
                {"Mode",                    _model.Mode.ToString() },
                {"Message",                 _model.Message.ToString() },
                {"UserId",                  _model.UserId.ToString() },
            };

            string _body_content = JsonConvert.SerializeObject(_content_prop);
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

        public LeaveModel GetLeave(int _id)
        {
            try
            {
                LeaveModel _obj = new LeaveModel();

                string _endpoint = "Leave/Get/" + _id.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<LeaveModel>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }
    }
}