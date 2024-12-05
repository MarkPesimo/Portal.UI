using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Portal.Models
{
    public class ReturnedMessageModel
    {
        public string HeaderMessage { get; set; }
        public string BodyMessage { get; set; }

        public ReturnedMessageModel()
        {
            HeaderMessage = "";
            BodyMessage = "";
        }
    }
}