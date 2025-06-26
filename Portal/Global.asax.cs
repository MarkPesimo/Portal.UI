using APWModel.ViewModel.Global;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Script.Serialization;
using System.Web.Security;

namespace Portal
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        protected void Application_PostAuthenticateRequest(Object sender, EventArgs e)
        {
            HttpCookie authCookie = Request.Cookies[FormsAuthentication.FormsCookieName];

            try
            {
                if (authCookie != null)
                {
                    FormsAuthenticationTicket authTicket = FormsAuthentication.Decrypt(authCookie.Value);

                    JavaScriptSerializer serializer = new JavaScriptSerializer();

                    Serialize_LoginUser_model serializeModel = serializer.Deserialize<Serialize_LoginUser_model>(authTicket.UserData);

                    if (serializeModel != null)
                    {
                        ContextLoginUser_model newUser = new ContextLoginUser_model(authTicket.Name);
                        newUser.UserId = serializeModel.UserId;
                        newUser.CandidateId = serializeModel.CandidateId;
                        newUser.Username = serializeModel.Username;
                        newUser.Usertype = serializeModel.Usertype;
                        newUser.ClientId = serializeModel.ClientId;

                        newUser.PayrollMenuVisibility = serializeModel.PayrollMenuVisibility;
                        newUser.DocumentMenuVisibility = serializeModel.DocumentMenuVisibility;
                        newUser.HelpdeskMenuVisibility = serializeModel.HelpdeskMenuVisibility;
                        newUser.OvertimeMenuVisibility = serializeModel.OvertimeMenuVisibility;
                        newUser.LeaveMenuVisibility = serializeModel.LeaveMenuVisibility;
                        newUser.AttendanceMenuVisibility = serializeModel.AttendanceMenuVisibility;

                        HttpContext.Current.User = newUser;
                    }
                }
            }
            catch (Exception ex)
            {

                throw;
            }

        }
    }
}
