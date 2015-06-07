var dlRange = require("./index");


var urlTmpl = "http://lcweb2.loc.gov/service/rbc/rbc0001/2009/2009pre23451/{4}v.jpg";

dlRange("Natural_Magick-{4}.jpg", urlTmpl, 1, 10, "/SeriesDownloadTest/NaturalMagic", function() {
	console.log("Test Finished!");
});