using APWModel.ViewModel.Global;
using Newtonsoft.Json;
using Portal.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using static APWModel.ViewModel.HRMS.Employee.Payroll;

namespace Portal.Repository
{
    public class PayrollRepository
    {
        public GlobalRepository _globalRepository { get; set; }
        private int _loginuserid { get; set; }
        private int _candidate_id { get; set; }

        public PayrollRepository()
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

        public List<PayrollList_model> EmployeePayrolls(string _fromdate, string _todate)
        {
            try
            {
                List<PayrollList_model> _obj = new List<PayrollList_model>();

                string _endpoint = "Payroll/EmployeePayrolls/" +
                    _loginuserid.ToString() + "/" +
                    DateTime.Parse(_fromdate).ToShortDateString().Replace("/", "-") + "/" +
                    DateTime.Parse(_todate).ToShortDateString().Replace("/", "-");
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<PayrollList_model>>(_value);
                }

                return _obj;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<LoanList_model> EmployeeLoans(string _status)
        {
            try
            {
                List<LoanList_model> _obj = new List<LoanList_model>();

                string _endpoint = "Loan/EmployeeLoans/" +
                    _loginuserid.ToString() + "/" +
                    _status;
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<LoanList_model>>(_value);
                }

                return _obj;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<LoanTransactionPayment_model> GetLoanTransactions(int _loanid)
        {
            try
            {
                List<LoanTransactionPayment_model> _obj = new List<LoanTransactionPayment_model>();

                string _endpoint = "Loan/GetLoanTransactions/" +
                    _loanid.ToString();
                HttpResponseMessage _response = _globalRepository.GenerateGetRequest(_endpoint);
                if (_response.IsSuccessStatusCode)
                {
                    var _value = _response.Content.ReadAsStringAsync().Result.ToString();
                    _obj = JsonConvert.DeserializeObject<List<LoanTransactionPayment_model>>(_value);
                }

                return _obj;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}