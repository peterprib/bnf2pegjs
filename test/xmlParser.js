"use strict";

if(Object.prototype.defineFunction) {
	console.warn("Object.prototype.defineFunction already defined");
} else {
	Object.defineProperty(Object.prototype, "defineFunction", {
			enumerable: false
			,value: function(o,p,f) {
					console.log("pribJSExtentions loading "+p+" for "+o.name );
					if(o.hasOwnProperty(p)) {
						console.warn("Object.prototype."+p+" already defined for "+o.name);
					} else {
						Object.defineProperty(o.prototype, p, {
								enumerable: false
								,value: f
							});
					}
				}
		});
}
Object.defineFunction(Object ,"toDisplayText", function(level) {
	if(this instanceof String) return '"'+this+'"';
	var i,s=""
		,l=level==null?0:level+1
		,t="  ".repeat(l)
		,a=(this instanceof Array)
		,o=(a?"[":"{")+"\n";
	for (var p in this) {
		i=this[p];
		if(!(i===null || i.enumerable===null || i.enumerable===true || i instanceof Function)) {
			o+=t+s+(a?"":'"'+p+'": ')+(i instanceof Object?i.toDisplayText(l):(typeof i == "string"? '"'+i+'"':i))+"\n";
			s=",";
		}
	}
	return o+t+(a?"]":"}");
});

var ParserTest = require("../lib/ParserTest")
	,parserTest=new ParserTest("../pegjs/xml.pegjs")
		.parseFile("data/test.xml",(results)=>{
					processResults(results);
					parserTest.parseFile("data/test.xsd",(results)=>{processResults(results);});
					});

function processResults(results) {
	console.log(""+JSON.stringify(results)+"\n"+results.toDisplayText());
	return;
}

