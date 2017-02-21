"use strict";
var peg = require("pegjs")
	,fs=require('fs')
	,input="C:/tmp/csh/reference/RDRschemasRevise.csv"
	,output="C:/tmp/csh/reference/RDRschemasReviseDeCamel.csv"
	,debug=true;

if(Object.prototype.defineFunction)
	console.warn("Object.prototype.defineFunction already defined");
else 
	Object.defineProperty(Object.prototype, "defineFunction", {
			enumerable: false
			,value: function(o,p,f) {
					console.log("pribJSExtentions loading "+p+" for "+o.name );
					if(o.hasOwnProperty(p))
						console.warn("Object.prototype."+p+" already defined for "+o.name);
					else
						Object.defineProperty(o.prototype, p, {
								enumerable: false
								,value: f
							});
				}
		});
Object.defineFunction(Array, "areEqual", function(l,r,t,f,o) {
		var a = (this[l]==this[r]);
		if(t) {
			if(a===true)
				t.apply(o, [l,r]);
		} else if(f) {
			if(a===false)
				f.apply(o, [l,r]);
		}
		return a;
	});
Object.defineFunction(Array, "diffCells", function() {
		for (var l,r,i=1; i<arguments.length; i++) {
			if(!this.areEqual(arguments[i-1],arguments[i])===true)
				console.log("difference: "+ arguments[i-1] + " " + arguments[i] + " " + JSON.stringify(this));
		}
	});

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
	
function Csv(file) {
	this.data=this.parser.parseFile(file);
}
Csv.prototype.parser= new Parser("pegjs/csv.pegjs");
Csv.prototype.eachRecord = function(f) {
		var line=0,thisObject=this;
		this.data.forEach(function(r) {
				f.apply(thisObject, [r,++line])
			});
	};
	
Csv.prototype.eachCell = function(f) {
		this.eachRecord(function(r,line) {
				var column=0,thisObject=this;
				this.data.forEach(function(c) {
						f.apply(thisObject, [c,line,++column])
					});

			});
	};
var camel2Words = new Parser("pegjs/camel2Words.pegjs")
	,csv= new Csv(input);

/*
csv.eachRecord(function(r) {
		r.diffCells(0,1,2);
	});
*/
	
var data="Element,Desciption,FDC,Subject Area,Entity";
csv.eachRecord(function(r) {
//		console.log("r1 "+JSON.stringify(r));
//		r.forEach(function(c){
//			console.log("camel from: "+c+"   to:"  + camel2Words.parse(c));
//			});
		if(r[0]=="") return;
		data+="\n"+r[0]+","+camel2Words.parse(r[0])
//		if (debug) {console.log("record  "+JSON.stringify(r));}
	});;

console.log('test\n'+data);

fs.writeFile(output, data, (err) => {
		if (err) throw err;
		console.log('Saved');
	});

/*
var csvParser = new Parser("pegjs/csv.pegjs");
var csv=csvParser.parseFile(input);
csv.forEach(function(r) {
	if (debug) {console.log("record  "+JSON.stringify(r));}
});
*/

