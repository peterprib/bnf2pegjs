"use strict";
var peg = require("pegjs")
	,fs=require('fs')
	,debug=true;

function ParserTest(pegjsFile) {
	if(pegjsFile) this.setParserFile(pegjsFile);
}

ParserTest.prototype.parseFile = function(file,callBack) {
		var thisObject=this;
		fs.readFile(file,{ encoding: "utf8" }, (err, content) => {
				if (err) {throw Error(err);}
				console.log("parse started");
				try{
					thisObject.results = thisObject.parser.parse(content);
				} catch(e) {
					if(e.location == undefined)
						throw e;
					console.error( "Line " + e.location.start.line + ", column " + e.location.start.column + ": " + e.message); 		 
					const readline = require('readline');
					var l=0,p=e.location.start.line;
					const rl = readline.createInterface({
						input:  fs.createReadStream(inputData)
					});
					rl.on('line', function(line) {
						if(l>=p & l<p+2 ) 
							console.error('Line '+l+": "+line);
						l++;
					});
				} 
				console.log("parse completed");
				callBack && callBack.apply( thisObject,[thisObject.results]);
				return;
			});
		return this;
	};

ParserTest.prototype.processResults = function(afunction,callBack) {
	var thisObject=this;
	afunction && afunction.apply(thisObject,[thisObject.results]);
	callBack && callBack.apply(thisObject,[thisObject.results]);
	return;
}
ParserTest.prototype.setParserFile = function(pegjsFile,callBack) {
		var thisObject=this;
		fs.readFile(pegjsFile,{ encoding: "utf8" }, (err, pegjs) => {
				if (err) {throw Error(err);}
				thisObject.parser = peg.generate(pegjs,{output:"parser",trace:false});
				if(!thisObject.parser) {throw Error("pegjs parse failed");}
				console.log("loaded parser");
				callBack && callBack.apply( thisObject,[]);
				return;
			});
	};
	
module.exports = ParserTest;
if (typeof define !== 'function') {
	var define = require('amdefine')(ParserTest);
}
define(function(require) {return ParserTest;});