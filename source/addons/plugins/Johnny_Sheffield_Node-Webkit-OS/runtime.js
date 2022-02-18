// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class

cr.plugins_.nwkos = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	
	var pluginProto = cr.plugins_.nwkos.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
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

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		this.os = require('os');
	};
	
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	exps.tmpDir = function (ret)	
	{
		ret.set_string(this.os.tmpDir());
	};
	exps.hostname = function (ret)	
	{
		ret.set_string(this.os.hostname());
	};
	exps.type = function (ret)	
	{
		ret.set_string(this.os.type());
	};
	exps.platform = function (ret)	
	{
		ret.set_string(this.os.platform());
	};
	exps.arch = function (ret)	
	{
		ret.set_string(this.os.arch());
	};
	exps.release = function (ret)	
	{
		ret.set_string(this.os.release());
	};
	exps.uptime = function (ret)	
	{
		ret.set_int(this.os.uptime());
	};
	exps.loadavg = function (ret)	
	{
		ret.set_any(this.os.loadavg());
	};
	exps.totalmem = function (ret)	
	{
		ret.set_int(this.os.totalmem());
	};
	exps.freemem = function (ret)	
	{
		ret.set_int(this.os.freemem());
	};
	exps.cpus = function (ret)	
	{
		ret.set_any(this.os.cpus());
	};
	exps.networkInterfaces = function (ret)	
	{
		ret.set_any(this.os.networkInterfaces());
	};
	exps.EOL = function (ret)	
	{
		ret.set_string(this.os.EOL);
	};
	exps.loadavg1 = function (ret)	
	{
		ret.set_any(this.os.loadavg()[0]);
	};
	exps.loadavg5 = function (ret)	
	{
		ret.set_any(this.os.loadavg()[1]);
	};
	exps.loadavg15 = function (ret)	
	{
		ret.set_any(this.os.loadavg()[2]);
	};
	//returns lenght of os.cpus array, value should be number of cpu's
	exps.cpusnum = function (ret)	
	{
		ret.set_int(this.os.cpus().length);
	};
	exps.cpusmodel = function (ret)	
	{
		ret.set_string(this.os.cpus()[0].model);
	};
	exps.cpusString = function (ret)	
	{
		ret.set_string(JSON.stringify(this.os.cpus()));
	};
	exps.networkInterfacesString = function (ret)	
	{
		ret.set_string(JSON.stringify(this.os.networkInterfaces()));
	};

}());