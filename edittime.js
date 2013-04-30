function GetPluginSettings()
{
	return {
		"name":			"Sprite Font",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"SpriteFont",				// this is used to identify this plugin and is saved to the project; never change it
        "version":      "8",                        // version++ on each update. Last updated: 31th July 2012
		"description":	"Sprite Font displays text using image font",
		"author":		"Miha Petelin",
		"help url":		"http://www.scirra.com/forum/plugin-spritefont_topic45876.html",
		"category":		"General",				// Prefer to re-use existing categories, but you can set anything here
		"type":			"world",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	true,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		0						// uncomment lines to enable flags...
					//	| pf_singleglobal		// exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
						| pf_texture			// object has a single texture (e.g. tiled background)
						| pf_position_aces		// compare/set/get x, y...
						| pf_size_aces			// compare/set/get width, height...
						| pf_angle_aces			// compare/set/get angle (recommended that "rotatable" be set to true)
						| pf_appearance_aces	// compare/set/get visible, opacity...
						| pf_tiling				// adjusts image editor features to better suit tiled images (e.g. tiled background)
					//	| pf_animations			// enables the animations system.  See 'Sprite' for usage
                        | pf_zorder_aces
					//	| pf_nosize
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

// DEPRECATED
AddStringParam("Text to compare", "Enter the text to compare with current text.", '""');
AddComboParamOption("Ignore case");
AddComboParamOption("Case sensitive");
AddComboParam("Case sensitivity", 'Choose whether to treat upper case and lower case as the same, e.g. "ABC" is the same as "abc"', 0);
AddCondition(0, cf_deprecated, "Compare text", "Text", "Text is <b>{0}</b> <i>({1})</i>", "Compare the current text with given text.", "compareText");


// DEPRECATED
AddStringParam("Text to find", "Enter the text to find within current text.", '""');
AddComboParamOption("Ignore case");
AddComboParamOption("Case sensitive");
AddComboParam("Case sensitivity", 'Choose whether to treat upper case and lower case as the same, e.g. "ABC" is the same as "abc"', 0);
AddCondition(1, cf_deprecated, "Contains text", "Text", "Text contains <b>{0}</b> <i>({1})</i>", "Check whether the current text contains given text.", "containsText");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

AddAnyTypeParam("Text", "Enter the text to be displayed.", '""');
AddAction(0, af_none, "Set text", "Text", "Set text to <i>{0}</i>", "Set the text.", "setText");

AddAnyTypeParam("Text", "Enter the text to append to current text.", '""');
AddAction(1, af_none, "Append text", "Text", "Append <i>{0}</i> to text", "Add text to the end of the existing text.", "appendText");

AddComboParamOption("None");
AddComboParamOption("Break");
AddComboParamOption("By word");
AddComboParam("Text wrap", 'Choose a text wrapping method.', 0);
AddAction(2, af_none, "Set word wrapping", "Text", "Set word wrapping method to <i>{0}</i>", 'Set the word wrapping to: "None" - no word wrapping, "Break" - break at end of line, "By word" - do not break words', "setWordWrap");

AddNumberParam("Scale", "Set the desired text scale (default 1.0, set to 2.0 for double size, 0.5 half size",1.0);
AddAction(3, af_none, "Set text scale", "Text", "Set text scale to <i>{0}</i>", "Change the sprite font size.", "setScale");

AddComboParamOption("No resize");
AddComboParamOption("Limited width");
AddComboParamOption("Limited height");
AddComboParamOption("Fixed size");
AddComboParam("Resize mode", "Choose the resizing method of text box size. No resize: no auto-resizing, allows manual resizing. Limited width: text wraps at width, unlimited lines. Limited height: limited lines, unlimited width. Fixed size: Limit text to this size.",0);
AddAnyTypeParam("Line length", "Maximum number of characters in a line.", 40);
AddAnyTypeParam("Line count", "Maximum number of lines.", 1);
AddAction(4, af_none, "Set Resize Mode", "Text", "Set resize mode to <i>{0}</i>, text length limit to <i>{1}</i>, line count limit to <i>{2}</i>", "Set the auto-resizing method for textbox containing text.", "setResizeMode");

AddAnyTypeParam("Text", "Enter the text to be displayed.", '""');
AddComboParamOption("None");
AddComboParamOption("Break");
AddComboParamOption("By word");
AddComboParam("Text wrap", 'Choose a text wrapping method. None: text is not wrapped. Break: text is broken into new line. By word: same as break, except it tries to keep words whole.', 0);
AddComboParamOption("No resize");
AddComboParamOption("Limited width");
AddComboParamOption("Limited height");
AddComboParamOption("Fixed size");
AddComboParam("Resize mode", "Choose the resizing method of text box size. No resize: no auto-resizing, allows manual resizing. Limited width: text wraps at width, unlimited lines. Limited height: limited lines, unlimited width. Fixed size: Limit text to this size.",0);
AddAnyTypeParam("Line length", 'Maximum number of characters in a line. Applies when "Limited width" or "Fixed size" resize options are set.', 40);
AddAnyTypeParam("Line count", 'Maximum number of lines. Applies when "Limited height" or "Fixed size" resize options are set.', 1);
AddNumberParam("Scale", "Set the text font size multiplier, e.g. 2 is double size, 0.5 half size.", 1);
AddAction(5, af_none, "Set text parameters", "Text", "Set: Text <i>{0}</i> | Text wrap: <i>{1}</i> | Resize mode: <i>{2}</i> | Text length: <i>{3}</i> | Line count: <i>{4}</i> | Scale: <i>{5}x</i> | Text align: <i>{6},{7}</i>", "Set text parameters (content, text wrap, resize mode, length and line limits, scale)", "setTextParams");

AddAction(6, af_none, "Toggle debug mode", "Text", "Toggle debug", "Toggles the debugging mode (shows textbox outlines)","toggleDebug");

AddComboParamOption("Left");
AddComboParamOption("Center");
AddComboParamOption("Right");
AddComboParam("Horizontal text alignment", "Choose the horizontal text alignment.", 0);
AddComboParamOption("Top");
AddComboParamOption("Middle");
AddComboParamOption("Bottom");
AddComboParam("Vertical text alignment", "Choose the vertical text alignment.", 0);
AddAction(7, af_none, "Set text align", "Text", "Set text alignment: horizontal to <i>{0}</i>, vertical to {1}", "Set the horizontal and vertical text alignment.", "setTextAlign");
AddNumberParam("Horizontal spacing", "Set horizontal spacing between letters. Negative: tighter letters, positive: sparser letters.", 0);
AddAction(8, af_none, "Set horizontal spacing", "Text", "Set horizontal spacing to <i>{0}</i>","Sets the horizontal spacing between characters.","setHorizontalSpacing");
AddNumberParam("Vertical spacing", "Set vertical spacing between lines. Negative: tighter lines, positive: sparser lines.", 0);
AddAction(9, af_none, "Set vertical spacing", "Text", "Set vertical spacing to <i>{0}</i>","Sets the vertical spacing between lines.","setVerticalSpacing");

AddComboParamOption("(none)");
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
AddComboParam("Effect", "Choose the new effect for this object.");
AddAction(10, 0, "Set effect", "Appearance", "Set effect to <i>{0}</i>", "Set the rendering effect of this object.", "SetEffect");

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

AddExpression(0, ef_return_string, "Get text", "Text", "text", "Get the current text.");
AddExpression(1, ef_return_number, "Get character width", "Text", "charWidth", "Get the width of a single character in pixels.");
AddExpression(2, ef_return_number, "Get character height", "Text", "charHeight", "Get the height of a single character in pixels.");
AddExpression(3, ef_return_number, "Get text scale", "Text", "getScale", "Get the current text scale.");
AddExpression(4, ef_return_string, "Get resize mode", "Text", "getResizeMode", "Get the current active resize mode.");
AddExpression(5, ef_return_number, "Get line length limit", "Text", "getResizeWidth", "Get the current width limit of autoresize.");
AddExpression(6, ef_return_number, "Get line count limit", "Text", "getResizeHeight", "Get the current height limit of autoresize.");
AddExpression(7, ef_return_string, "Get horizontal text alignment", "Text", "getHorizontalAlign", "Get the current horizontal alignment.");
AddExpression(8, ef_return_string, "Get vertical text alignment", "Text", "getVerticalAlign", "Get the current horizontal alignment.");
AddExpression(9, ef_return_number, "Get horizontal spacing", "Text", "getHorizontalSpacing", "Get the current horizontal spacing.");
AddExpression(10, ef_return_number, "Get vertical spacing", "Text", "getVerticalSpacing", "Get the current vertical spacing.");
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
    new cr.Property(ept_link, "Font strip", "Edit", "Load a font strip containing individual character images in a grid.", "firstonly"),
    new cr.Property(ept_integer, "Character width", 16, "Width of a single character image in pixels."), // 0
    new cr.Property(ept_integer, "Character height", 16, "Height of a single character image in pixels."), // 1
    new cr.Property(ept_text, "Character set", "0123456789", "A string of characters in the same order as on font strip."), // 2
    new cr.Property(ept_text, "Text", "Test", "Enter the text to display."), // 3
    new cr.Property(ept_combo, "Text wrap", "None", "Text wrapping method. None - extra text is not displayed;Bbreak - breaks text into more lines; By word - as break, but keeps whole words.", "None|Break|By word"), // 4
    new cr.Property(ept_float, "Text scale", 1.0, "Text size multiplier (0.5 for half size, 2 for double size)"), // 5
    new cr.Property(ept_combo, "Resize mode", "No resize", "Textbox resize mode; No resize - allows manual resizing, Limit length - text wrap at width, Limit lines - limited number of lines, Fixed size - textbox size always at specified size", "No resize|Limit length|Limit lines|Fixed size"), // 6
    new cr.Property(ept_integer, "Max length", 40, "Number of characters in a line (ignored if no resize mode set)"), // 7
    new cr.Property(ept_integer, "Max lines", 1, "Maximum number of lines (ignored if no resize mode set)"), // 8
    new cr.Property(ept_combo, "Horizontal align", "Left", "Text horizontal alignment", "Left|Center|Right"), // 9
    new cr.Property(ept_combo, "Vertical align", "Top", "Text vertical alignment", "Top|Middle|Bottom"), // 10
    new cr.Property(ept_combo, "Force point sampling", "No", "Forces point sampling of text in WebGL", "No|Yes"), // 11
    new cr.Property(ept_integer, "Horizontal spacing", 0, "Horizontal spacing between letters. Negative: tighter letters, positive: sparser letters."), // 12
    new cr.Property(ept_integer, "Vertical spacing", 0, "Vertical spacing between lines. Negative: tighter lines, positive: looser lines."), // 13
    new cr.Property(ept_combo, "Effect", "(none)", "Choose an effect for this object.  (This does not preview in the layout, only when you run.)", "(none)|Additive|XOR|Copy|Destination over|Source in|Destination in|Source out|Destination out|Source atop|Destination atop") // 14
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
	this.instance.SetHotspot(new cr.vector2(0, 0));
	this.charMap = [];
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{

}

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
    this.instance.EditTexture();
}

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
    if (property_name === "Font strip")
	{
		this.instance.EditTexture();
	}
}

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
    // renderer.LoadTexture(this.instance.GetTexture());
}

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{

    renderer.Outline(this.instance.GetBoundingQuad(),cr.RGB(0,255,0));

}

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{

}
