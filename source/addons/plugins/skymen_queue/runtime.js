// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.skymen_queue = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.skymen_queue.prototype;
		
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
		
		// any other properties you need, e.g...
		// this.myValue = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		// note the object is sealed after this call; ensure any properties you'll ever need are set on the object
		// e.g...
		// this.myValue = 0;
		this.stack = [];
	};
	
	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	// the example condition
	Cnds.prototype.IsEmpty = function ()
	{
		return (this.stack.length == 0);
	};

	Cnds.prototype.CompareCount = function (cmp,val)
	{
		return cr.do_cmp(this.stack.length, cmp, val);
	};

	Cnds.prototype.CompareFirst = function (cmp, val)
	{
		return cr.do_cmp(this.stack[0], cmp, val);
	};
	
	// ... other conditions here ...
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
	Acts.prototype.Enqueue = function (val)
	{
		this.stack.push(val);
	};

	Acts.prototype.Dequeue = function ()
	{
		this.stack.shift();
	};
	
	Acts.prototype.Clear = function ()
	{
		this.stack = [];
	};

	Acts.prototype.Load = function (JSON)
	{
		obj = JSON.parse(JSON);
		if(obj.c2stack){
			this.stack = obj.data;
		}
		else{
			console.log("JSON passed isn't valid.")
		}
	};
	
	// ... other actions here ...
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	// the example expression
	Exps.prototype.Peek = function (ret)
	{
		ret.set_any(this.stack[0]);
	};
	
	Exps.prototype.Dequeue = function (ret)
	{
		ret.set_any(this.stack.shift());
	};

	Exps.prototype.ToJSON = function (ret)
	{
		var obj = {
			'c2stack' : true,
			'size': this.stack.length,
			'data': this.stack
		}
		ret.set_string(JSON.stringify(obj));
	};

	Exps.prototype.Length = function (ret)
	{
		ret.set_int(this.stack.length);
	};
	
	// ... other expressions here ...
	
	pluginProto.exps = new Exps();

}());