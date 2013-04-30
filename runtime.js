// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.SpriteFont = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.SpriteFont.prototype;
		
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
		// Create the texture
		this.FontStrip = new Image();
		this.FontStrip.src = this.texture_file;
		this.FontStrip.cr_filesize = this.texture_filesize;
		
		// Tell runtime to wait for this to load
		this.runtime.wait_for_textures.push(this.FontStrip);
		
        this.webGL_texture = null;
		
		// Create buffer canvas (in-memory)
		this.buffer = document.createElement('canvas');
		this.bufctx = this.buffer.getContext('2d');
		
		// one rect/quad per object, reusable
		this.gl_rect = new cr.rect(0,0,1,1);
		this.gl_quad = new cr.quad();
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
		this.bCanvas = document.createElement('canvas'); // one buffer canvas per instance
		this.bctx = this.bCanvas.getContext('2d');
		this.compositeOp = cr.effectToCompositeOp(this.properties[14]);
		cr.setGLBlend(this, this.properties[14], this.runtime.gl);
    
        this.charSet = this.properties[2];
        this.text = this.properties[3];
        this.wrapMethod = this.properties[4]; // 0 = None, 1 = Break, 2 = By word

        this.scale = this.properties[5]; // text scale / size modifier (float)
        if (this.scale <= 0) {this.scale = 1.0;}; // don't allow zero or negative, revert to default size

        this.autoResize = this.properties[6]; // 0 = No resize, 1 = Limit length, 2 = Limit lines, 3 = Fixed size
		this.maxLength = this.properties[7] // max characters in a line
        this.maxLines = this.properties[8] // max lines
       
        this.hAlign = this.properties[9]; // text horizontal alignment: 0 - left, 1 - center, 3 - right
        this.vAlign = this.properties[10]; // text vertical alignment: 0 - top, 1 - middle, 2 - bottom

        // tile definitions
        this.tile = {};
        this.tile.w = this.properties[0]; // original width, don't change!
        this.tile.h = this.properties[1]; //original height, don't change!
        this.tile.sw = Math.round(this.properties[0] * this.properties[5]); // scaled tile width
        this.tile.sh = Math.round(this.properties[1] * this.properties[5]); // scaled tile height
        this.tile.hs = this.properties[12]; // horizontal spacing between characters; negative for tighter letters, positive for sparser letters
        this.tile.vs = this.properties[13]; // vertical spacing between lines; negative for tighter lines, positive for sparser lines
        
        this.resetGridSize(); // adjust the maxLength and maxLines
		
		this.charMap = [];  // charcode-indexed sparse array with internal coordinate sets for individual characters
        this.prepareCharMap(); // populate the charMap
        this.textGrid = []; // 2D array (grid) to contain prepared text; should be updated on each on text change, size change and wrapping method change
		this.gridChanged = true; // just declaring the variable, prepareText() toggles it by itself
		this.prepareText(); // set this to true whenever text properties are changed.
        
		this.webGL_texture = null;
		
		this.forcePointSampling = (this.properties[11] === 1) ? true : false;

        this.debug = false; //debugging mode, toggle true to draw red outlines    
	};

    instanceProto.draw = function(ctx)
    {
		if(this.gridChanged) // if the text grid has changed somehow, re-render the text in buffer canvas
			this.drawBuffer(this.bctx);
		
		ctx.save();

        if(this.opacity !== 1.0) ctx.globalAlpha = this.opacity; // opacity

        if(this.debug)
        {
            ctx.strokeStyle = "#f00";
		    ctx.lineWidth = 1;
		}
		
		ctx.translate(this.x,this.y);
		ctx.rotate(this.angle);
		if(this.debug) ctx.strokeRect(0,0,this.width,this.height);
		ctx.drawImage(this.bctx.canvas, 0, 0, this.bctx.canvas.width*this.scale, this.bctx.canvas.height*this.scale);
		ctx.restore();
    }
    
    instanceProto.drawGL = function(glw)
    {
		if(this.gridChanged)
			this.drawBuffer(this.bctx);
			
		glw.setTexture(this.webGL_texture);
        glw.setOpacity(this.opacity);
		
		this.type.gl_rect.set(0,0,(this.bctx.canvas.width-1)*this.scale,(this.bctx.canvas.height-1)*this.scale); // remember this uses coordinates, so width/height minus one
		this.type.gl_quad.set_from_rotated_rect(this.type.gl_rect,this.angle);
		this.type.gl_quad.offset(this.x,this.y);
		glw.quad(this.type.gl_quad.tlx, this.type.gl_quad.tly, this.type.gl_quad.trx, this.type.gl_quad.try_, this.type.gl_quad.brx, this.type.gl_quad.bry, this.type.gl_quad.blx, this.type.gl_quad.bly);
    }
    /////////////////////////////////////
    // Private functions
	
	instanceProto.resetGridSize = function()
	{
		this.maxLength = (this.autoResize === 1 || this.autoResize === 3) ? this.maxLength : Math.floor((this.width - this.tile.hs)/((this.tile.w + this.tile.hs)*this.scale)); // max characters in a line
        this.maxLines = (this.autoResize === 2 || this.autoResize === 3) ? this.maxLines : Math.floor((this.height - this.tile.vs)/((this.tile.h + this.tile.vs)*this.scale)); // max lines
		// a couple guards
		if(this.maxLength < 1) this.maxLength = 1;
		if(this.maxLines < 1) this.maxLines = 1;
	}
	
	// Draw the unscaled and unrotated text into in-memory canvas. Called both by draw() and drawGL()
	instanceProto.drawBuffer = function(ctx)
	{
		var key = 0;
		var letter = {};
		
		// not accounting for the scale; the cached texture is resized during drawing calls
		ctx.canvas.width = this.maxLength*this.tile.w + (this.maxLength-1)*this.tile.hs;
		ctx.canvas.height = this.maxLines*this.tile.h + (this.maxLines-1)*this.tile.vs;
		ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
		
		for(var y = 0; y < this.textGrid.length; y++)
		{
			for(var x = 0; x < this.textGrid[y].length; x++)
			{
				key = this.textGrid[y].charCodeAt(x);
				if(key != 32 && this.charMap[key])
				{
					letter = this.charMap[key];
					ctx.drawImage(this.type.FontStrip, letter.x*this.tile.w, letter.y*this.tile.h, this.tile.w, this.tile.h, x*(this.tile.w+this.tile.hs), y*(this.tile.h+this.tile.vs), this.tile.w, this.tile.h);				
				}
			}
		}
		// prepare the webGL texture if webGL enabled
		if (this.runtime.gl)
		{
			if(this.webGL_texture)
				this.runtime.glwrap.deleteTexture(this.webGL_texture); // got to delete the old texture first, hopefully avoiding the memory leak!
			this.webGL_texture = this.runtime.glwrap.loadTexture(ctx.canvas, false, this.forcePointSampling ? false : this.runtime.linearSampling); // is this efficient?
		}
		
		this.gridChanged = false; // done
	}
    
    // run once at instance initialization
    instanceProto.prepareCharMap = function()
    {
        var dx = this.tile.w; // horizontal step (pixels)
        var dy = this.tile.h; // vertical step (pixels)
        var n = this.charSet.length; // number of tiles

        var mapWidth = Math.floor(this.type.FontStrip.width/dx); // grid width 

        for(var i = 0; i < n; i++)
        {
            var tileX = i%mapWidth;
            var tileY = Math.floor(i/mapWidth);
            
            this.charMap[this.charSet.charCodeAt(i)] = {};
            this.charMap[this.charSet.charCodeAt(i)].x = tileX;
            this.charMap[this.charSet.charCodeAt(i)].y = tileY;
        }
    }

	// run whenever text, size, angle etc. are modified
    instanceProto.prepareText = function()
    {
		this.resetGridSize();
        var lengthLimited = this.autoResize == 1 || this.autoResize == 3; // is the line length limited?
        var linesLimited = this.autoResize == 2 || this.autoResize == 3; // is the line count limited?

        // separate strings by newline
        var lines = this.text.split("\n");

        var processed = false;
        var index = 0;
        
        // now we have an array of lines, we need to do any word wrapping and sizing on them. Some delicious splicing.
        while(!processed)
        {
            var currentLine = lines[index];
            var excess = "";

            if(this.wrapMethod === 1 && currentLine.length > this.maxLength) // break the line
            {
                excess = currentLine.slice(this.maxLength);
                lines[index] = currentLine.slice(0,this.maxLength);
                lines.splice(index+1,0,excess);
            }
            else if (this.wrapMethod === 2 && currentLine.length > this.maxLength) //wrap by word
            {
                var lastSpace = currentLine.lastIndexOf(" ", this.maxLength);
                var lastTab = currentLine.lastIndexOf("\t", this.maxLength);
                var wsIndex = lastSpace>lastTab ? lastSpace : lastTab; // index of the last whitespace in string
                
				if (wsIndex > this.maxLength - Math.round(this.maxLength/3)) // bigger words should just be broken
                { 
                    excess = currentLine.slice(wsIndex+1); // slice from the last whitespace
					lines[index] = currentLine.slice(0,wsIndex);
                } 
                else
                {
                    excess = currentLine.slice(this.maxLength); // break the string normally
                    lines[index] = currentLine.slice(0,this.maxLength);
                }; 

                lines.splice(index+1,0,excess);
                // NOTE: no hyphenation, maybe later?
            }
            else {lines[index] = currentLine.slice(0,this.maxLength)}; // no text wrapping, disregard all text after the limit
			// if none of above conditions are true, the current line is unmodified

			// finally check to see if we're done; when we've exhausted all lines or reached the line limit)
			if(index+1 == lines.length || (lines.length >= this.maxLines))
			{
				lines.splice(this.maxLines); // remove the unnecessary lines
				processed = true; // no new lines were inserted this iteration, so we're done!
			}
			index++; // with the current line sorted out, we move to next line
        }
		
		// text alignment (within grid, not bounding box)
		for(var i=0;i<lines.length;i++)
		{
			lines[i].replace(/^\s*|\s*$/,""); // trim spaces
			if(this.vAlign > 0)
			{
				//this time we insert empty lines where necessary
				if(this.vAlign === 1) // middle
				{
					var start = lines.length;
					while(lines.length < Math.floor((this.maxLines+start)/2))
						lines.unshift("");
				}
				else if(this.vAlign === 2) // bottom
				{
					while(lines.length < this.maxLines)
						lines.unshift("");
				}
			}
			if(this.hAlign > 0) // time to align text!
			{
				// just pad left side with spaces to the maximum length
				if(this.hAlign === 1) // center
				{
					var start = lines[i].length;
					while(lines[i].length < Math.floor((this.maxLength+start)/2))
						lines[i] = " "+lines[i];
				}
				else if(this.hAlign === 2) // right
				{
					while(lines[i].length < this.maxLength)
						lines[i] = " "+lines[i];
				}
			}
		}

        // now with everything nicely sorted out, we set instance size if necessary

        if(this.autoResize != 0) // only resize if autoResizing is set
        {
            var newWidth = 0;
            var newHeight = 0;
            //need to determine the width of longest line
            var longestLine = 0;
            for (var i = 0; i<lines.length; i++) { if(lines[i].length > lines[longestLine].length) longestLine = i};

            newWidth = lengthLimited ? (this.maxLength*this.tile.sw + (this.maxLength-1)*this.tile.hs) : (lines[longestLine].length*this.tile.sw + (lines[longestLine].length-1)*this.tile.hs);
            newHeight = linesLimited ? (this.maxLines*this.tile.sh + (this.maxLines-1)*this.tile.vs) : (lines.length*this.tile.sh + (lines.length-1)*this.tile.vs);
            
            if (newWidth != this.width || newHeight != this.height) //only if the width or height are actually different
            {
                this.width = newWidth;
                this.height = newHeight;
                this.set_bbox_changed();
            }
        }

        // update the textGrid property
        this.textGrid = lines; 
        // set the renderer to redraw the text
		this.gridChanged = true;
        this.runtime.redraw = true;
    }

	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;


	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	
	acts.SetEffect = function (effect)
	{	
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};

    acts.setText = function(param)
	{
		if (typeof param === "number")
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		
		var text_to_set = param.toString();
		
		if (this.text !== text_to_set) // no point in setting redrawing the identical text
		{
			this.text = text_to_set;
			this.prepareText();
		}
	};
	
	acts.appendText = function(param)
	{
		if (typeof param === "number")
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
			
		var text_to_append = param.toString();
		
		if (text_to_append)	// not empty
		{
			this.text += text_to_append;
			this.prepareText();
		}
	};

	acts.setWordWrap = function(param)
	{
	    if(param === 0 || param === 1 || param === 2)
	    {
            if(param != this.wrapMethod)
            {
                this.wrapMethod = param;
                this.prepareText();
            }
        }
	}

    acts.SetSize = function(newWidth,newHeight)  // size of bounding box in pixels
    {
        if( newWidth >= 0 && newHeight >= 0 ) // no negatives allowed
        {
            if ((newWidth != this.width) || (newHeight != this.height))
            {
                this.width = newWidth;
                this.height = newHeight;
                this.set_bbox_changed();
                this.prepareText(); 
            }
        }
    }

    acts.SetWidth = function(newWidth) // width of bounding box in pixels
    {
        if(newWidth >= 0 && this.width != newWidth)
        {
            this.width = newWidth;
            this.set_bbox_changed();
            this.prepareText();
        }
    }

    acts.SetHeight = function(newHeight) // height of bounding box in pixels
    {
        if(newHeight >= 0 && this.height != newHeight)
        {
            this.height = newHeight;
            this.set_bbox_changed();
            this.prepareText();
        }
    }

    acts.setScale = function(scale)
    {
        if(scale > 0 && this.scale != scale)
        {
            this.scale = scale;
            this.tile.sw = Math.round(this.tile.w*this.scale);
            this.tile.sh = Math.round(this.tile.h*this.scale);
            this.prepareText();
        }
    }

    acts.setResizeMode = function(method, width, height)
    {
        if(method != this.autoResize || width != this.maxLength || height != this.maxLines)
        {
            this.autoResize = method;
            this.maxLength = width;
            this.maxLines = height;
            this.prepareText();
        }
    }

    acts.setTextParams = function(text, textWrap, resizeMode, lengthLimit, lineCount, scale)
    {
        this.text = text;
        this.wrapMethod = textWrap;
        this.autoResize = resizeMode;
        this.maxLength = lengthLimit;
        this.maxLines = lineCount;
        this.scale = (scale > 0) ? scale : 1.0; // default value, number must be greater than 0
        //update the scaled sizes
        this.tile.sw = Math.round(this.tile.w*this.scale);
        this.tile.sh = Math.round(this.tile.h*this.scale);

        //prepare the text for rendering
        this.prepareText();
    }

    acts.setTextAlign = function(hAlign, vAlign)
    {
        if(hAlign !== this.hAlign || vAlign !== this.vAlign)
        {
            this.hAlign = hAlign;
            this.vAlign = vAlign;
			this.prepareText();
        }
    }

    acts.toggleDebug = function()
    {
        this.debug = this.debug ? false : true;
        this.runtime.redraw = true;
    }
    
    acts.setHorizontalSpacing = function(hs)
    {
        if(this.tile.hs != hs)
        {
            this.tile.hs = hs;
			this.prepareText();
        }
    }
    
    acts.setVerticalSpacing = function(vs)
    {
        if(this.tile.vs != vs)
        {
            this.tile.vs = vs;
			this.prepareText();
        }
    }

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

    exps.text = function(ret){ret.set_string(this.text)}
    
    exps.charWidth = function(ret){ret.set_int(this.tile.w)}
    exps.charHeight = function(ret){ret.set_int(this.tile.h)}
    
    exps.wrapMethod = function(ret)
    {
        switch(this.wrapMethod)
        {
            case 0: 
                ret.set_string("None");
                break;
            case 1:
                ret.set_string("Break");
                break;
            case 2:
                ret.set_string("By word");
                break;
            default:
                ret.set_string("Error");
        }        
    }

    exps.scale = function(ret)
    {
        ret.set_float(this.scale);
    }

    exps.getResizeMode = function(ret)
    {
        switch(this.autoresize)
        {
            case 1:
                ret.set_string("Limit length");
                break;
            case 2:
                ret.set_string("Limit lines");
                break;
            case 3:
                ret.set_string("Fixed size");
                break;
            default:
                ret.set_string("No resize");
                break;                
        }
    }
    
    exps.getResizeWidth = function(ret){ret.set_int(this.maxLength)}
    exps.getResizeHeight = function(ret){ret.set_int(this.maxLines)}
    exps.getHorizontalAlign = function(ret){ret.set_string(this.hAlign != 0 ? (this.hAlign == 1 ? "Center" : "Right") : "Left")}
    exps.getVerticalAlign = function(ret){ret.set_string(this.vAlign != 0 ? (this.vAlign == 1 ? "Middle" : "Bottom") : "Top")}
    exps.getHorizontalSpacing = function(ret){ret.set_float(this.tile.hs)}
    exps.getVerticalSpacing = function(ret){ret.set_float(this.tile.vs)}
	
	///////////////////////
	// DEPRECATED ACES
	
    cnds.compareText = function(text_to_compare, case_sensitive) // DEPRECATED
	{
		if (case_sensitive)
			return this.text == text_to_compare;
		else
			return this.text.toLowerCase() == text_to_compare.toLowerCase();
	};

	cnds.containsText = function(text_to_find, case_sensitive) // DEPRECATED
	{
	    if (text_to_find) //not empty
	    {
            return (this.text.search(new RegExp(cr.regexp_escape(text_to_find.toString()), case_sensitive ? "" : "i")) == -1) ? false : true;
        }
        else return false;
    }	
}());