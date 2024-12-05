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
        public static string ReportPath = ConfigurationManager.AppSettings["_ReportPath"].ToString();
        public static string RootPath = ConfigurationManager.AppSettings["_RootPath"].ToString();

        public static string ServerName = ConfigurationManager.AppSettings["_ServerName"].ToString();
        public static string DatabaseName = ConfigurationManager.AppSettings["_DatabaseName"].ToString();
        public static string dbpassword = ConfigurationManager.AppSettings["_Password"].ToString();
        public static string Username = ConfigurationManager.AppSettings["_Username"].ToString();

    }
}