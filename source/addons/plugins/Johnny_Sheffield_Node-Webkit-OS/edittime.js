function GetPluginSettings()
{
	return {
		"name":			"Nodejs OS",				
		"id":			"nwkos",				
		"description":	"Provides a few basic operating-system related utility functions.",
		"author":		"JohnnySheffield",
		"help url":		"http://nodejs.org/api/os.html",
		"category":		"Node-webkit",				
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal						
	
	};
};


////////////////////////////////////////
// Conditions


////////////////////////////////////////
// Actions



////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "OS", "OS", "tmpDir", "Returns the operating system's default directory for temp files.");
AddExpression(1, ef_return_string, "OS", "OS", "hostname", "Returns the hostname of the operating system.");
AddExpression(2, ef_return_string, "OS", "OS", "type", "Returns the operating system name.");
AddExpression(3, ef_return_string, "OS", "OS", "platform", "Returns the operating system platform.");
AddExpression(4, ef_return_string, "OS", "OS", "arch", "Returns the operating system CPU architecture.");
AddExpression(5, ef_return_string, "OS", "OS", "release", "Returns the operating system release.");
AddExpression(6, ef_return_number, "OS", "OS", "uptime", "Returns the system uptime in seconds.");
AddExpression(7, ef_return_any, "OS", "OS", "loadavg", "Returns an array containing the 1, 5, and 15 minute load averages.");
AddExpression(8, ef_return_number, "OS", "OS", "totalmem", "Returns the total amount of system memory in bytes.");
AddExpression(9, ef_return_number, "OS", "OS", "freemem", "Returns the amount of free system memory in bytes.");
AddExpression(10, ef_return_any, "OS", "OS", "cpus", "Returns an array of objects containing information about each CPU/core installed: model, speed (in MHz), and times (an object containing the number of CPU ticks spent in: user, nice, sys, idle, and irq).");
AddExpression(11, ef_return_any, "OS", "OS", "networkInterfaces", "Get a list of network interfaces.");
AddExpression(12, ef_return_string, "OS", "OS", "EOL", "A constant defining the appropriate End-of-line marker for the operating system.");
AddExpression(13, ef_return_any, "OS", "OS", "loadavg1", "Returns value containing the 1 minute load average.");
AddExpression(14, ef_return_any, "OS", "OS", "loadavg5", "Returns value containing the 5 minute load average.");
AddExpression(15, ef_return_any, "OS", "OS", "loadavg15", "Returns value containing the 15 minute load average.");
AddExpression(16, ef_return_number, "OS", "OS", "cpusnum", "Returns number of cpu's.");
AddExpression(17, ef_return_string, "OS", "OS", "cpusmodel", "Returns model of cpu.");
AddExpression(18, ef_return_string, "OS", "OS", "cpusString", "Returns an string containing array of objects containing information about each CPU/core installed: model, speed (in MHz), and times (an object containing the number of CPU ticks spent in: user, nice, sys, idle, and irq).");
AddExpression(19, ef_return_string, "OS", "OS", "networkInterfacesString", "Get a string containing list of network interfaces.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////

var property_list = [];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
		
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
}

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
}

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
}

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}