using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Portal.Models
{
    public class Filtering_model
    {
        public class LoanStatus
        {
            public string Value { get; set; }
            public string Description { get; set; }
        }

        public class ConcernType
        {
            public int Value { get; set; }
            public string Description { get; set; }
        }

        public class ConcernStatus
        {
            public string Value { get; set; }
            public string Description { get; set; }
        }
    }
}