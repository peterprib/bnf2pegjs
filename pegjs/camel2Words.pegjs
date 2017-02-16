words = f:firstWord  w:word* {
		var r,t;
		[f].concat(w).forEach(function(c) {
				if(c.length==1) {
					t=(t|"")+c;
				} else {
					if(t) {
						r?r+" "+t:t;
						t=null;
					}
					r=r?r+" "+c:c;					
				}	  
			})
		return r;
	}

firstWord = l:l*  { if(l[0]) l[0]=l[0].toUpperCase();  return l.join("");}

word = u:u l:l*  {return u+l.join("");}
	/ _ l:l* {if(l[0]) l[0]=l[0].toUpperCase(); return l.join("");}
u = [A-Z] 
l = [a-z0-9\-] 
_ "whitespace" = "\t" / "\v" / "\f" / " " / "\u00A0" / "\uFEFF" / "_"
