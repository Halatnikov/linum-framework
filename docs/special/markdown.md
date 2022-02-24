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
	> This is a quote
	> ```
	> This is a code block
	> 
	> inside a quote
	> ```

## Converting special symbols
`uses extensions: smarty, pymdownx.smartsymbols`
!!! note ""
	These are the symbols that get replaced:
	(tm) (c) (r)
	c/o +/- =/=
	--> <-- <-->
	1/2 1/4 5/8
	1st 2nd 3rd 4th
	<< >>
	...
	--\ ---

## GitHub links
`uses extension: pymdownx.magiclink`
!!! note ""
	User mention: @halatnikov
	Repository link: @halatnikov/linum-framework
	
	Links for Linum:
	> Issue: #1
	> Pull request: !1
	> Discussion: ?1
	> Commit: 7dbdb07abf74277bca146c26b995eacb627d239a
	> Diff/Compare: 3fdc4e6a2e919e1efee08221685c232c556c49f3...d2e1bec5cdd722d7bbe6f180ca415737823d9ffc
	
	Links for other repositories:
	> Issue: STJr/SRB2#206
	> Pull request: alemart/opensurge!49
	> Discussion: ppy/osu?13096
	> Commit: STJr/Kart-Public@7ab1c4a2df835cd08fc2cfb1be7743e6a7bad6d7
	> Diff/Compare: mmatyas/supermariowar@57b639cc9f2088687cf482a547a3c0ff59c2349b...3917df2881b489b49672901366397ca4f67a6a5a
	
	Converting of existing links:
	> https://github.com/STJr/SRB2/issues/206
	> https://github.com/ppy/osu/discussions/13096
	
	Also supports Twitter mentions: @twitter:holatnikov
	
	A few custom links:
	> Changelog for versions: [0.1.0]{.ver} [0.2.0]{.ver}

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
	Emoji: :smile:
	Icon (replace all / with -): :fontawesome-regular-face-smile:

## Buttons
Just a regular link but with an attribute attached
`uses extension: attr_list`
!!! note ""
	[Empty button][index]{.md-button}
	
	[Filled button][index]{.md-button .md-button--primary}

## Keyboard keys
A full list can be found [here](https://facelessuser.github.io/pymdown-extensions/extensions/keys/#key-map-index)
`uses extension: pymdownx.keys`
!!! note ""
	++ctrl+alt+delete++
	++z++
	++alt+f4++
	++arrow-up+arrow-up+arrow-down+arrow-down+arrow-left+arrow-right+arrow-left+arrow-right+b+a+enter++

## Progress bars
Colored according to their progress
`uses extensions: pymdownx.progressbar, attr_list`
!!! note ""
	Regular:
	[=0% "Can use titles"]
	
	[=50% "50%"]
	
	[=100% "Full"]
	
	Striped:
	[=75% "Striped static"]{.candystripe}
	
	[=50% "Striped animated"]{.candystripe .candystripe-animate}
	
	Thin:
	[=5%]{.thin}
	
	[=25%]{.thin}
	
	[=45%]{.thin}
	
	[=65%]{.thin}
	
	[=85%]{.thin}
	
	[=100%]{.thin}

## Superscript 
Small symbols facing up
`uses extension: pymdownx.caret`
!!! note ""
	H^2^0
	This is ^a\ superscript^

## Subscript
Small symbols facing down
`uses extension: pymdownx.tilde`
!!! note ""
	CH~3~CH~2~OH
	This is ~a\ subscript~

## Footnotes
Usually these are at the bottom of page, but for now they're here
`uses extension: footnotes`
!!! note ""
	This is a text[^1] that contains 2 footnotes[^2]
	
	[^1]: This is the content of a first footnote
	[^2]: That's the 2nd footnote's content
	
	[FOOTNOTES]

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

## With a dictionary
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
	`#!ini # (2)`
	``` ini
	# comment (1)
	```

	1.	this a code annotation, it can be placed anywhere where a comment can be placed in that language
	2.  will this work????

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
	|Number|Alphabetical|Version|Date|
	|-|-|-|-|
	|0|C|0.1.0|01/Jan/2022|
	|1|B|0.7.8|10/Feb/2022|
	|2|A|0.2.3|20-Mar-2022|
	|5|M|0.1.1|30-Apr-2023
	|10|Z|1.0.0|02/Dec/2022|

--8<-- "docs/_include/include.md"