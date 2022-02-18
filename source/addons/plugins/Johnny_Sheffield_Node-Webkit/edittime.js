function GetPluginSettings()
{
	return {
		"name":			"Node-Webkit Gui",				
		"id":			"nwk",
		"version":	    "1.1",		
		"description":	"Provides access to Node-webkit Native UI API",
		"author":		"JohnnySheffield",
		"help url":		"https://github.com/rogerwang/node-webkit",
		"category":		"Node-webkit",				
		"type":			"object",			// not in layout
		"rotatable":	false,
		"dependency":	"package.json",
		"flags":		pf_singleglobal						
	
	};
};


////////////////////////////////////////
// Conditions
AddCondition(0,cf_trigger,"OnFullscreen","Window","On entered Fullscreen","Emitted when window enters fullscreen state.","OnFullscreen");
AddCondition(1,cf_trigger,"OnLeaveFullscreen","Window","On leaved Fullscreen","Emitted when window leaves fullscreen state.","OnLeaveFullscreen");
//AddCondition(2, cf_deprecated,"OnClose","Window","On window closed","Usually you would like to listen to the close event and do some shutdown work and then do a close(true) to really close the window.","OnClose");
AddCondition(2, cf_trigger,"OnLoaded","Window","On window loaded","Requires node-webkit >= v0.3.5 Emitted when the window is fully loaded, this event behaves the same with window.onload, but doesn't rely on the DOM.","OnLoaded");
AddCondition(3, cf_trigger,"OnFocused","Window","On window focused","Emitted when window gets focus.","OnFocused");
AddCondition(4, cf_trigger,"OnBlur","Window","On window blurred","Emitted when window loses focus.","OnBlur");
AddCondition(5, cf_trigger,"OnMinimize","Window","On window minimized","Emitted when window is minimized.","OnMinimize");
AddCondition(6, cf_trigger,"OnRestore","Window","On window restored","Emitted when window is restored from minimize state.","OnRestored");
AddCondition(7, 0, "IsNodeWebkit","General","Is in node-webkit enviroment","True if in node-webkit","IsNodeWebkit");

////////////////////////////////////////
// Actions


AddAction(0, 0, "Quit", "App", "Quit App", "Quit current app. This method will not send close event to windows and app will just quit quietly.", "quit");
AddAction(1, 0, "Minimize", "Tray", "Minimize Window", "Minimize the window to taskbar on Windows, iconify the window on GTK, and miniaturize the window on Mac.", "minimize");
AddAction(2, 0, "Restore", "Tray", "Restore Window", "Restore window to previous state after the window is minimized, e.g. the reverse of minimize(). It's not named unminimize since restore is already used commonly on Window.", "restore");
AddAction(3, 0, "Enter fullscreen", "Fullscreen", "Enter fullscreen", "Make the window fullscreen. This function is different with HTML5 FullScreen API, which can make part of the page fullscreen, Window.enterFullscreen() will only fullscreen the whole window.", "enterFullscreen");
AddAction(4, 0, "Leave fullscreen", "Fullscreen", "Leave fullscreen", "Leave the fullscreen mode", "leaveFullscreen");
AddAction(5, 0, "Toggle fullscreen", "Fullscreen", "Leave fullscreen", "Toggle the fullscreen mode. Requires node-webkit >= v0.3.5",  "toggleFullscreen");
AddAction(6, 0, "Reload window", "Reload", "Reload window", "Reloads the current window. Requires node-webkit >= v0.3.5",  "reload");
AddAction(7, 0, "Reload Ignoring Cache", "Reload", "Reload Ignoring Cache", "Requires node-webkit >= v0.3.5 Like reload(), but don't use caches (aka 'shift-reload').",  "reloadIgnoringCache");
AddAction(8, 0, "Focus window", "Focus", "Focus window", "Focus on the window.",  "focus");
AddAction(9, 0, "Blur window", "Focus", "Blur window", "Move focus away. Usually it will move focus to other windows of your app, since on some platforms there is no concept of blur.", "blur");
AddAction(10, 0, "Show window", "Window", "Show window", "Show the window if it's not showed, show will not focus on the window on some platforms, so you need to call focus if you want to.", "show");
AddAction(11, 0, "Hide window", "Window", "Hide window", "Hide the window. Users will not be able to find the window if it's hidden.", "hide");
AddComboParamOption("true");
AddComboParamOption("false");
AddComboParam("force", "force close? if true, close event will be ignored!", 1);
AddAction(12, 0, "Close window", "Window", "Close window, force {0}", "Close current window, you can catch the close event to prevent the closing. If force is specified and equals to true, then the close event will be ignored.", "close");
AddAction(13, 0, "Reload window", "Window", "Reload window", "Requires node-webkit >= v0.3.5 Reloads the current window.", "reload");
AddAction(14, 0, "Enter kiosk mode", "Kiosk", "Enter Kiosk", "Requires node-webkit >= v0.3.1 Enter the Kiosk mode. In Kiosk mode, the app will be fullscreen and try to prevent users from leaving the app, so you should remember to provide a way in app to leave Kiosk mode. This mode is mainly used for presentation on public displays.", "enterKioskMode");
AddAction(15, 0, "Leave kiosk mode", "Kiosk", "Leave Kiosk", "Requires node-webkit >= v0.3.1 Leave the Kiosk mode.", "leaveKioskMode");
AddAction(16, 0, "Toggle kiosk mode", "Kiosk", "Toggle Kiosk", "Requires node-webkit >= v0.3.5 Toggle the kiosk mode.", "toggleKioskMode");
AddAction(17, 0, "Show dev tools", "DevTools", "Show Dev tools", "Open the devtools to inspect the window.", "showDevTools");
AddNumberParam("width", "max window width", 100);
AddNumberParam("height", "max window height", 100);
AddAction(18, 0, "Set Maximum Size", "Size", "setMaximumSize {0},{1}", "Set window's maximum size.", "setMaximumSize");
AddNumberParam("width", "max window width", 100);
AddNumberParam("height", "max window height", 100);
AddAction(19, 0, "Set Minimum Size", "Size", "setMinimumSize {0},{1}", "Set window's minimum size.", "setMinimumSize");
AddComboParamOption("true");
AddComboParamOption("false");
AddComboParam("resizable", "Set whether window is resizable.", 0);
AddAction(20, 0, "Set resizable", "Size", "Set resizable {0}", "Set whether window is resizable.", "setResizable");
AddComboParamOption("true");
AddComboParamOption("false");
AddComboParam("always on top", "Set whether window AlwaysOnTop.", 1);
AddAction(21, 0, "Set always on top", "Position", "setAlwaysOnTop {0}", "Requires node-webkit >= v0.3.4 Sets the widget to be on top of all other windows in the windowing system.", "setAlwaysOnTop");
AddNumberParam("width", "set window width", 100);
AddAction(22, 0, "Set window width", "Size", "set width {0}", "Set window's width.", "setWidth");
AddNumberParam("height", "set window height", 100);
AddAction(23, 0, "Set window height", "Size", "set height {0}", "Set window's height", "setHeight");
AddAction(24, 0, "Close", "App", "Close App", "Available after node-webkit v0.3.2 Send the close event to all windows of current app, if no window is blocking the close event, then the app will quit after all windows have done shutdown. Use this method to quit an app will give windows a chance to save data.", "closeAllWindows");
AddStringParam("window title", "Set window title", "\"\"");
AddAction(25, 0, "Set window title", "Window", "Set title {0}", "Set window's title.", "title");
AddNumberParam("X", "set window.x", 100);
AddAction(26, 0, "Set window X", "Position", "set X {0}", "Set left/top offset from window to screen.", "X");
AddNumberParam("Y", "set window Y", 100);
AddAction(27, 0, "Set window Y", "Position", "set Y {0}", "Set left/top offset from window to screen.", "Y");
AddNumberParam("X", "move to x", 100);
AddNumberParam("Y", "move to Y", 100);
AddAction(28, 0, "move to(x, y)", "Position", "move To {0}, {1}", "Moves a window's left and top edge to the specified coordinates.", "moveTo");
AddNumberParam("X", "move by x", 100);
AddNumberParam("Y", "move by Y", 100);
AddAction(29, 0, "move by(x, y)", "Position", "move by {0}, {1}", "Moves a window a specified number of pixels relative to its current coordinates.", "moveBy");
AddNumberParam("width", "Resize to", 100);
AddNumberParam("height", "Resize to", 100);
AddAction(30, 0, "Resize to (width, height)", "Size", "resize to {0}, {1}", "Resizes a window to the specified width and height.", "resizeTo");
AddNumberParam("width", "Resize by", 100);
AddNumberParam("height", "Resize by", 100);
AddAction(31, 0, "Resize by (width, height)", "Size", "resize by {0}, {1}", "Resizes a window by the specified amount.", "resizeBy");
AddStringParam("Clipboard", "Write to clipboard", "\"\"");
AddAction(32, 0, "Write to clipboard", "Clipboard", "write to clipboard", "Write data to the clipboard. type specifies the mime type of the data, only text (plain text data) is supported now.", "ClipboardSet");
AddAction(33, 0, "Clear clipboard", "Clipboard", "clear clipboard", "Clear the clipboard", "ClipboardClear");
AddStringParam("URI", "URI", "\"\"");
AddAction(34, 0, "Open external URI", "Shell", "Open ext. URI", "Open the given external protocol URI in the desktop's default manner. (For example, mailto: URLs in the default mail user agent.)", "openExternal");
AddStringParam("File path", "Path", "\"\"");
AddAction(35, 0, "Open item", "Shell", "Open item", "Open the given file_path in the desktop's default manner.", "openItem");
AddStringParam("File path", "Path", "\"\"");
AddAction(36, 0, "Show item in folder", "Shell", "Show item", "Show the given file_path in a file manager. If possible, select the file.", "showItemInFolder");
AddStringParam("URL", "specifies the URL of the page to open, it can be a page in your app package", "\"\"");
AddStringParam("Specs", "specs specifies window features", "\"\"");
AddAction(37, 0, "Open window", "Window", "Open window", "Open a new window and load url in it, you can specify extra options with the window. All window subfields in Manifest format can be used.", "open");
AddAction(38, 0, "Close all windows", "Window", "Close all windows", "Send the close event to all windows of current app, if no window is blocking the close event, then the app will quit after all windows have done shutdown. Use this method to quit an app will give windows a chance to save data.", "closeAllWindows");


////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "window width", "Data", "windowWidth", "Get the window width");
AddExpression(1, ef_return_number, "window height", "Data", "windowHeight", "Get the window height");
AddExpression(2, ef_return_number, "window X", "Position", "windowX", "Get the window X");
AddExpression(3, ef_return_number, "window Y", "Position", "windowY", "Get the window Y");
AddExpression(4, ef_return_string, "Clipboard", "Clipboard", "Clipboard", "Get the Clipboard");
AddExpression(5, ef_return_string, "Version", "Version", "Version", "Get the current node-webkit version.");


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