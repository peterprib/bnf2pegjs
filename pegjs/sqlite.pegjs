sqlStatementList =  r: ( _ ( sqlStatement )? _ ';' )+  { return filter(flatten(r, true), ';') }

sqlStatement = (stmt: selectStatement ) { return put_if_not_null(stmt, "explain", nonempty(flatstr(explain))) }


signed = ( '+' / '-' )
signedNumber =  ( signed)? numericLiteral )

typeName =
  ( name )+
  ( ( '(' signedNumber ')' )
  / ( '(' signedNumber ',' signedNumber ')' ) )?



value =
  v: ( _
       ( ( x: literalValue
           { return { literal: x } } )
       / ( b: bindParameter
           { return { bind: b } } )
       / ( t: ( tableName '.' columnName )
           { return { column: t[2], table: t[1] } } )
       / ( c: columnName
           { return { column: c } } )
       / ( unaryOperator expression )
       / ( '(' expression _ ')' )
       / ( 'CAST'i _ '(' expression AS typeName ')' )
       / ( ( 'NOT'i _ ? 'EXISTS'i _ )? '(' selectStatement ')' )
       / ( 'CASE'i _ expression ? ( 'WHEN'i expression 'THEN'i expression )+ ( 'ELSE'i_ expression _)? 'END'i )
	 ) )
  { return v[1] }

expression =
  e: ( _
       ( ( value binaryOperator expression )
       / ( value 'COLLATE'i collationName )
       / ( value ('NOT'i __)? ( 'LIKE'i / 'GLOB'i / 'REGEXP'i / 'MATCH'i ) expression ( 'ESCAPE'i _ expression )? )
       / ( value ( 'ISNULL'i / 'NOTNULL'i / ( 'NOT'i __ 'NULL'i ) ) )
       / ( value 'IS'i __ 'NOT'i ? expression )
       / ( value ('NOT'i __)? 'BETWEEN'i expression 'AND'i expression )
       / ( value ('NOT'i __)? 'IN'i ( ( _ '(' ( selectStatement / ( expression ',' )+ )? ')' )
                          ) )
       / value ) )
  { return e[1]; }


literalValue =
  ( numericLiteral / stringLiteral / blobLiteral
  / 'NULL'i / CURRENT_TIME / CURRENT_DATE / CURRENT_TIMESTAMP )

numericLiteral =
  digits:( ( ( ( digit )+ ( decimalPoint ( digit )+ )? )
           / ( decimalPoint ( digit )+ ) )
           ( 'E' signed? ( digit )+ )? )
  { var x = flatstr(digits);
    if (x.indexOf('.') >= 0) {
      return parseFloat(x);
    }
    return parseInt(x);
  }


pragmaStatement =  ( 'PRAGMA'i _ ( _ databaseName '.' )? pragmaName ( ( equal pragmaValue ) / ( '(' pragmaValue ')' ) )? )

pragmaValue = ( signedNumber / name / stringLiteral )


selectStatement =
  ( 'SELECT'i d: ( ( 'DISTINCT'i / 'ALL'i )? )
           c: ( 
                ( cx: ( _ ','  )*
                      { var acc = [];
                        for (var i = 0; i < cx.length; i++) {
                          acc[i] = cx[i][2];
                        }
                        return acc;
                      } ) )
    f: ( j: ( ( 'FROM'  )? ) { return j ? j[1] : [] } )
    w: ( e: ( ( 'WHERE'i expression )? ) { return e ? e[1] : [] } ) )
  { 
    var res = put_if_not_null(res, "distinct", nonempty(flatstr(d)));
    res = put_if_not_null(res, "from", nonempty(f));
    res = put_if_not_null(res, "where", nonempty(w));
    return res;
  }

newline = '\n'
all2newline = [^\n]*
all2CommentEnd = .* & '*/'
stringLiteral = '"' (escapeChar / [^"])* '"'
escapeChar = '\\' .
nil = ''

_ =  [ \t\n\r]*
__ = [ \t\n\r]+

unaryOperator =
  x: ( _
       ( '-' / '+' / '~' / 'NOT'i) )
  { return x[1] }

binaryOperator =
  x: ( _
       ('||'
        / '*' / '/' / '%'
        / '+' / '-'
        / '<<' / '>>' / '&' / '|'
        / '<=' / '>='
        / '<' / '>'
        / '=' / '==' / '!=' / '<>'
        / 'IS'i / 'IS'i __ 'NOT'i / 'IN'i / 'LIKE'i / 'GLOB'i / 'MATCH'i / 'REGEXP'i
        / 'AND'i
        / 'OR'i) )
  { return x[1] }

digit = [0-9]
decimalPoint = '.'
equal = '='

name = str:[A-Za-z0-9_]+ { return str.join('') }

databaseName = name
tableName = name
tableAlias = name
tableOrIndexName = name
tableNameNew = name
indexName = name
columnName = name
columnAlias = name
foreignTable = name
savepointName = name
collationName = name
viewName = name
moduleName = name
moduleArgument = name
bindParameter =  '?' name
functionName = name
pragmaName = name

errorMessage = stringLiteral

CURRENT_TIME = 'now'
CURRENT_DATE = 'now'
CURRENT_TIMESTAMP = 'now'

blobLiteral = stringLiteral

endOfInput = ''
