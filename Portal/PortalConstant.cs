using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace Portal
{
    public class PortalConstant
    {
        
        public static string BaseAddress = ConfigurationManager.AppSettings["_BaseAddress"].ToString();
        public static string _ReportPath = ConfigurationManager.AppSettings["_ReportPath"].ToString();
        public static string GeneratedFormPath = ConfigurationManager.AppSettings["_GeneratedFormPath"].ToString();
        public static string ActualGeneratedFormPath = ConfigurationManager.AppSettings["_ActualGeneratedFormPath"].ToString();
        public static string RootPath = ConfigurationManager.AppSettings["_RootPath"].ToString();

        public static string ServerName = ConfigurationManager.AppSettings["_ServerName"].ToString();
        public static string DatabaseName = ConfigurationManager.AppSettings["_DatabaseName"].ToString();
        public static string dbpassword = ConfigurationManager.AppSettings["_Password"].ToString();
        public static string Username = ConfigurationManager.AppSettings["_Username"].ToString();


        public static string GeoLocationKey = ConfigurationManager.AppSettings["_GeoLocationKey"].ToString();
        public static string GeoLocationURL = ConfigurationManager.AppSettings["_GeoLocationURL"].ToString();

        public static string HomeMobileCountryCode = ConfigurationManager.AppSettings["_HomeMobileCountryCode"].ToString();
        public static string HomeMobileNetworkCode = ConfigurationManager.AppSettings["_HomeMobileNetworkCode"].ToString();
        public static string RadioType = ConfigurationManager.AppSettings["_RadioType"].ToString();
        public static string Carrier = ConfigurationManager.AppSettings["_Carrier"].ToString();
        public static string ConsiderIP = ConfigurationManager.AppSettings["_ConsiderIP"].ToString();
    }
}