{
  var debug=false;
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

file = r:(record eol)* l:record eof { return extractCell(r,0).concat([l]); }

record = f:cell r:( delimiter cell)*  {if(debug) console.log("cells f=> " +JSON.stringify(f) + " r=> " +JSON.stringify(r)); return [f].concat(extractCell(r,1)); }

cell = '"' c:cellDataQuoted* '"' {if(debug) console.log("cellq "+c.join('')); return c.join(''); }  
	/  c:cellData {if(debug) console.log("cell >>>"+c+"<<<") ;return c; }

cellDataQuoted = '""' { return '"'; }
	/ [^"] .

cellData = (!cellDelimiter .)* {return text(); }
cellDelimiter = delimiter / eol

eof "end of file" = ''
eol "end of line" = [\n\r] / [\n] / [\r]
delimiter = ','
