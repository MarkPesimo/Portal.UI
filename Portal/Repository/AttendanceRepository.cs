using APWModel.ViewModel.Global;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;
using static APWModel.ViewModel.Portal.Attendance_model;
using static APWModel.ViewModel.Portal.DTR_model;

namespace Portal.Repository
{
    public class AttendanceRepository
    {
        public GlobalRepository _globalRepository { get; set; }
        private int _loginuserid { get; set; }
        private int _candidate_id { get; set; }

        public AttendanceRepository()
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

        public AttendanceToday_model GetPortalClockInOut()
        {
            try
            {
                AttendanceToday_model _obj = new AttendanceToday_model();

                string _endpoint = "Attendance/GetPortalClockInOut/" + _loginuserid.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<AttendanceToday_model>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }


        public AttendanceToday_model GetPortalPreviousClockIn()
        {
            try
            {
                AttendanceToday_model _obj = new AttendanceToday_model();

                string _endpoint = "Attendance/GetPortalPreviousClockIn/" + _loginuserid.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<AttendanceToday_model>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }


        public bool ClockInClockOut(ClockInClockOut_model _model)
        {
            bool _result = false;
            string _endpoint = "Attendance/ClockInClockOut";

            if (_model.Latitude == null) { _model.Latitude = "0"; }
            if (_model.Longitude == null) { _model.Longitude = "0"; }

            var _content_prop = new Dictionary<string, string>
            {
                {"Id",                      _model.Id.ToString() },
                {"Type",                    _model.Type.ToString() },
                {"EmpID",                   _model.EmpID.ToString() },
                {"ShiftId",                 _model.ShiftId.ToString()},
                {"Latitude",                 _model.Latitude.ToString()},
                {"Longitude",                 _model.Longitude.ToString()},
            };

            string _body_content = JsonConvert.SerializeObject(_content_prop);
            HttpContent _content = new StringContent(_body_content, Encoding.UTF8, "application/json");

            HttpResponseMessage _response = _globalRepository.GeneratePostRequest(_endpoint, _content);
            if (_response.IsSuccessStatusCode)
            {
                var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                _result = bool.Parse(_value);
            }

            return _result;
        }

        public List<ClockInOutList_model> GetClockInOut(DateTime _datefrom, DateTime _dateto)
        {
            try
            {
                List<ClockInOutList_model> _obj = new List<ClockInOutList_model>();

                string _endpoint = "Attendance/GetClockInOutList/" + _loginuserid.ToString() + "/" +
                    _datefrom.ToShortDateString().Replace("/" , "-") + "/" +
                    _dateto.ToShortDateString().Replace("/", "-");
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<ClockInOutList_model>>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }

        //------------------------------------------BEGIN ATTENDANCE CORRECTION----------------------------------
        public List<CorrectionList_model> GetAttendanceCorrectionList(DateTime _datefrom, DateTime _dateto, string _status)
        {
            try
            {
                List<CorrectionList_model> _obj = new List<CorrectionList_model>();

                string _endpoint = "Attendance/GetAttendanceCorrectionList/" + _loginuserid.ToString() + "/" +
                    _datefrom.ToShortDateString().Replace("/", "-") + "/" +
                    _dateto.ToShortDateString().Replace("/", "-") + "/" +
                    _status;
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<CorrectionList_model>>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }

        public DefaultShift GetDefaultShift()
        {
            try
            {
                DefaultShift _obj = new DefaultShift();

                string _endpoint = "Attendance/GetDefaultShift/" + _loginuserid.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<DefaultShift>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }

        public Correction_model GetAttendanceCorrection(int _id)
        {
            try
            {
                Correction_model _obj = new Correction_model();

                string _endpoint = "Attendance/GetAttendanceCorrection/" + _id.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<Correction_model>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }

        public int ManageAttendanceCorrection(Correction_model _model, int _mode)
            {
            int _id = 0;
            string _endpoint = "Attendance/AddCorrection";
            if (_mode == 1) { _endpoint = "Attendance/EditCorrection"; }
            if (_mode == 2) { _endpoint = "Attendance/CancelCorrection"; }
            if (_mode == 3) { _endpoint = "Attendance/PostCorrection"; }
            if (_mode == 4) { _endpoint = "Attendance/UnpostCorrection"; }
            if (_mode == 5) { _endpoint = "Attendance/ApprovCorrection"; }
            if (_mode == 6) { _endpoint = "Attendance/RejectCorrection"; }
            if (_model.Remarks == null) { _model.Remarks = ""; }

            var _content_prop = new Dictionary<string, string>
            {
                {"Id",                      _model.Id.ToString() },
                {"DateLog",                 _model.DateLog.ToString() },
                {"EmpId",                   _model.EmpId.ToString() },
                {"ShiftId",                 _model.ShiftId.ToString() },                
                {"TimeInDate",              _model.TimeInDate.ToString() },
                {"TimeInTime",              _model.TimeInTime.ToString() },
                {"TimeOutDate",             _model.TimeOutDate.ToString() },
                {"TimeOutTime",             _model.TimeOutTime.ToString() },
                {"Reason",                  _model.Reason.ToString() },
                {"Remarks",                 _model.Remarks.ToString() },
                {"UserId",                  _model.UserId.ToString() }
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
        //------------------------------------------END ATTENDANCE CORRECTION----------------------------------

        //------------------------------------------BEGIN DTR----------------------------------
        public List<DTRList_model> GetdtrList(DateTime _datefrom, DateTime _dateto, string _status)
        {
            try
            {
                List<DTRList_model> _obj = new List<DTRList_model>();

                string _endpoint = "Attendance/GetDTRList/" + _loginuserid.ToString() + "/" +
                    _datefrom.ToShortDateString().Replace("/", "-") + "/" +
                    _dateto.ToShortDateString().Replace("/", "-") + "/" +
                    _status;
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<DTRList_model>>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }

        public List<APWModel.ViewModel.Portal.DTR_model.DTRDetail_model> GetDTRDetails(int _id)
        {
            try
            {
                List<APWModel.ViewModel.Portal.DTR_model.DTRDetail_model> _obj = new List<APWModel.ViewModel.Portal.DTR_model.DTRDetail_model>();

                string _endpoint = "Attendance/GetDTRDetails/" + _id.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<APWModel.ViewModel.Portal.DTR_model.DTRDetail_model>>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }


        public int ManageDTR(DTRmodel _model)
        {
            int _id = 0;
            string _endpoint = "Attendance/ManageDTR";
            if (_model.Remarks == null) { _model.Remarks = ""; }

            var _content_prop = new Dictionary<string, string>
            {
                {"Id",                  _model.Id.ToString() },
                {"EmpId",               _model.EmpId.ToString() },
                {"Description",         _model.Description.ToString() },
                {"DateFrom",            _model.DateFrom.ToString() },
                {"Dateto",              _model.Dateto.ToString() },
                {"DateCreated",         _model.DateCreated.ToString() },
                {"UserId",              _model.UserId.ToString() },
                {"Mode",                _model.Mode.ToString() }
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

        public DTRmodel GetDTR(int _id)
        {
            try
            {
                DTRmodel _obj = new DTRmodel();

                string _endpoint = "Attendance/Getdtr/" + _id.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<DTRmodel>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }
        //------------------------------------------END DTR----------------------------------
    }
}