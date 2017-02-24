"use strict";
console.log('Starting parserService');

function stringify(o) {
	var cache = []
		,r=JSON.stringify(o, function(key, value) {
			if (typeof value === 'object' && value !== null) {
				if (cache.indexOf(value) !== -1) {
					return;
				}
				cache.push(value);
			}
			return value;
		});
	cache = null;
	return r;
}

const url = require("url")
	,path = require("path")
	,fileExtensions=require("./lib/fileExtensions")
	,Parser=require("./lib/parser");
var express = require('express')
  ,http = require('http')
  ,app = express();
global.parserActive={};
// all environments
app.set('port', process.env.PORT || 3010);

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
function errorHandler(err, req, res, next) {
		console.error('errorHandler '+err+(err.stack?err.stack:""));
		if (res.headersSent) {
			return next(err);
		}
		if(err.message.substr(0,7)==="parser ") {
				res.status(400).send(err.message);
		}
		res.status(500).send("Internal error");
	}
app.use(errorHandler);

require('./lib/browserSetup')(app,[{id:'vis',offset:'dist',include:['vis.js','vis.css']}
	,{id:'requirejs'}
	,{id:'font-awesome',base:'font-awesome',include:['css/font-awesome.min.css']}
	,{id:'bootstrap',offset:'dist',include:['js/bootstrap.min.js','css/bootstrap.min.css']}
	,{id:'codemirror'}
	]);

// development only
if ('development' === app.get('env')) {
	console.log('development mode');
	global.bypassSignon=true;
	app.all('*', function (req, res, next) {
		console.log('debug request '+stringify(req));
		return next();
	});
//	app.use(express.errorHandler());
}
app.all('*', function (req, res, next) {
		console.log('check');
		if (global.bypassSignon || req.session && req.session.authorized)
			return next();
		res.status(401).send("Signon Required"); 
	});
app.all('/list', function (req, res, next) {
		var list=[]
			,l=fileExtensions.listRecursiveSync(path.join(__dirname,"pegjs"));
		l.forEach(function(c) {
				var f=c.split('.');
				if(f[1]!=="pegjs") return;
				list.push(f[0]);
	  		}, this);
		res.json(list); 
	});
app.all('/parser/*', function (req, res, next) {
		console.log("parser "+stringify(req.params));
		if(req.params.length==0) {throw Error('parser not specified')}
		if(!req.query | !req.query.data) {throw Error('parser data not specified')}
		var p=req.params[0];
		if(!global.parserActive[p]) {
			try{
				global.parserActive[p]= new Parser("pegjs/"+p+".pegjs");
			} catch(e) {
				throw Error("parser not found");
			}
		}
		res.json(global.parserActive[p].parse(req.query.data)); 
	});

http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});
console.log('parserService main finished');