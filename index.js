"use strict";
const  fs=require("fs")
	,readline = require('readline');
if ( !Object.prototype.map ) {
	console.log("defining Object.prototype.map");
	Object.prototype.map = function(fn){
    		var r = {};
    		for (var p in this) {
        		r[p] = fn(this[p], p);
    		}
			return r;
		};
	Object.defineProperty(Object.prototype,'map',{enumerable:false});
}
/*
if ( !Object.prototype.forEach ) {
	console.log("defining Object.prototype.forEach");
	Object.prototype.forEach = function(fn, scope) {
			for(var i = 0, len = this.length; i < len; ++i) {
				if(i in this) {
					fn.call(scope, this[i], i, this);
				}
			}
		};
}
*/

/*
const  pegjs=require("pegjs");
var parser = pegjs.generate("start = ('a' / 'b')+");
console.log(parser.parse("abba")); // returns ["a", "b", "b", "a"]
try{
	console.log(parser.parse("abcd")); // throws an exception
} catch(e){
	console.log("parse error: "+ e);
}
console.log("testParser success");

const test1=fs.readFileSync("./pegjs/test1.pegjs", "utf8");
parser = pegjs.generate(test1);
console.log("parser loaded");
console.log(parser.parse("2*(3+4)"));
console.log("finished pegjs");

*/
const oracle=fs.readFileSync("./nearley/sql/oracle.ne", "utf8")
	,simpleSQL=fs.readFileSync("./test/sql/simpleSelect.sql", "utf8");
	;
	
function NewParser(ne,start,debug) {
	if(debug) this.debug=debug;
	this.neParser= new this.nearley.Parser(this.neGrammar.ParserRules,this.neGrammar.ParserStart);
	this.parsed=this.neParser.feed(ne).finish();
	if(this.debug) console.log("parsed boot "+JSON.stringify(this.parsed));
	this.compiled=this.compile(this.parsed[0],{});
	if(this.debug) console.log("compiler "+JSON.stringify(this.compiled));
	this.lint(this.compiled, {});
	if(this.debug) console.log("lint "+JSON.stringify(this.compiled));
	this.generated=this.generate(this.compiled);
	if(this.debug) console.log("generate "+JSON.stringify(this.generated));
	this.grammer = this.evalRequire(this.generated);
	if(start) this.grammer.ParserStart=start;
	if(this.debug) console.log("grammer "+JSON.stringify(this.grammer));
	this.parser = new this.nearley.Parser(this.grammer.ParserRules,this.grammer.ParserStart);
}
NewParser.prototype.nearley = require("nearley");
NewParser.prototype.neGrammar = require('nearley/lib/nearley-language-bootstrapped.js')
NewParser.prototype.evalRequire = require('eval');
NewParser.prototype.compile = require('nearley/lib/compile.js');
NewParser.prototype.lint = require('nearley/lib/lint.js');
NewParser.prototype.generate = require('nearley/lib/generate.js');
NewParser.prototype.onCompleteCall = function(f) {
		return this.postParseCall=f;
	};
NewParser.prototype.postParseCall = function(r) {
		if(this.debug) console.log("NewParser.prototype.completeCall no function provided, parsed output: "+JSON.stringify(r));
	};
NewParser.prototype.feed = function(s) {
		return this.parser.feed(s);
	};
NewParser.prototype.finish = function(s) {
		return this.parser.finish();
	};
NewParser.prototype.parse = function(s) {
		if(this.debug) console.log(s);
		return this.parser.feed(s).finish();
	};
NewParser.prototype.parseFile = function(fileName) {
		if(this.debug) console.log("parsing file: "+fileName);
		this.lineCnt=0;
/*		
		fs.readFile(fileName, (err, data) => {
  				if (err) throw err;
  				console.log(data);
			});
*/
		var thisOject=this;
		const rl = readline.createInterface({
  				input: fs.createReadStream(fileName)
			});
		rl.on('line', (line) => {
				thisOject.lineCnt++;
				if(thisOject.debug) console.log("Debug line: "+thisOject.lineCnt+" "+line);;
				try{
					thisOject.parser.feed(line);
				} catch(e) {
  					console.log("Line: "+thisOject.lineCnt+" "+JSON.stringify(e)+" => "+line);
  				}
  			});
		rl.on('close', () => {
  				if(thisOject.debug) console.log("NewParser.prototype.parseFile EOF");
  				thisOject.parsed = thisOject.parser.finish();
  				thisOject.postParseCall(thisOject.parsed);
			});
	};
var parserMoo = new NewParser('@builtin "cow.ne"\nmain -> cow');
var mooParsed=parserMoo.parse("MOO");
console.log("mooParsed " +JSON.stringify(mooParsed));
console.log("finished nearley MOO");

var parserOracle = new NewParser(oracle,undefined,true);
//var parsed=parserOracle.parse(simpleSQL);


parserOracle.parseFile("./test/sql/simpleSelect.sql")
//	.onCompleteCall()
	;
console.log("finished main");


