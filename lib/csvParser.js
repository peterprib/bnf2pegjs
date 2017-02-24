"use strict";
var Parser = require("./parser")
	,fs=require('fs');
function CsvParser(file) {
	this.data=this.parser.parseFile(file);
}
CsvParser.prototype.parser= new Parser("../pegjs/csv.pegjs");
CsvParser.prototype.eachRecord = function(f) {
		var line=0,thisObject=this;
		this.data.forEach(function(r) {
				f.apply(thisObject, [r,++line]);
			});
	};
CsvParser.prototype.eachCell = function(f) {
		this.eachRecord(function(r,line) {
				var column=0,thisObject=this;
				this.data.forEach(function(c) {
						f.apply(thisObject, [c,line,++column]);
					});

			});
	};
module.exports = CsvParser;
if (typeof define !== 'function') {
    var define = require('amdefine')(CsvParser);
}
define(function(require) {
    //The value returned from the function is
    //used as the module export visible to Node.
    	return CsvParser;
	});