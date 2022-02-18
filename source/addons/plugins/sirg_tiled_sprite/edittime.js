function GetPluginSettings()
{
  return {
    "name":      "Tiled Sprite",
    "id":      "TiledSprite",
    "version":    "2.0",
    "description":  "Automatically tile an image over an area. Supports animation like sprites.",
    "author":    "Sir_G",
    "help url":    "https://www.scirra.com/forum/viewtopic.php?t=70501",
    "category":    "General",      // Prefer to re-use existing categories, but you can set anything here
    "type":      "world",      // appears in layout
    "rotatable":  true,
    "flags":    0
          //  | pf_singleglobal    // exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
          //  | pf_texture      // object has a single texture (e.g. tiled background)
            | pf_position_aces    // compare/set/get x, y...
            | pf_size_aces      // compare/set/get width, height...
            | pf_angle_aces      // compare/set/get angle (recommended that "rotatable" be set to true)
            | pf_appearance_aces  // compare/set/get visible, opacity...
            | pf_tiling        // adjusts image editor features to better suit tiled images (e.g. tiled background)
            | pf_animations      // enables the animations system.  See 'Sprite' for usage
            | pf_zorder_aces    // move to top, bottom, layer...
            | pf_effects
            | pf_predraw
  };
};

// Conditions, actions and expressions
////////////////////////////////////////
////////////////////////////////////////
// Conditions
AddAnimationParam("Animation", "Enter the name of the animation to check if playing.")
AddCondition(0, 0, "Is playing", "Animations", "Is animation {0} playing", "Test which of the object's animations is currently playing.", "IsAnimPlaying");

AddCmpParam("Comparison", "How to compare the current animation frame number (0-based).");
AddNumberParam("Number", "The animation frame number to compare to (0-based).");
AddCondition(1, 0, "Compare frame", "Animations", "Animation frame {0} {1}", "Test which animation frame is currently showing.", "CompareFrame");

AddAnimationParam("Animation", "Enter the name of the animation that has finished.")
AddCondition(2, cf_trigger, "On finished", "Animations", "On animation {0} finished", "Triggered when an animation has finished.", "OnAnimFinished");

AddCondition(3, cf_trigger, "On any finished", "Animations", "On any animation finished", "Triggered when any animation has finished.", "OnAnyAnimFinished");

AddCondition(4, cf_trigger, "On frame changed", "Animations", "On frame changed", "Triggered when the current animation frame changes.", "OnFrameChanged");

AddCondition(5, 0, "Is mirrored", "Appearance", "Is mirrored", "True if the object has been mirrored with the 'Set Mirrored' action.", "IsMirrored");
AddCondition(6, 0, "Is flipped", "Appearance", "Is flipped", "True if the object has been flipped with the 'Set Flipped' action.", "IsFlipped");

AddCondition(7, cf_deprecated, "On image URL loaded", "Web", "On image URL loaded", "Triggered after 'Load image from URL' when the image has finished loading.", "OnURLLoaded");

AddCmpParam("Comparison", "How to compare the current animation speed.");
AddNumberParam("Number", "The animation speed to compare to.");
AddCondition(8, 0, "Compare speed", "Animations", "Animation speed {0} {1}", "Compare the current animation speed.", "CompareAnimSpeed");

////////////////////////////////////////
// Actions
AddObjectParam("Object", "Choose the object type of the new instance to create.");
AddLayerParam("Layer", "The layer name or number to create the instance on.");
AddAnyTypeParam("Image point", "Use 0 for the object's origin, or the name or number of an image point to spawn the object from.", "0");
AddAction(0, 0, "Spawn another object", "Misc", "Spawn {0} on layer <b>{1}</b> <i>(image point {2})</i>", "Create another object at this object.", "Spawn");

AddComboParamOption("Normal");
AddComboParamOption("Additive");
AddComboParamOption("XOR");
AddComboParamOption("Copy");
AddComboParamOption("Destination over");
AddComboParamOption("Source in");
AddComboParamOption("Destination in");
AddComboParamOption("Source out");
AddComboParamOption("Destination out");
AddComboParamOption("Source atop");
AddComboParamOption("Destination atop");
AddComboParam("Blend mode", "Choose the new blend mode for this object.");
AddAction(1, 0, "Set blend mode", "Appearance", "Set blend mode to <i>{0}</i>", "Set the background blend mode for this object.", "SetEffect");

AddAction(2, 0, "Stop",    "Animations",  "Stop animation",  "Stop the current animation from playing.", "StopAnim");

AddComboParamOption("current frame");
AddComboParamOption("beginning");
AddComboParam("From", "Choose whether to resume or rewind the animation back to the first frame.");
AddAction(3, 0, "Start",  "Animations",  "Start animation from {0}",  "Start the current animation, if it was stopped.", "StartAnim");

AddAnimationParam("Animation", "The name of the animation to set.");
AddComboParamOption("current frame");
AddComboParamOption("beginning");
AddComboParam("From", "Choose whether to play from the same frame number or rewind the animation back to the first frame.", 1);
AddAction(4, 0, "Set animation", "Animations", "Set animation to <b>{0}</b> (play from {1})", "Set the current animation", "SetAnim");

AddNumberParam("Frame number", "The animation frame number to set (0-based).");
AddAction(5, 0, "Set frame", "Animations", "Set animation frame to <b>{0}</b>", "Set the current animation frame number.", "SetAnimFrame");

AddNumberParam("Speed", "The new animation speed, in animation frames per second.");
AddAction(6, 0, "Set speed", "Animations", "Set animation speed to <b>{0}</b>", "Set the current animation speed.", "SetAnimSpeed");

AddComboParamOption("Mirrored");
AddComboParamOption("Not mirrored");
AddComboParam("State", "Choose whether to horizontally mirror the object or set it back to normal.");
AddAction(7, 0, "Set mirrored", "Appearance", "Set <b>{0}</b>", "Set the object horizontally mirrored or back to normal.", "SetMirrored");

AddComboParamOption("Flipped");
AddComboParamOption("Not flipped");
AddComboParam("State", "Choose whether to vertically flip the object or set it back to normal.");
AddAction(8, 0, "Set flipped", "Appearance", "Set <b>{0}</b>", "Set the object vertically flipped or back to normal.", "SetFlipped");

AddNumberParam("Scale", "The object width and height to set, based on a multiple of its original dimensions, e.g. 1 = original size, 2 = double size, 0.5 = half size etc.", "1");
AddAction(9, 0, "Set scale", "Size & Position", "Set scale to <i>{0}</i>", "Set the width and height as a multiple of its original size.", "SetScale");

AddStringParam("URI", "Enter the URL on the web, or data URI, of an image to load.", "\"http://\"");
AddComboParamOption("Resize to image size");
AddComboParamOption("Keep current size");
AddComboParam("Size", "Whether to resize the sprite to the size of the loaded image, or stretch it to the current size.");
AddAction(10, af_deprecated, "Load image from URL", "Web", "Load image from <i>{0}</i> ({1})", "Replace the currently displaying animation frame with an image loaded from a web address or data URI.", "LoadURL");

AddNumberParam("Frame number", "The animation frame number to repeat to (0-based).");
AddAction(11, 0, "Set repeat-to frame", "Animations", "Set repeat-to frame to <b>{0}</b>", "Set the animation frame number to repeat to in a looping animation.", "SetAnimRepeatToFrame");
////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get animation frame", "Animations", "AnimationFrame", "The current animation frame number (0-based).");
AddExpression(1, ef_return_number, "Get animation frame count", "Animations", "AnimationFrameCount", "The number of animation frames in the current animation.");
AddExpression(2, ef_return_string, "Get animation name", "Animations", "AnimationName", "The name of the current animation.");
AddExpression(3, ef_return_number, "Get animation speed", "Animations", "AnimationSpeed", "The speed of the current animation, in animation frames per second.");
AddExpression(4, ef_return_number, "Get image width", "Animations", "ImageWidth", "The width of the current animation frame image, in pixels.");
AddExpression(5, ef_return_number, "Get image height", "Animations", "ImageHeight", "The height of the current animation frame image, in pixels.");

////////////////////////////////////////
// Expressions
ACESDone();

// Property grid properties for this plugin
var property_list = [
  new cr.Property(ept_link, "Animations", lang("project\\misc\\sprite-edit-link"), "Click to edit the object's animations.", "firstonly"),
  new cr.Property(ept_link, "Size", lang("project\\misc\\sprite-make11-link"), "Click to set the object to the same size as its image.", "worldundo"),
  new cr.Property(ept_combo,  "Initial visibility",  "Visible",  "Choose whether the object is visible when the layout starts.", "Visible|Invisible"),
  new cr.Property(ept_integer,"Initial frame",    0,      "The initial animation frame showing."),
  new cr.Property(ept_text,  "Initial animation",  "Default",  "The initial animation showing."),
  new cr.Property(ept_combo,  "Hotspot",        "Top-left",  "Choose the location of the hot spot in the object.", "Top-left|Center|Top|Top-right|Left|Right|Bottom-left|Bottom|Bottom-right")
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
  
  for (var i = 0; i < property_list.length; i++){
    this.properties[property_list[i].name] = property_list[i].initial_value;
  }
  // Plugin-specific variables
  this.just_inserted = false;
  this.texture_loaded = false;
  this.last_imgsize = new cr.vector2(0, 0);
  this.last_texture = null;
  this.last_texture_id = "";
}

IDEInstance.prototype.OnCreate = function()
{
  this.instance.SetHotspot(GetHotspot(this.properties["Hotspot"]));
}

IDEInstance.prototype.OnAfterLoad = function ()
{
  // Must initialise last_imgsize for correct updating of sprites on layouts without a tab open
  var texture = this.instance.GetTexture(this.properties["Initial frame"], this.properties["Initial animation"]);
  this.last_imgsize = texture.GetImageSize();
}

IDEInstance.prototype.OnInserted = function()
{
  this.just_inserted = true;
}

IDEInstance.prototype.OnDoubleClicked = function()
{
  this.instance.EditTexture();
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
  // Edit animations link
  if (property_name == "Animations")
  {
    this.instance.EditTexture();
  }
  else if (property_name === "Hotspot")
  {
    this.instance.SetHotspot(GetHotspot(this.properties["Hotspot"]));
  }
  // Make 1:1 link
  else if (property_name == "Size")
  {
    if (this.texture_loaded)
      this.just_inserted = true;    // will scale to texture size when redrawn and update property grid
    else
    {
      // The object could be resized, but we can't refresh the property grid here.
      // Just assume the layout is always open, and prompt if not.
      alert("The object cannot be scaled to original size unless the layout containing it is open.");
    }
  }
}

IDEInstance.prototype.OnRendererInit = function(renderer)
{
  this.last_texture = this.instance.GetTexture(this.properties["Initial frame"], this.properties["Initial animation"]);
  this.last_texture_id = this.last_texture.GetID();
  renderer.LoadTexture(this.last_texture);
  
  this.texture_loaded = true;
  this.instance.SetHotspot(GetHotspot(this.properties["Hotspot"]));
}
  
// Called to draw self in the editor
IDEInstance.prototype.Draw = function(renderer)
{
  var texture = this.instance.GetTexture(this.properties["Initial frame"], this.properties["Initial animation"]);
  var texture_id = texture.GetID();
  
  if (this.last_texture_id !== "" && this.last_texture_id !== texture_id)
  {
    // Texture has changed: unload old and reload new.
    if (this.last_texture)
      renderer.ReleaseTexture(this.last_texture);
      
    renderer.LoadTexture(texture);
    this.instance.SetHotspot(GetHotspot(this.properties["Hotspot"]));
  }
  
  this.last_texture = texture;
  this.last_texture_id = texture_id;
  
  renderer.SetTexture(this.last_texture);
  
  // First draw after insert: use size of texture.
  // Done after SetTexture so the file is loaded and dimensions known, preventing
  // the file being loaded twice.
  if (this.just_inserted)
  {
    this.just_inserted = false;
    var sz = texture.GetImageSize();
    this.instance.SetSize(sz);
    RefreshPropertyGrid();    // show new size
  }

  var imgsize = texture.GetImageSize();
  this.last_imgsize = imgsize;
  // Calculate tiling
  // This ignores cards without NPOT texture support but... meh.  Tiling by repeated quads is a massive headache.
  var objsize = this.instance.GetSize();
  var uv = new cr.rect(0, 0, objsize.x / imgsize.x, objsize.y / imgsize.y);
  
  renderer.EnableTiling(true);
  renderer.Quad(this.instance.GetBoundingQuad(), this.instance.GetOpacity(), uv);
  renderer.EnableTiling(false);
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
  this.texture_loaded = false;
  renderer.ReleaseTexture(this.last_texture);
}

IDEInstance.prototype.OnTextureEdited = function ()
{
  var texture = this.instance.GetTexture(this.properties["Initial frame"], this.properties["Initial animation"]);
  this.instance.SetHotspot(GetHotspot(this.properties["Hotspot"]));
  var imgsize = texture.GetImageSize();

  // If sprite texture has been edited and changed size, scale the texture accordingly.
  if ((imgsize.x !== this.last_imgsize.x || imgsize.y !== this.last_imgsize.y)
    && (this.last_imgsize.x !== 0 && this.last_imgsize.y !== 0))
  {
    var sz = new cr.vector2(imgsize.x / this.last_imgsize.x, imgsize.y / this.last_imgsize.y);
    var instsize = this.instance.GetSize();
    
    sz.mul(instsize.x, instsize.y);
    this.instance.SetSize(sz);
    
    this.last_imgsize = imgsize;
  }
  this.last_texture = texture;
  this.last_texture_id = texture.GetID();
}