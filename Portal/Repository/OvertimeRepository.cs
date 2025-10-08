using APWModel.ViewModel.Global;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;
using static APWModel.ViewModel.Portal.Overtime_model;

namespace Portal.Repository
{
    public class OvertimeRepository
    {
        public GlobalRepository _globalRepository { get; set; }
        private int _loginuserid { get; set; }
        private int _candidate_id { get; set; }

        public OvertimeRepository()
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

        public OvertimeModel GetOvertime(int _id)
        {
            try
            {
                OvertimeModel _obj = new OvertimeModel();

                string _endpoint = "Overtime/Get/" + _id.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<OvertimeModel>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }


        public List<FiledOvertimeMonitoring_model> GetOvertimeMonitoring(FiledOvertimeMonitoringFilter_model _filter)
        {
            try
            {
                List<FiledOvertimeMonitoring_model> _obj = new List<FiledOvertimeMonitoring_model>();

                string _endpoint = "Overtime/GetOvertimeMonitoring/" + _filter.EmpId.ToString() + "/" +
                    _filter.OTFrom.ToShortDateString().Replace("/", "-") + "/" +
                    _filter.OTTo.ToShortDateString().Replace("/", "-") + "/" +
                    _filter.Status;

                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<FiledOvertimeMonitoring_model>>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }


        public int ManageOvertime(OvertimeModel _model)
        {
            int _id = 0;
            string _endpoint = "Overtime/Manage";   

            var _content_prop = new Dictionary<string, string>
            {
                {"Id",                      _model.Id.ToString() },
                {"EmpId",                   _model.EmpId.ToString() },
                {"ClientId",                _model.ClientId.ToString() },
                {"DateFiled",               _model.DateFiled.ToString()},
                {"OTFrom",                  _model.OTFrom.ToString() },
                {"OTFromTime",              _model.OTFromTime.ToString() },
                {"OTTo",                    _model.OTTo.ToString() },
                {"OTToTime",                _model.OTToTime.ToString() },
                {"OTHours",                 _model.OTHours.ToString() },
                
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
                var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                _id = int.Parse(_value);
            }

            return _id;
        }

        public IEnumerable<Overtime_Minutes> GetMinutes()
        {
            return new List<Overtime_Minutes>() {
                new Overtime_Minutes() { Description = "00", Value = "00" },
                new Overtime_Minutes() { Description = "01", Value = "01"                 },
                new Overtime_Minutes() { Description = "02", Value = "02"                },
                new Overtime_Minutes() { Description = "03", Value = "03"                },
                new Overtime_Minutes() { Description = "04", Value = "04"                },
                new Overtime_Minutes() { Description = "05", Value = "05"                },
                new Overtime_Minutes() { Description = "06", Value = "06"                },
                new Overtime_Minutes() { Description = "07", Value = "07"                },
                new Overtime_Minutes() { Description = "08", Value = "08"                },
                new Overtime_Minutes() { Description = "09", Value = "09"                },
                new Overtime_Minutes() { Description = "10", Value = "10"                },
                new Overtime_Minutes() { Description = "11", Value = "11"                },
                new Overtime_Minutes() { Description = "12", Value = "12"                },
                new Overtime_Minutes() { Description = "13", Value = "13"                },
                new Overtime_Minutes() { Description = "14", Value = "14"                },
                new Overtime_Minutes() { Description = "15", Value = "15"                },
                new Overtime_Minutes() { Description = "16", Value = "16"                },
                new Overtime_Minutes() { Description = "17", Value = "17"                },
                new Overtime_Minutes() { Description = "18", Value = "18"                },
                new Overtime_Minutes() { Description = "19", Value = "19"                },
                new Overtime_Minutes() { Description = "20", Value = "20"                },
                new Overtime_Minutes() { Description = "21", Value = "21"                },
                new Overtime_Minutes() { Description = "22", Value = "22"                },
                new Overtime_Minutes() { Description = "23", Value = "23"                },
                new Overtime_Minutes() { Description = "24", Value = "24"                },
                new Overtime_Minutes() { Description = "25", Value = "25"                },
                new Overtime_Minutes() { Description = "26", Value = "26"                },
                new Overtime_Minutes() { Description = "27", Value = "27"                },
                new Overtime_Minutes() { Description = "28", Value = "28"                },
                new Overtime_Minutes() { Description = "29", Value = "29"                },
                new Overtime_Minutes() { Description = "30", Value = "30"                },
                new Overtime_Minutes() { Description = "31", Value = "31"                },
                new Overtime_Minutes() { Description = "32", Value = "32"                },
                new Overtime_Minutes() { Description = "33", Value = "33"                },
                new Overtime_Minutes() { Description = "34", Value = "34"                },
                new Overtime_Minutes() { Description = "35", Value = "35"                },
                new Overtime_Minutes() { Description = "36", Value = "36"                },
                new Overtime_Minutes() { Description = "37", Value = "37"                },
                new Overtime_Minutes() { Description = "38", Value = "38"                },
                new Overtime_Minutes() { Description = "39", Value = "39"                },
                new Overtime_Minutes() { Description = "40", Value = "40"                },
                new Overtime_Minutes() { Description = "41", Value = "41"                },
                new Overtime_Minutes() { Description = "42", Value = "42"                },
                new Overtime_Minutes() { Description = "43", Value = "43"                },
                new Overtime_Minutes() { Description = "44", Value = "44"                },
                new Overtime_Minutes() { Description = "45", Value = "45"                },
                new Overtime_Minutes() { Description = "46", Value = "46"                },
                new Overtime_Minutes() { Description = "47", Value = "47"                },
                new Overtime_Minutes() { Description = "48", Value = "48"                },
                new Overtime_Minutes() { Description = "49", Value = "49"                },
                new Overtime_Minutes() { Description = "50", Value = "50"                },
                new Overtime_Minutes() { Description = "51", Value = "51"                },
                new Overtime_Minutes() { Description = "52", Value = "52"                },
                new Overtime_Minutes() { Description = "53", Value = "53"                },
                new Overtime_Minutes() { Description = "54", Value = "54"                },
                new Overtime_Minutes() { Description = "55", Value = "55"                },
                new Overtime_Minutes() { Description = "56", Value = "56"                },
                new Overtime_Minutes() { Description = "57", Value = "57"                },
                new Overtime_Minutes() { Description = "58", Value = "58"                },
                new Overtime_Minutes() { Description = "59", Value = "59"                },
            };
        }

        public IEnumerable<Overtime_Hours> GetHours()
        {
            return new List<Overtime_Hours>() {
                new Overtime_Hours() { Description = "01", Value = "01" },
                new Overtime_Hours() { Description = "02", Value = "02" },
                new Overtime_Hours() { Description = "03", Value = "03" },
                new Overtime_Hours() { Description = "04", Value = "04" },
                new Overtime_Hours() { Description = "05", Value = "05" },
                new Overtime_Hours() { Description = "06", Value = "06" },
                new Overtime_Hours() { Description = "07", Value = "07" },
                new Overtime_Hours() { Description = "08", Value = "08" },
                new Overtime_Hours() { Description = "09", Value = "09" },
                new Overtime_Hours() { Description = "10", Value = "10" },
                new Overtime_Hours() { Description = "11", Value = "11" },
                new Overtime_Hours() { Description = "12", Value = "12" }
            };
        }

        public IEnumerable<Overtime_AMPM> GetAMPM()
        {
            return new List<Overtime_AMPM>() {
                new Overtime_AMPM() { Description = "AM", Value = "AM" },
                new Overtime_AMPM(){ Description = "PM", Value = "PM" }
            };
        }

        public IEnumerable<Overtime_Status> GetStatus()
        {
            return new List<Overtime_Status>() {
                new Overtime_Status() { Description = "All", Value = "All" },
                new Overtime_Status(){ Description = "Approved", Value = "Approved" },
                new Overtime_Status(){ Description = "Rejected", Value = "Rejected" },
                new Overtime_Status(){ Description = "Posted", Value = "Posted" },
                new Overtime_Status(){ Description = "Unposted", Value = "Unposted" },
                new Overtime_Status(){ Description = "Cancelled", Value = "Cancelled" },
            };
        }

        public ShiftThisDay GetShift(int _empid, DateTime _datelog)
        {
            try
            {
                ShiftThisDay _obj = new ShiftThisDay();

                string _endpoint = "Overtime/GetShift/" + _empid.ToString() +
                    "/" + _datelog.ToShortDateString().Replace("/", "-");
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<ShiftThisDay>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }
    }
}