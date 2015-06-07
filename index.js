
var fs = require('fs'),
	request = require('request'),
	async = require('async'),
	dot = require('dot'),
	zeroFill = require('zero-fill'),
	isnan = require('lodash.isnan'),
	range = require('lodash.range'),
	mkdirp = require('mkdirp'),
	osenv = require('osenv');


dot.templateSettings = {
	interpolate: /\{([\s\S]+?)\}/g,
	varname: 'n'
};

/**
 *
 * @param nameTmpl String - template of the file name something like myFile{n}.pdf or myFile{5}.txt
 * were the number represents how many digits to zero-pad, will be replaced with the current number value
 * @param urlTmpl String - same as above but for the url to fetch
 * @param rangeStart Number - start url series at this number
 * @param rangeEnd Number - end url series at this number
 * @param basePath String - folder path in the user home dir to save files trailing / are not required
 * @param finished Function(err, downloaded, failed) - optional function to call finished
 * will be passed the error if one exists and arrays of successful and failed urls
 */
module.exports = function(nameTmpl, urlTmpl, rangeStart, rangeEnd, basePath, finished) {
	var max = 5 || max,
		tmplRe = /\{(n|\d{1})\}{1}/,
		isUrlTmpl = urlTmpl.match(tmplRe),
		isNameTmpl = nameTmpl.match(tmplRe),
		urlTpl = dot.template(urlTmpl.replace(tmplRe, "{n}")),
		nameTpl = dot.template(nameTmpl.replace(tmplRe, "{n}")),
		urlPad = parseInt(isUrlTmpl[1]),
		namePad = parseInt(isNameTmpl[1]),
		val = function(n) {return n},
		getUrlN = isnan(urlPad) ? val : function(n) {return zeroFill(urlPad, n)},
		getNameN = isnan(urlPad) ? val : function(n) {return zeroFill(namePad, n)},
		r = range(rangeStart, rangeEnd+1),
		log = [], failed = [];

	basePath = osenv.home() + basePath.replace(/\/$/, "");

	if (!isUrlTmpl || !isNameTmpl) {
		throw new Error("Templates must contain a single {n} or {numberOfDigitsToZeroPad} e.g. {5}");
	}

	mkdirp.sync(basePath);

	async.eachLimit(r, max, function(n, next) {
		var url = urlTpl(getUrlN(n)),
			fullPath = basePath +"/"+ nameTpl(getNameN(n)),
			fileStream = fs.createWriteStream(fullPath);

		request(url, function() {
			log.push(url);
			next();
		}).on('response', function(res) {
			if (res.statusCode == 200) {
				console.log("Saving", url, "to", fullPath);
				res.pipe(fileStream);
				return;
			}
			var msg = "Status Code: "+ res.statusCode;
			console.log("Error Saving", url, "to", fullPath, msg);
			failed.push({url: url, error: msg});
			fileStream.emit('end');
		}).on('error', function(err) {
			fileStream.emit('end');
			if (err) {failed.push({url: url, error: err})}
			next();
		});



	}, function complete(err) {
		err && console.log("error", err);
		console.log("completed", log.length - failed.length, "of", r.length);
		failed.length && console.log("failed urls:", failed);
		finished && finished(err, log, failed);
	});

};