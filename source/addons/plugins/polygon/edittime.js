function GetPluginSettings()
{
	return {
		"name":			"Polygon",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"Polygon",				// this is used to identify this plugin and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"Draw collision aware polygons",
		"author":		"Yann Granjon",
		"help url":		"",
		"category":		"General",				// Prefer to re-use existing categories, but you can set anything here
		"type":			"world",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	true,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		0						// uncomment lines to enable flags...
					//	| pf_singleglobal		// exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
					//	| pf_texture			// object has a single texture (e.g. tiled background)
						| pf_position_aces		// compare/set/get x, y...
						| pf_size_aces			// compare/set/get width, height...
						| pf_angle_aces			// compare/set/get angle (recommended that "rotatable" be set to true)
						| pf_appearance_aces	// compare/set/get visible, opacity...
					//	| pf_tiling				// adjusts image editor features to better suit tiled images (e.g. tiled background)
					//	| pf_animations			// enables the animations system.  See 'Sprite' for usage
						| pf_zorder_aces		// move to top, bottom, layer...
					//  | pf_nosize				// prevent resizing in the editor
						| pf_effects			// allow WebGL shader effects to be added
					//  | pf_predraw			// set for any plugin which draws and is not a sprite (i.e. does not simply draw
												// a single non-tiling image the size of the object) - required for effects to work properly
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
AddObjectParam("Object", "Select the object to test for overlap with.");
AddCondition(0, 0, "Is overlapping another object", "Collisions", "Is overlapping {0}", "Test if the object is overlapping another object.", "IsOverlapping");

AddObjectParam("Object", "Select the object to test for overlap with.");
AddNumberParam("Offset X", "The amount to offset the X co-ordinate (in pixels) before checking for a collision.");
AddNumberParam("Offset Y", "The amount to offset the Y co-ordinate (in pixels) before checking for a collision.");
AddCondition(1, 0, "Is overlapping at offset", "Collisions", "Is overlapping {0} at offset (<i>{1}</i>, <i>{2}</i>)", "Test if the object is overlapping another object at an offset position.", "IsOverlappingOffset");

AddCondition(2, 0, "Collisions enabled", "Collisions", "Collisions enabled", "True if the object's collisions are enabled and will fire collision events.", "IsCollisionEnabled");
AddCondition(3, cf_trigger, "On Drawn", "Polygon", "On Drawn", "Triggered when the poly is drawn.", "OnDrawn");

AddCmpParam("Comparison", "How to compare the polygon's area.");
AddNumberParam("Number", "The area to compare to.");
AddCondition(4, 0, "Compare area", "Polygon", "Area {0} {1}", "Test the current area of the polygon (doesn't work with invalid polygons)", "CompareArea");


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
AddNumberParam("X", "vertex's X position")			// a number
AddNumberParam("Y", "vertex's Y position")			// a number
AddComboParamOption("local-space")											// (repeat before "AddComboParam" to add combo items)
AddComboParamOption("world-space")											// (repeat before "AddComboParam" to add combo items)
AddComboParam("coordinate-system", "Coordinate system for vertex position", initial_selection = 0)			// a dropdown list parameter
AddAction(0, af_none, "Add Vertex", "Polygon", "Add Vertex at ({0},{1}) - <b>{2}</b>", "Add a vertex to your polygon", "addVertex");

AddAction(1, af_none, "Log Vertex List", "Polygon", "log vertex list", "Display vertex list in the console", "logVertexList");

AddStringParam("fill Color", "Fill with color (hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\")", "\"black\"");
AddNumberParam("line Width", "Width of line", "1.0");
AddStringParam("line Color", "Color of line (hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\")", "\"black\"");
AddAction(2, af_none, "Draw Polygon", "Polygon", "Draw polygon with outline ({1} px,{2}) and fill with ({0})", "Draw the polygon described by its vertex list", "drawPolygon");

AddNumberParam("index", "vertex's index")			// a number
AddNumberParam("X", "vertex's X position")			// a number
AddNumberParam("Y", "vertex's Y position")			// a number
AddComboParamOption("local-space")											// (repeat before "AddComboParam" to add combo items)
AddComboParamOption("world-space")											// (repeat before "AddComboParam" to add combo items)
AddComboParam("coordinate-system", "Coordinate system for vertex position", initial_selection = 0)			// a dropdown list parameter
AddAction(3, af_none, "Move Vertex", "Polygon", "Move vertex {0} at ({1},{2}) - <b>{3}</b>", "Modify the coordinates of a vertex given its index", "moveVertex");

AddNumberParam("index", "vertex's index")			// a number
AddAction(4, af_none, "Remove Vertex", "Polygon", "Remove vertex {0}", "Remove a vertex given its index", "removeVertex");

AddAction(5, af_none, "Clear Polygon", "Polygon", "Clear polygon", "Delete the vertex list and the polygon displayed", "clearPolygon");

AddStringParam("JSON", "A string of the JSON data to load.");
AddAction(6, 0, "Load", "JSON", "Load from JSON string <i>{0}</i>", "Load from a polygon vertex list previously encoded in JSON format.", "JSONLoad");

AddAction(7, 0, "Download", "JSON", "Download as JSON data", "Download the polygon vertex list as a JSON file.  Intended for development - may prompt a popup warning.", "JSONDownload");

AddNumberParam("index", "vertex's index")			// a number
AddNumberParam("X", "vertex's X position")			// a number
AddNumberParam("Y", "vertex's Y position")			// a number
AddComboParamOption("local-space")											// (repeat before "AddComboParam" to add combo items)
AddComboParamOption("world-space")											// (repeat before "AddComboParam" to add combo items)
AddComboParam("coordinate-system", "Coordinate system for vertex position", initial_selection = 0)			// a dropdown list parameter
AddAction(8, af_none, "Insert Vertex", "Polygon", "Insert vertex {0} at ({1},{2}) - <b>{3}</b>", "Insert a vertex at a given index and position", "insertVertex");

AddNumberParam("X", "origin X position")			// a number
AddNumberParam("Y", "origin Y position")			// a number
AddComboParamOption("local-space")											// (repeat before "AddComboParam" to add combo items)
AddComboParamOption("world-space")											// (repeat before "AddComboParam" to add combo items)
AddComboParam("coordinate-system", "Coordinate system for vertex position", initial_selection = 0)			// a dropdown list parameter
AddAction(9, af_none, "Set Origin", "Polygon", "Set origin to ({0},{1}) - <b>{2}</b>", "Set the origin of the polygon", "setOrigin");


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
AddNumberParam("index", "index of the vertex to get.");
AddExpression(0, ef_return_number, "Get vertex X",	"Polygon",	"VertexX", "The X position of one of the polygon's vertex.");

AddNumberParam("index", "index of the vertex to get.");
AddExpression(1, ef_return_number, "Get vertex Y",	"Polygon",	"VertexY", "The Y position of one of the polygon's vertex.");

AddExpression(2, ef_return_number, "Get vertex count", "Polygon", "VertexCount", "The number of vertices in the polygon.");

AddExpression(3, ef_return_number, "Get polygon area", "Polygon", "Area", "The area of the polygon (doesn't work with invalid polygons).");

AddNumberParam("index", "index of the vertex to get.");
AddExpression(4, ef_return_number, "Get local vertex X", "Polygon",	"LocalVertexX", "The X position (local-space) of one of the polygon's vertex.");

AddNumberParam("index", "index of the vertex to get.");
AddExpression(5, ef_return_number, "Get local vertex Y", "Polygon",	"LocalVertexY", "The Y position (local-space) of one of the polygon's vertex.");

AddExpression(6, ef_return_string, "Get as JSON", "JSON", "AsJSON", "Return the contents of the polygon vertex list in JSON format.");

AddExpression(7, ef_return_number, "Get original width", "Polygon",	"OriginalWidth", "Width of the polygon texture.");
AddExpression(8, ef_return_number, "Get original height", "Polygon",	"OriginalHeight", "Height of the polygon texture");

AddExpression(9, ef_return_number, "Get right edge of bouding box", "Polygon",	"Right", "X position of the right edge of the polygon's bounding box.");
AddExpression(10, ef_return_number, "Get bottom edge of bouding box", "Polygon",	"Bottom", "Y position of the bottom edge of the polygon's bounding box.");
AddExpression(11, ef_return_number, "Get left edge of bouding box", "Polygon",	"Left", "X position of the left edge of the polygon's bounding box.");
AddExpression(12, ef_return_number, "Get top edge of bouding box", "Polygon",	"Top", "Y position of the top edge of the polygon's bounding box.");

AddExpression(13, ef_return_number, "Get center of bounding box", "Polygon",	"CenterX", "X position of the center of the polygon's bounding box.");
AddExpression(14, ef_return_number, "Get center of bounding box", "Polygon",	"CenterY", "Y position of the center of the polygon's bounding box.");

AddExpression(15, ef_return_number, "Get center of bounding box", "Polygon",	"BarycenterX", "X position of the barycenter center of the polygon's vertices.");
AddExpression(16, ef_return_number, "Get center of bounding box", "Polygon",	"BarycenterY", "Y position of the barycenter center of the polygon's vertices.");


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
	new cr.Property(ept_combo,	"Initial visibility",	"Visible",	"Choose whether the object is visible when the layout starts.", "Visible|Invisible"),
	new cr.Property(ept_combo,	"Effect",				"(none)",	"Choose an effect for this object.  (This does not preview in the layout, only when you run.)", "(none)|Additive|XOR|Copy|Destination over|Source in|Destination in|Source out|Destination out|Source atop|Destination atop"),
	new cr.Property(ept_combo,	"Collisions",			"Enabled",	"Whether the object will register collision events or not.", "Disabled|Enabled"),
	new cr.Property(ept_combo,	"Debug Mode",			"Disabled",	"The plugin will throw some usefull information on the debug console.", "Disabled|Enabled")
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

IDEInstance.prototype.OnCreate = function()
{
	// Always use middle-left hotspot
	this.instance.SetHotspot(new cr.vector2(0.5, 0.5));
}
// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
	this.instance.SetSize(new cr.vector2(64, 64));
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


cr.vector2.prototype.rotate = function (angle,xCenter,yCenter) 
{
	this.x -= xCenter;
	this.y -= yCenter;
	var xTemp;
	var cosa = Math.cos(angle);
	var sina = Math.sin(angle);
	var x_temp = (this.x * cosa) - (this.y * sina);
	this.y = (this.y * cosa) + (this.x * sina);
	this.x = x_temp;

	this.x += xCenter;
	this.y += yCenter;

}

// draws the lines of a polygon of POLYSIDES equal sides 
// around the center+OFFSET of the object
// at scale SCALE 
IDEInstance.prototype.drawPolyLines = function (renderer,polySides,offset,scale)
{
	var q = this.instance.GetBoundingQuad();
	var origin = new cr.vector2((q.tlx + q.brx) / 2, (q.tly + q.bry) / 2);
	var a = this.instance.GetAngle();
	var size = this.instance.GetSize();

	var from,to;
	var cos1,sin1;
	var cos2,sin2;

	size.x *= scale;
	size.y *= scale;

	var i = 0;
	for (i = 0; i < polySides; i++)
	{
			cos1 = Math.cos (offset + 2*cr.PI/polySides * i);
			sin1 = Math.sin (offset + 2*cr.PI/polySides * i);
			cos2 = Math.cos (offset + 2*cr.PI/polySides * ((i+1)%polySides));
			sin2 = Math.sin (offset + 2*cr.PI/polySides * ((i+1)%polySides));
			
			from = new cr.vector2(cos1*size.x/2,sin1*size.y/2);
			to   = new cr.vector2(cos2*size.x/2,sin2*size.y/2);

			from.rotate(a,0,0);
			to.rotate(a,0,0);
			
			from.offset(origin.x,origin.y);
			to.offset(origin.x,origin.y);

			//renderer.Line(origin, to, cr.RGB(255, 0, 0));
			renderer.Line(from, to, cr.RGB(255, 0, 0));
	}
}


// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
	this.drawPolyLines (renderer,4,cr.PI/4,Math.sqrt(2));
	this.drawPolyLines (renderer,4,0,1.0);
	this.drawPolyLines (renderer,4,cr.PI/4,Math.sqrt(2)/2);
}


IDEInstance.prototype.OnRendererReleased = function(renderer)
{
	this.font = null;		// drop reference to created font
	this.old_font_str = "";
}
