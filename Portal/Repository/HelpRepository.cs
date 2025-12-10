using APWModel.ViewModel.Global;
using APWModel.ViewModel.iSearch;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;

namespace Portal.Repository
{
    public class HelpRepository
    {
        public GlobalRepository _globalrepository { get; set; }
        private int _loginuserid { get; set; }
        private int _candidate_id { get; set; }
        private int _client_id { get; set; }

        public HelpRepository()
        {
            if (_globalrepository == null) { _globalrepository = new GlobalRepository(); }
            if (_loginuserid == 0)
            {
                LoginUser_model _user = _globalrepository.GetLoginUser();
                if (_user != null)
                {
                    _loginuserid = _user.UserId;
                    _candidate_id = _user.CandidateId;
                    _client_id = _user.ClientId;
                }
            }
        }

        public List<HelpModel> GetHelpByApp(int _appid)
        {
            try
            {
                List<HelpModel> _obj = new List<HelpModel>();

                string _endpoint = "Help/App/" +
                    _appid.ToString() + "/" +
                    _client_id.ToString();
                HttpResponseMessage _response = _globalrepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<HelpModel>>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }

        public HelpList_Model GetHelpByApp2(int _appid)
        {
            try
            {
                HelpList_Model _obj = new HelpList_Model();

                string _endpoint = "Help/App2/" +
                    _appid.ToString() + "/" +
                    _client_id.ToString();
                HttpResponseMessage _response = _globalrepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<HelpList_Model>(_value);
                }

                return _obj;
            }
            catch (Exception) { throw; }
        }
    }
}