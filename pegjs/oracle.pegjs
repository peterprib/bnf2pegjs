/*
 rough oracle SQL decoding
*/ 

{
  var debug=false,statementCount=0;
  
  function combine (a) {
  		if(a instanceof Array) return combine(a.join(""));
  		return a;
  	}
  function extractCell(a) {
  		for(var r=[],c,j,i=0;i<a.length;i++) {
  			for(c=a[i],j=1;j<arguments.length;j++)
  				try{
  					if (c==null) continue;
  					c=c[arguments[j]];
  					if (c==null) continue;
  					r.push(c);
  				} catch (e) {
  					console.log("extractCell failed: "+e+" Index: "+arguments[j]+" Cell: "+JSON.stringify(c).substring(0,100));
  					console.log("Array: "+JSON.stringify(a).substring(0,100));
   				}
  		}
  		return r;
  	}
}

statements =  _ statements:(  ( statement  )? _ statementTerminator _ )+   {if(debug) console.log("statements done "); return {statements:extractCell(statements,0,0)} }
statement = s: (alter / block / comment / create / createOrReplace / delete / if / insert / select / update ) _ statementRemainder {if(debug) console.log("statement "+ (++statementCount) + " " + s.command + " " + JSON.stringify(s.object)); return s; }

/* statements */

alter = c:'alter'i _ o:objectIdentifier _ { return {command:c,object:o}; }
comment = c:'comment'i _ 'on'i _ o:objectIdentifier _ 'is'i _ t: singleQuotedText _  { return {command:c,object:o,text:t}; }
create = c:'create'i _ details:(createIndex / createSequence / createTable) { return Object.assign({command:c},details); }
createOrReplace = c:'create'i _ r:('Or'i _ 'Replace'i)? _ details:(createTrigger / createPackageBody / createPackage / error ) _ { return Object.assign({command: c+(r==null?"":" OR REPLACE")},details); }
delete = c:'delete'i _ { return {command:c}; }
drop = c:'drop'i _ o:objectIdentifier _ { return {command:c,object:o}; }
insert = c:'insert'i _ { return {command:c}; }
select = c:'select'i _ { return {command:c}; }
update = c:'update'i _ { return {command:c}; }

error = s:statementRemainder {console.error("***unknown*** "+s); return {object:{type:"error",name:"***error parsing***"}};}

createIndex = ('unique'i)? _ o:'index'i _ n:objectName _ { return {object:{type:o,name:n}}; }

createPackage = o:'package'i _ n:objectName _ ('is'i/'as'i) _ ( packageProcedure )+ _ 'end'i _ en:objectName _ ";" { if(en[en.length-1]!=n[n.length-1]) console.error("create package name "+n[n.length-1]+" != "+en[en.length-1]); return {object:{type:o,name:n}}; }
packageProcedure = o:'procedure'i _ n:name _ r:statementRemainder ';' _ 
/*
createPackageBody = 'package'i _ 'body'i _ n:objectName _ ('is'i/'as'i) _ packageBodyStatements* _ i:text2slash {return {object:{type:"PACKAGE BODY",name:n}}; }
*/
createPackageBody = 'package'i _ 'body'i _ n:objectName _ ('is'i/'as'i) _ declare_section _ body _ i:text2slash {return {object:{type:"PACKAGE BODY",name:n}}; }

packageBodyStatements = !"/" (pragma/packageType/packageException/packageRowid/packageSet) _ (function/procedure)* _";" _ { if(debug) console.log("body ignoring " + text());}

/*
CREATE [ OR REPLACE ] PACKAGE BODY
   [ schema. ] package
   { IS | AS } [ declare_section ] { body | END package_name } ;
*/


declare_section = (!('function'i/'procedure'i) sourceCharacter)*   {if(debug) console.log("ignoring declare_section: " + text()); return text(); }
body = (function/procedure)* {if(debug) console.log("processed body");}

function = 'function'i _ n:name _ parameters? _ "is"i _ text2Begin _ block {if(debug) console.log("function: "+n);}
procedure = 'procedure'i _ n:name _ parameters? _ "is"i _ text2Begin "begin"i _ block _ "end"i _";" {if(debug) console.log("procedure: "+n);}
parameters = "(" (!")" sourceCharacter)*  ")" 


pragma = 'PRAGMA'i text2SemiColon {return text();}
packageType = 'type'i text2SemiColon  {return text();}
packageException = (!'exception'i sourceCharacter)* 'exception'i  {return text();}
packageRowid = (!'ROWID'i sourceCharacter)* 'ROWID'i {return text();}
packageSet = (!':=' sourceCharacter*) ':=' text2SemiColon  {return text();}

createSequence = o:'sequence'i _ n:objectName _ { return {object:{type:o,name:n}}; }

createTable = o:'table'i _ n:objectName _ '(' _ c:createTableColumns _ ')' _ { return {object:{type:o,name:n},columns:c}; }
createTableColumns = f:columnDef n:(',' _ columnDef)+ { return [f].concat(extractCell(n,2)); }
columnDef = n:quotedName _  t:dataType _ columnConstraint _ {return {name:n};}
dataType = t:nameUpper _ ( '(' _ digit _ ( ',' _ digit )? _ ')' )? _  
	/ objectName
columnConstraint = ('DEFAULT'i _ (digit / 'sysdate'i ) _)?

createTrigger = o:'trigger'i _ n:objectName _ text2Begin block? { return {object:{type:o,name:n}}; }


/* common */
block = c:'begin'i _ statements _ 'end'i _ name _";" { return {command:c}; }
if = c:'if'i _ text2Then _ "then"i _ statements _ 'end'i _ 'if'i _ ";" { return {command:c}; }

text2Comma = (!"," sourceCharacter)* { return text(); }
text2Begin = (!"begin"i sourceCharacter)* { return text(); }
text2Then = (!"then"i sourceCharacter)* { return text(); }
text2SemiColon = (!";" sourceCharacter)* { return text(); }
text2SingleQuote = (!"'" sourceCharacter)* { return text(); }
text2slash = (!"/" sourceCharacter)* {if(debug) console.log("ignoring " + text()); return text(); }

singleQuotedText = "'" t:text2SingleQuote "'" _ { if(debug) console.log(JSON.stringify(t)); return t; }

digit = d:[0-9]+ { return d.join(''); }

name = s:[A-Za-z0-9_]+ { return s.join(''); }
nameUpper = n:name { return n.toUpperCase(); }
quotedName = '"' n:name '"' {  return n ; }
	 / n:nameUpper {  return n ; }

objectIdentifier = t:nameUpper _ n:objectName _ { return {type:t,name:n}; }
objectName = n1:quotedName n2:('.' quotedName)* _ { return [n1].concat(extractCell(n2,1)); }

endOfInput = ''
inlineComment = ( inlineCommentLine / inlineCommentMultiLine)
inlineCommentLine = '--' (!lineTerminatorSequence sourceCharacter)* 
inlineCommentMultiLine = inlineCommentsBegin (!inlineCommentsEnd sourceCharacter)* inlineCommentsEnd
inlineCommentsBegin = '/*'
inlineCommentsEnd = '*/'
lineRemainder = [^\n]*
lineTerminatorSequence "end of line" = "\n" / "\r\n" / "\r" / "\u2028" / "\u2029" 
minus = '-'
plus = '+'
statementTerminator = (';' / "/") 
statementRemainder = (!statementTerminator sourceCharacter)* { return text(); }
sourceCharacter = .
whiteSpace "whitespace" = "\t" / "\v" / "\f" / " " / "\u00A0" / "\uFEFF"
_ = ( whiteSpace / lineTerminatorSequence / inlineComment)*
