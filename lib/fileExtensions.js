"use strict";
const path = require('path')
	, fs=require('fs');

var fileExtensions = {
	listRecursiveSync: function(d){
			var n,l=fs.readdirSync(d);
			for (var i in l) {
				n=path.join(d,l[i]);
				if (fs.statSync(n).isDirectory()) l[i] = this.listRecursiveSync(n);
			}
			return l;
		}
	};

module.exports = fileExtensions;
if (typeof define !== 'function') {
	try{
	    var define = require('amdefine')(fileExtensions);
	} catch(e) {}
} else {
	define(function(require) {
		//The value returned from the function is
		//used as the module export visible to Node.
    	return fileExtensions;
	});
}