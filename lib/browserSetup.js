"use strict";
const path = require('path')
	,express = require('express');
function browserSetup(app,p) {
	var f,include,type,n, s="console.log('initialise');var s,head0=document.getElementsByTagName('head')[0];";
	for(var i in p) {
		n=p[i];
		try{ 
			f=path.dirname(require.resolve(n.id+path.sep+"README.md"))+(n.offset?path.sep+n.offset:"");
		} catch (e) {
			console.error("Cannot provision "+n.id+" reason: "+e);
			continue;
		}
		console.log("use "+n.id +' ==> '+f);
		app.use('/'+n.id, express.static(f));
		if(n.include) {
			for(var j in n.include) {
				include=n.id+'/'+n.include[j];
				if((include.match(/[^\\\/]\.([^.\\\/]+)$/) || [null]).pop()==='js') {
					s+="var e=document.createElement('script');"
						+"e.type='text/javascript';"
						+"e.src = '"+include+"';"; 
				} else {
					s+="var e=document.createElement('link');"
						+"e.type='text/javascript';"
						+"e.rel='stylesheet';"
						+"e.href='"+include+"';"; 
				}
				s+="head0.appendChild(e);console.log('initialise include issued for: "+include+"');";
			}
		}
	}
	s+="console.log('initialise end');";
	app.get('/initialise',function (req, res, next) {
		res.send(s); 
	});
}

module.exports = browserSetup;
if (typeof define !== 'function') {
    var define = require('amdefine')(browserSetup);
}
define(function(require) {
    //The value returned from the function is
    //used as the module export visible to Node.
    	return browserSetup;
	});