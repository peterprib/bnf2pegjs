d@builtin whitespace
debug[x] -> 'console.log("statement: " + JSON.stringify({data:data, location:location, reject:reject}));'


statements -> _ (statement endOfStatement)  {%
    	function (data, location, reject) {
        	return ["statements", data[1]];
    	}
	%}
statement -> 
		create 
	|	select
create -> "create" __ stmtRemainder
select -> "select" __ stmtRemainder

stmtRemainder = [^endOfStatement]:*

endOfStatement = null|';'
newline -> comment:? "\n" 
comment -> "//" [^\n]:* 
        | "/*" commentchars:+ .:? "*/" 
commentchars -> "*" [^/] 
            | [^*] .



 
