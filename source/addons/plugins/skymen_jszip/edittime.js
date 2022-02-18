function GetPluginSettings()
{
	return {
		"name":			"jsZip",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"skymen_jszip",				// this is used to identify this plugin and is saved to the project; never change it
		"version":      "1.4",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"Allows the manipulation of zip files",
		"author":		"skymen",
		"help url":		" ",
		"category":		"General",				// Prefer to re-use existing categories, but you can set anything here
		"type":			"object",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	false,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		0						// uncomment lines to enable flags...
						| pf_singleglobal		// exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
					//	| pf_texture			// object has a single texture (e.g. tiled background)
					//	| pf_position_aces		// compare/set/get x, y...
					//	| pf_size_aces			// compare/set/get width, height...
					//	| pf_angle_aces			// compare/set/get angle (recommended that "rotatable" be set to true)
					//	| pf_appearance_aces	// compare/set/get visible, opacity...
					//	| pf_tiling				// adjusts image editor features to better suit tiled images (e.g. tiled background)
					//	| pf_animations			// enables the animations system.  See 'Sprite' for usage
					//	| pf_zorder_aces		// move to top, bottom, layer...
					//  | pf_nosize				// prevent resizing in the editor
					//	| pf_effects			// allow WebGL shader effects to be added
					//  | pf_predraw			// set for any plugin which draws and is not a sprite (i.e. does not simply draw
												// a single non-tiling image the size of the object) - required for effects to work properly
	,
	"dependency": "jszip.js;jszip-utils.js;"
	};
};

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])			// a number
// AddStringParam(label, description [, initial_string = "\"\""])		// a string
// AddAnyTypeParam(label, description [, initial_string = "0"])			// accepts either a number or string
// AddCmpParam(label, description)										// combo with equal, not equal, less, etc.
// AddComboParamOption(text)											// (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])			// a dropdown list parameter
// AddObjectParam(label, description)									// a button to click and pick an object type
// AddLayerParam(label, description)									// accepts either a layer number or name (string)
// AddLayoutParam(label, description)									// a dropdown list with all project layouts
// AddKeybParam(label, description)										// a button to click and press a key (returns a VK)
// AddAnimationParam(label, description)								// a string intended to specify an animation name
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name
				
// example				
AddCondition(0, cf_trigger, "On Zip Loaded", "Setup", "On Zip Loaded", "Triggered when the zip gets loaded from the URL", "OnZipLoaded");
AddCondition(1, cf_trigger, "On Zip Load Fail", "Setup", "On Zip Load Fail", "Triggered when the zip fails to load from the URL", "OnZipLoadFail");
AddCondition(2, cf_trigger, "On Unzip", "Unzip", "On Unzip", "Triggered when the zip gets unziped to path", "OnUnzip");
AddCondition(3, cf_trigger, "On Unzip Fail", "Unzip", "On Unzip Fail", "Triggered when the unzip fails", "OnUnzipFail");
AddCondition(4, cf_trigger, "On Download", "Unzip", "On Download", "Triggered when the zip gets downloaded to path", "OnDownload");
AddCondition(5, cf_trigger, "On Download Fail", "Unzip", "On Download Fail", "Triggered when the download fails", "OnDownloadFail");
AddCondition(6, cf_none, "Is Loading", "Setup", "Is Loading", "True while the loading process is ongoing", "IsLoading");
AddCondition(7, cf_none, "Is Downloading", "Unzip", "Is Downloading", "True while the downloading process is ongoing", "IsDownloading");
AddCondition(8, cf_none, "Is Unzipping", "Unzip", "Is Unzipping", "True while the loading process is ongoing", "IsUnzipping");
AddCondition(9, cf_none, "Has Zip Loaded", "Setup", "Has Zip Loaded", "Wether the plugin currently has a zip file in memory", "HasZipLoaded");
////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

// example
AddStringParam("URL", "URL to load zip from");
AddAction(0, af_none, "Load Zip from URL", "Setup", "Load zip from {0}", "Load zip from URL", "LoadZipFromURL");

AddStringParam("Path", "Path to download zip to (must include the file name)");
AddAction(1, af_none, "Download zip to path", "Unzip", "Download zip to {0}", "Download zip to a given path", "DownloadZip");

AddStringParam("Path", "Path to download zip to (path must be the root folder)");
AddAction(2, af_none, "Unzip to path", "Unzip", "Unzip to {0}", "Unzip to a given path", "UnzipZip");

AddAction(3, af_none, "Cancel Load", "Setup", "Cancel Load", "Cancel Load", "CancelLoad");
AddAction(4, af_none, "Cancel Download", "Unzip", "Cancel Download", "Cancel Download", "CancelDownload");
AddAction(5, af_none, "Cancel Unzip", "Unzip", "Cancel Unzip", "Cancel Unzip", "CancelUnzip");
AddAction(6, af_none, "Unload Zip", "Setup", "Unload Zip", "Unload Zip", "UnloadZip");


////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

// example
AddExpression(0, ef_return_number, "LoadProgress", "Setup", "LoadProgress", "The progress from loading the zip from a URL");
AddExpression(1, ef_return_string, "LoadError", "Setup", "LoadError", "The error that happened during load");
AddExpression(2, ef_return_number, "DownloadProgress", "Unzip", "DownloadProgress", "The progress from downloading the zip to a path");
AddExpression(3, ef_return_string, "DownloadError", "Unzip", "DownloadError", "The error that happened during download");
AddExpression(4, ef_return_number, "UnzipProgress", "Unzip", "UnzipProgress", "The progress from unzipping to a path");
AddExpression(5, ef_return_string, "UnzipError", "Unzip", "UnzipError", "The error that happened during unzip");

AddExpression(6, ef_return_number, "EntryCount", "Setup", "EntryCount", "The number of entries in the zip file, including folders");
AddNumberParam("ID", "Entry ID");
AddExpression(7, ef_return_string, "EntryName", "Setup", "EntryName", "The name of the entry by id");
AddNumberParam("ID", "Entry ID");
AddExpression(8, ef_return_number, "EntryIsDir", "Setup", "EntryIsDir", "Returns 1 if the entry is a dir, 0 else");
////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_color,		name,	initial_value,	description)		// a color dropdown
// new cr.Property(ept_font,		name,	"Arial,-16", 	description)		// a font with the given face name and size
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)
// new cr.Property(ept_link,		name,	link_text,		description, "firstonly")		// has no associated value; simply calls "OnPropertyChanged" on click

var property_list = [
];
	
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
		
	// Plugin-specific variables
	// this.myValue = 0...
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