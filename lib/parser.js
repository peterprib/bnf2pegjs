"use strict";
const peg = require("pegjs")
	,fs=require('fs');


function Parser(file,options) {
	this.debug=(options|{debug:false}).debug|false;
	this.file=file;
	if(this.debug) {console.log("loading parser for "+this.file);}
	this.fileContent=fs.readFileSync(this.file,{ encoding: "utf8" });
	this.parser = peg.generate(this.fileContent,{output:"parser",trace:false});
	if(!this.parser) {throw Error("Parse failed");}
	if(this.debug) {console.log("loaded parser for "+this.file);}
}
Parser.prototype.parse= function(content) {
		try{
			return this.parser.parse(content);
		} catch(e) {
	    	 if(e.location === undefined) {throw e;}
    		 console.error( "Line " + e.location.start.line + ", column " + e.location.start.column + ": " + e.message); 		 
    		 const readline = require('readline');
    		 var l=1,p=e.location.start.line;
    		 const rl = readline.createInterface({
    		   input:  fs.createReadStream(input)
    		 });
    		 rl.on('line', function(line) {
    			if(l>=p-1 & l<p+2 ) 
    				console.error('Line '+l+": "+line);
    			l++;
    		 });
    		 return;
	    } 
		if(this.debug) console.log("parser completed " + JSON.stringify(csv));
	};
Parser.prototype.parseFile= function(file) {
		if(this.debug) {console.log("parsing file "+file);}
		return this.parse(fs.readFileSync(file,{ encoding: "utf8" }));
	};
module.exports = Parser;
if (typeof define !== 'function') {
    var define = require('amdefine')(Parser);
}
define(function(require) {
    //The value returned from the function is
    //used as the module export visible to Node.
   		return Parser;
	});
