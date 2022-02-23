---
title: Markdown template
---

Click "Edit" to see how all of the things here are written

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
`uses extension: pymdownx.emoji`
Full list of supported emoji and icons can be found [here](https://squidfunk.github.io/mkdocs-material/reference/icons-emojis/#search)
!!! note ""
	emoji: :smile:
	icon (replace all / with -): :fontawesome-regular-face-smile:

## Buttons
`uses extension: attr_list`
!!! note ""
	[Empty button](../index.md){ .md-button }
	
	[Filled button](../index.md){ .md-button .md-button--primary }

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

---

# Abbreviations
Only plain text is supported
`uses extension: abbr`

## Regular
!!! note ""
	This can technically be any word whatsoever

*[any word]: Yes, this one

## With a glossary
`uses extension: pymdownx.snippets`
!!! note ""
	The INI files that Linum uses are actually converted to JSON in-engine

--8<-- "docs/_assets/abbreviations.md"

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
	; comment
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
	[Section]
	key=value
	; (1)
	```

1.	this a code annotation, it can be placed anywhere where a comment can be placed in that language

## Line numbers
`uses extension: pymdownx.highlight`
!!! note ""
	can start from any line:
	``` ini linenums="10"
	[Section]
	key=value
	; comment
	```
	you can also mark them:
	```{.ini .hl_lines="2 3" .linenums="1 1 2"}
	[Section]
	key=value
	key2=value2
	; comment
	```

## Embedding external files
`uses extension: pymdownx.snippets`
!!! note ""
	``` ini title="_mapdata.ini"
	--8<-- "LinumDefault/levels/example/leveldata/_mapdata.ini"
	```
