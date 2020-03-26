# Toolkit - Swiss

**Project on HOLD indefinitely**

**Official version:** [0.3](#version-flow);
**Status:** Still under development / Testing;

I created this simple chrome extension to help me on my researches on the web. It's incomplete, but I have ideas to improve it. I am doing it slowly, because I only code it on free time. I have been developing it for a short time, although it's already useful for me on daily basis.

## Description

I coded it in a way to make the creation process more easy and fast to implement new tools, focusing only in the tool itself. The base of injecting and parsing html already done. Soon as I get a solid base and stable version I will write a full-guide to write tools. In time the tools I included already are very self explanatory.

I created the **Tool** class to make easy and clean to implement new tools. Now it's much more simplier and faster. I still working on it to make it more flexible and faster.

You can see on the tools available to see how code new tools. I documented the Tool class to make easy to understand. For now the documentation is inside of the code. Isn't pretty well documented yet, but soon as I make this extension stable I will start to document it better.

I posted some overview of the ToolKit Swiss and hot to implement a new tool on my blog:

* https://verseinversing.blogspot.com.br/2017/07/toolkit-swiss-chrome-extension.html

Any idea, bug, question just send it to me, I will be glad helping.

## Version FLOW

* **0.3**
  * Bug fixes
  * Tool class enhanced
  * ToolKit class enhanced
  * Performance enhanced in all classes
  * ToolKit Swiss structure was redefined
  * Tool creation was redisigned
  * Tool class handles all events attached to the tool
  * No hard-code needed to implement new tool
  * Each tool has its own context
  * Window concept implemented (All tools are Windows)
  * Window can be resized, moved, minimized, maximized and closed
  * New icons for window. All from IconFinder (Free)
  * Black background can be supressed 
  * Removed junk code
  * Started to moving from callbacks to Promises (Slowly)
  * Next version the callbacks will be enchanced
* **0.2**
  * Tool class added;
  * Tool [Code Highlight] Added;
  * Tool [Base64 Encode-Decode] Added;
  * Enhanced FrontEnd tool calling;
  * Enhanced tool implementation;
  * No need to duplicate code anymore, just inherit from Tool;
  * Automatic Tab/Container controlling;
  * Set events throught Tool class;
  * Removing junk code;
  * Partial JSDOC;
  * Migrated all tools to new Tool class implementation;
  * Improving performance in the whole project;
* **0.1**
  * Rustic implementation; Still improving;

## Tools so far

* TranslateIt
* HexConverter
* Code Highlight
* Base64 Encode-Decode
* Others incoming...

