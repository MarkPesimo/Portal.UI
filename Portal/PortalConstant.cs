using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace Portal
{
    public class PortalConstant
    {

        public static string BaseAddress = ConfigurationManager.AppSettings["_BaseAddress"];
        public static string _ReportPath = ConfigurationManager.AppSettings["_ReportPath"];
        public static string GeneratedFormPath = ConfigurationManager.AppSettings["_GeneratedFormPath"];
        public static string ActualGeneratedFormPath = ConfigurationManager.AppSettings["_ActualGeneratedFormPath"];
        public static string RootPath = ConfigurationManager.AppSettings["_RootPath"];
        public static string AnnouncementAttachment = ConfigurationManager.AppSettings["_AnnouncementAttachment"];

        public static string ServerName = ConfigurationManager.AppSettings["_ServerName"];
        public static string DatabaseName = ConfigurationManager.AppSettings["_DatabaseName"];
        public static string dbpassword = ConfigurationManager.AppSettings["_Password"];
        public static string Username = ConfigurationManager.AppSettings["_Username"];

        public static string GeoLocationKey = ConfigurationManager.AppSettings["_GeoLocationKey"];
        public static string GeoLocationURL = ConfigurationManager.AppSettings["_GeoLocationURL"];

        public static string HomeMobileCountryCode = ConfigurationManager.AppSettings["_HomeMobileCountryCode"];
        public static string HomeMobileNetworkCode = ConfigurationManager.AppSettings["_HomeMobileNetworkCode"];
        public static string RadioType = ConfigurationManager.AppSettings["_RadioType"];
        public static string Carrier = ConfigurationManager.AppSettings["_Carrier"];
        public static string ConsiderIP = ConfigurationManager.AppSettings["_ConsiderIP"];
    }
}