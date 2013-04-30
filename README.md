Mipey's Spritefont
==================

#Sprite Font

##Display text using a bitmap font.


* Download spritefont (Revision: 28th August 2012)
* Extract the contents into Construct 2\exporters\html5\plugins

##Older releases:

 * Spritefont v7 31th July 2012
 * Spritefont v6 7th May 2012 release

Download the example capx project showcasing Sprite Font

##Another example featuring two fonts



###Features

* load a font strip (an image containing series of characters)
* monospaced font (Sprite Font splits the image into tiles of equal width)
* instanced (you can have as many instances of the Sprite Font object that share the same font strip, but display different text at different locations)
* once you add the Sprite Font object in editor, you will be prompted to load an image, the font strip.
* once you've added the font strip, edit the Character Set property by entering a string of character that correspond to the letters in font strip.
* be sure to enter proper Character width and Character height values as well (think of them as tiles of the tileset)
* box width and box height represent the size of a text box containing the text (basically a grid). May change the wording later to avoid confusion.
* WebGL support
* "Force Point Sampling" property to force point sampling of text in WebGL rendering mode



###Actions

* Set text (text) - Sets the text to be displayed.
* Append text (text) - Adds the text at end of existing text.
* Set word wrapping method (None, Break, By word) - Choose the text wrapping method: None, Break (wraps text into new line), By word (try to keep whole words; any words longer than 10 will be broken regardless)
* Set Resize Mode (None, Limited width, Limited height, Fixed size) - Determines how the bounding box is resized. None: don't resize automatically, Limited width: wrap at given width, unlimited lines; Limited height: limit number of lines, unlimited width; Fixed size: hard limit, only show text inside within given size)
* Set text scale(float) - Set the font size, e.g. 2 for double size, 0.5 for half size)
* Set text parameters - Set several parameters of the selected sprite font objects (text, text wrapping, resize mode, line length limit, line count limit, scale)
* Set text align (Left,Center,Right | Top,Middle,Bottom) - Sets the text alignment.
* Toggle debug - toggles debug mode (shows outline around text at the moment)
* Set horizontal spacing(pixels) - spacing between letters, can be negative
* Set vertical spacing(pixels) - spacing between lines, can be negative
* Set Effect(effect) - Set blending mode (effect)



###Conditions

Deprecated until I fix picking problem



###Expressions

* charHeight - returns height of individual character
* charWidth - returns width of individual character
* getResizeMode - returns current resize mode
* getResizeWidth - returns current line length limit
* getResizeHeight - returns current line count limit
* getScale - returns current scale
* text - returns current text
* getHorizontalAlign - returns current text horizontal alignment
* getVerticalAlign - returns current text vertical alignment
* getHorizontalSpacing
* getVerticalSpacing



###TODO:

* if possible, render text in edittime
* hotspots?
* conditions (disabled the two compare text condition, present bug)

Please report bugs and suggest features here!



###HOW-TO: Creating a Sprite Font compatible font strip

  1. Open your text editor and type out all letters that you want to use in a straight string.
  2. Open your image editor of choice, add text, paste the string.
  3. Select font, resize as needed.


Make sure you resize in a way you can get a whole number as text width. For example, if you have 100 characters in the string and the whole font sprit is 1200 pixels wide, each font is 1200/100 = 12 pixels wide. Get the height in pixels as well, leave a little white space, however you want.

Finally, save the image and import it to Construct 2 (by editing Sprite Font texture). Insert the character width and height there, in charset insert that string you pasted and - voila! You're set.



##TIPS
1. Sprite Font can also use tilesets, not just font strips, basically anything that is a grid of images.

2. Sprite Font object uses the same texture for all its instances. Add another Sprite Font object and you can use another font!

3. Sprite Font behaves just like Text object. Don't like how Text object behaves? Frustrated at font woes? Create your own font strip and use the Sprite Font!

4. Some characters may need to be escaped with \ before them in a string. To be on the safe side, stick to alphanumeric characters!

5. Don't like how letters are placed so widely? Use horizontal spacing to get them tighter!
