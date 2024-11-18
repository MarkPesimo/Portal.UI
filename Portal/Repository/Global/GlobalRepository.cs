using APWModel.ViewModel.Global;
using APWModel.ViewModel.Global.Account;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Security;

namespace Portal.Repository.Global
{
    public class GlobalRepository
    {
        //================================BEGIN REQUEST============================================
        public HttpResponseMessage GenerateGetRequest(string _endpoint)
        {
            try
            {
                HttpClient client = new HttpClient();

                client.BaseAddress = new Uri(PortalConstant.BaseAddress);
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", SecretKeys.PORTAL_TOKEN); // 150:kuto:894ea5ac-7395-4e4f-93c5-32c28e028c44");

                HttpResponseMessage _response = client.GetAsync(_endpoint).Result;

                return _response;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public HttpResponseMessage GeneratePostRequest(string _endpoint, HttpContent _content = null)
        {
            try
            {
                HttpClient client = new HttpClient();

                client.BaseAddress = new Uri(PortalConstant.BaseAddress);
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", SecretKeys.PORTAL_TOKEN); // 150:kuto:894ea5ac-7395-4e4f-93c5-32c28e028c44");

                HttpResponseMessage _response = new HttpResponseMessage();

                _response = client.PostAsync(_endpoint, _content).Result;

                return _response;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public HttpResponseMessage GeneratePostRequest(string _endpoint)
        {
            try
            {
                HttpClient client = new HttpClient();

                client.BaseAddress = new Uri(PortalConstant.BaseAddress);
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", SecretKeys.PORTAL_TOKEN); // 150:kuto:894ea5ac-7395-4e4f-93c5-32c28e028c44");

                HttpResponseMessage _response = new HttpResponseMessage();

                _response = client.PostAsync(_endpoint, null).Result;

                return _response;
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        //================================END REQUEST============================================


        //================================BEGIN SECURITY============================================

 
        public string Dcrypt(string _password)
        {
            byte[] ascii = Encoding.ASCII.GetBytes(_password);
            string _dcrypt = "";
            int _ctr = 1;
            int _prev = 0;

            foreach (Byte b in ascii)
            {
                if (_ctr % 2 == 0)
                {
                    int _var;
                    if (Convert.ToChar(_prev).ToString() == "n")
                    {
                        _var = b * 2;
                        _dcrypt = _dcrypt + Convert.ToChar(_var).ToString();
                    }
                    else
                    {
                        _var = b - 1;
                        _dcrypt = _dcrypt + Convert.ToChar(_var).ToString();
                    }
                }
                else
                {
                    _prev = b;
                }
                _ctr++;
            }
            return _dcrypt;
        }

        public string Md5HashPassword(string _value)
        {
            var md5Hasher = MD5.Create();

            var data = md5Hasher.ComputeHash(Encoding.Default.GetBytes(_value));
            var sBuilder = new StringBuilder();
            for (var i = 0; i < data.Length; i++)
            {
                sBuilder.Append(data[i].ToString("x2"));
            }
            return sBuilder.ToString();
        }

        public string PasswordHasher(string _keyword)
        {
            UnicodeEncoding Ue = new UnicodeEncoding();

            byte[] ByteSourceText = Ue.GetBytes(_keyword);
            MD5CryptoServiceProvider Md5 = new MD5CryptoServiceProvider();
            byte[] ByteHash = Md5.ComputeHash(ByteSourceText);
            return Convert.ToBase64String(ByteHash);
        }
         
        public List<String> GetModelErrors(System.Web.Mvc.ModelStateDictionary _modelstate)
        {
            List<string> _errors = new List<string>();

            int _cnt = 0;
            foreach (var item in _modelstate.Values)
            {
                var _elementname = _modelstate.Keys.ToList();
                if (item.Errors.Count != 0)
                {
                    _errors.Add(_elementname[_cnt]);
                    _errors.Add(item.Errors[0].ErrorMessage);
                    break;
                }
                _cnt++;
            }

            return _errors;
        }
        //================================END SECURITY============================================

    }
}