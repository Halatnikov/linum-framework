﻿// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Comment = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Comment.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
    
	Cnds.prototype.Comment = function () { return true;	};	

	pluginProto.cnds = new Cnds();  

	//////////////////////////////////////
	// Actions
	function Acts() {};

    Acts.prototype.Comment = function () {}; 

	pluginProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	pluginProto.exps = new Exps();

}());