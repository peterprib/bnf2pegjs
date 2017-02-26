/*
 * Copyright (C) 2017 Jaroslav Peter Prib
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 * 
 */

function pegjsList(name,element,delimiter) {
	return name +" = f:"+element+" _ r:('"+(delimiter|',')+' _ ' +element+ ')+ _  { return [f].concat(r.extractCell(2)); }\n"
}

function Column() {
	return "'*'" +
		+"/ ";
}
Columns.proptype.getParserPegjs = function () {
		return  pegjsList('Columns','column',',');
	};
function Columns() {
}
Columns.proptype.getParserPegjs = function () {
		return  pegjsList('Columns','column',',');
	};
function From() {
	}
From.proptype.getParserPegjs = function () {
		return  "'from'i ";
	};
function Where() {
	}
Where.proptype.getParserPegjs = function () {
		return  "'where'i ";
	};

function Select() {
	this.columns=newColumns();
	this.from=[];
	this.where=[];
}
Select.proptype.parse = function (test) {
		if(!this.parser) this.getParser();
	};
Select.proptype.getParserPegjs = function () {
		return  "select = c:'select'i _ columns _ from _ where _ { return {command:c}; }\n"
			+ this.columns.getParserPegjs()
			+ this.from.getParserPegjs()
			+ this.where.getParserPegjs()
	};
Select.proptype.getParser = function (test) {
		this.pegjs = "select = c:'select'i _ "+ "{ return {command:c}; }"
	};

function SQL() {

}

SQL.proptype.select = new Select();
	};

/* export part   */
if (typeof define !== 'function') {
	var define = require('amdefine')(SQL);
}
define(function(require) {
	return SQL;
});