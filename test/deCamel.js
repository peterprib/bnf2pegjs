"use strict";
var Parser = require("../lib/parser")
	,debug=true;
	
var camel2Words = new Parser("../pegjs/camel2Words.pegjs");
console.log("test 1 "+camel2Words.parse("aabDef"));
