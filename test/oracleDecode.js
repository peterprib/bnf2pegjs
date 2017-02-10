var peg = require("pegjs")
	,fs=require('fs')
	,sqlInput="/oracle.sql"
	,debug=true;
var processCommand = 
	{"COMMENT": function(s) {
			console.log("object "+s.object.type + " schema " + s.object.name[0] + " TABLE " +  s.object.name[1] + " column " +  s.object.name[2] + " => " +s.text);
		}
	,"ALTER": function(s) {	}
	,"CREATE": function(s) { }
	,"CREATE OR REPLACE": function(s) {	}
	,getCommentColumnName: function(o) { }
};
fs.readFile("pegjs/oracle.pegjs",{ encoding: "utf8" },function (err, pegjs) {
	    if (err) {throw Error(err);}
	    var pegjsParser = peg.generate(pegjs,{output:"parser",trace:false});
	    if(!pegjsParser) {throw Error("pegjs parse failed");}
	    console.log("loaded parser");
	    fs.readFile(sqlInput,{ encoding: "utf8" },function (err, content) {
	    	if (err) {throw Error(err);}
		    console.log("parser started");
	    	var s = pegjsParser.parse(content);
		    console.log("parser completed");

	    	var c;
	    	s.statements.forEach(function(a) {
	    				if(!a) { return; }
	    				if(a.command) {
	    					c=a.command;
	    				} else {
	    					throw Error('statement has no command '+JSON.stringify(a));
	    				}
	    				if(processCommand[c]) {
	    					processCommand[c](a);
	    				} else
	    					if (debug) {console.log("ignored command "+c);}
	    		});
	  	});	
  	});	
