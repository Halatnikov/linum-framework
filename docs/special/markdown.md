---
title: Markdown template
---

Click "Edit" to see how all of the things here are written
`Note: every preview is placed in admonitions`

---

# Basic syntax

---

# Extended syntax
Quick rundown through syntax available with extensions, which can be explained quickly

## Nesting elements
`uses extension: pymdownx.superfcences`
!!! note ""
	> this is a quote
	> ```
	> this is a code block
	> 
	> inside a quote
	> ```

## Marking
`uses extension: pymdownx.mark`
!!! note ""
	==This is a marked text==
	A ==word== can be ==highlighted== too

## Inserting (underscoring)
`uses extension: pymdownx.caret`
!!! note ""
	^^This is an inserted text^^
	A ^^word^^ can be ^^underscored^^ too

## Deleting (strike-through)
`uses extension: pymdownx.tilde`
!!! note ""
	~~This is a deleted text~~
	A ~~word~~ can be ~~striked-through~~ too

## Emoji and icons
Full list can be found [here](https://squidfunk.github.io/mkdocs-material/reference/icons-emojis/#search)
`uses extension: pymdownx.emoji`
!!! note ""
	emoji: :smile:
	icon (replace all / with -): :fontawesome-regular-face-smile:

## Buttons
Just a regular link but with an attribute attached
`uses extension: attr_list`
!!! note ""
	[Empty button][index]{ .md-button }
	
	[Filled button][index]{ .md-button .md-button--primary }

## Keyboard keys
A full list can be found [here](https://facelessuser.github.io/pymdown-extensions/extensions/keys/#key-map-index)
`uses extension: pymdownx.keys`
!!! note ""
	++ctrl+alt+delete++
	++z++
	++alt+f4++
	++arrow-up+arrow-up+arrow-down+arrow-down+arrow-left+arrow-right+arrow-left+arrow-right+b+a+enter++

## Superscript 
Small symbols facing up
`uses extension: pymdownx.caret`
!!! note ""
	H^2^0
	this is^a\ superscript^

## Subscript
Small symbols facing down
`uses extension: pymdownx.tilde`
!!! note ""
	CH~3~CH~2~OH
	this is~a\ subscript~

## Highlighting changes
This has a somewhat limited use scope
`uses extension: pymdownx.critic`
!!! note ""
	You can make {--striked-through text red--} and {++underscored text green++}
	And also {>>make comments inline<<}
	
	{==
	You can do blocks too!
	==}

## Tabs
`uses extension: pymdownx.tabbed`
!!! note ""
	=== "Tab 1"
		this is a tab
		- it can contain *anything*
	=== "Tab 2"
		```
		this is a code block in a tab
		which is kinda a primary target for these
		```

---

# Abbreviations
Only plain text is supported
`uses extension: abbr`

## Regular
!!! note ""
	This can technically be any word whatsoever

*[any word]: Yes, this one

## With a glossary
See bottom of this file in editor
`uses extension: pymdownx.snippets`
!!! note ""
	The INI files that Linum uses are actually converted to JSON in-engine

---

# Admonitions
Also known as call-outs
`uses extension: admonition`

## Regular blocks
!!! note "This is a title"
    This is a text
!!! note ""
    Look, there's no title

## Collapsible blocks
`uses extension: pymdownx.details`
??? fail "Closed"
	This is a closed collapsible block
???+ success "Open"
	This is an open collapsible block

## Types of blocks
??? summary "Click to open"
	Built-in:
	!!! note
	!!! summary
		`abstract`, `tldr`
	!!! info
		`todo`
	!!! hint
		`tip`, `important`
	!!! success
		`check`, `done`	
	!!! help
		`question`, `faq`	
	!!! warning
		`caution`, `attention`	
	!!! fail
		`missing`	
	!!! danger
		`error`		
	!!! bug
	!!! example
	!!! quote

---

# Code blocks

## Regular
!!! note ""
	this is an `inline code block`
	```
	this is a code block
		line 2
			line 3
	```

## Syntax highlighting
`uses extensions: pymdownx.highlight, pymdownx.inlinehilite`
!!! note ""
	in an inline code block: `#!ini [Section]`
	in a regular code block:
	``` ini
	[Section]
	key=value
	# comment
	```

## Adding a title
`uses extension: pymdownx.highlight`
!!! note ""
	``` title="This is a title"
	indeed it is
	```

## Code annotations
`uses feature flag: content.code.annotate`
!!! note ""
	``` ini
	# comment (1)
	```

	1.	this a code annotation, it can be placed anywhere where a comment can be placed in that language

## Line numbers
`uses extension: pymdownx.highlight`
!!! note ""
	can start from any line:
	``` ini linenums="10"
	[Section]
	key=value
	# comment
	```
	you can also mark them:
	``` ini hl_lines="2 3" linenums="1"
	[Section]
	key=value
	key2=value2
	# comment
	```

## Embedding external files
`uses extension: pymdownx.snippets`
!!! note ""
	``` ini title="LinumDefault/levels/example/leveldata/_mapdata.ini"
	--8<-- "LinumDefault/levels/example/leveldata/_mapdata.ini"
	```

# Tables
`uses extension: tables`

## Regular
!!! note ""
	|this|is a|table|
	|:-|:-:|-:|
	|left-aligned|middle-aligned|right-aligned|
	|1|2|3|

## Sorted table
Every table can also be sorted by clicking on it
`uses javascript: tablesort`
!!! note ""
	|Number|Alphabetical|Version|Month|Date|
	|-|-|-|-|-|
	|0|C|0.1.0|January|01/Jan/2022|
	|1|B|0.7.8|February|10/Feb/2022|
	|2|A|0.2.3|December|20-Mar-2022|
	|5|M|0.1.1|September|30-Apr-2023
	|10|Z|1.0.0|March|02/Dec/2022|

--8<-- "docs/_assets/include.md"