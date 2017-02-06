@builtin whitespace

statements -> statement | statements statement{%
    	function (data, location, reject) {
         	return ["statements", data[1]];
    	}
	%}
statement -> _ ( create | select ) _ stmtRemainder _ ";" {%
    	function (data, location, reject) {
    		console.log("statement: " + JSON.stringify({data:data, location:location, reject:reject}));
        	return ["statement", data[1]];
    	}
	%}
create -> "create"  
select -> "select" _ "*"  {%
    	function (data, location, reject) {
    		console.log("select: " + JSON.stringify({data:data, location:location, reject:reject}));
        	return ["statements", data[1]];
    	}
	%}

newline -> comment:? "\n" 
comment -> "//" [^\n]:* 
        | "/*" commentchars:+ .:? "*/" 
commentchars -> "*" [^/] 
            | [^*] .
stmtRemainder -> [^;]:* 
	