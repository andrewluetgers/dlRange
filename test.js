var getset = require("./index");


var urlTmpl = "http://lcweb2.loc.gov/service/rbc/rbc0001/2009/2009pre23451/{4}v.jpg";

getset("Natural_Magick-{4}.jpg", urlTmpl, 5, 10, "/SeriesDownloadTest/NaturalMagic", function() {
	console.log("Test Finished!");
});