using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Portal.Models
{
    public class GeoLocation
    {
        public class GeolocationResponse
        {
            public Location location { get; set; }
            public double accuracy { get; set; }
        }

        public class Location
        {
            public double lat { get; set; }
            public double lng { get; set; }
        }
    }
}