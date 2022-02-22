# Markdown template

Click "Edit" to see how all of the things here are written

[Guide from *Material for MKDocs*](https://squidfunk.github.io/mkdocs-material/reference/)

## Basic syntax

---

## Extended syntax

---

Quick rundown through syntax available with extensions

#### Marking

`uses extensions: pymdownx.mark`

!!! note ""
	==This is a marked text==
	
	A ==word== can be ==highlighted== too

#### Inserting (underscoring)

`uses extensions: pymdownx.caret`

!!! note ""
	^^This is an inserted text^^
	
	A ^^word^^ can be ^^underscored^^ too

#### Deleting (strike-through)

`uses extensions: pymdownx.tilde`

!!! note ""
	~~This is a deleted text~~
	
	A ~~word~~ can be ~~striked-through~~ too

#### Keyboard keys

`uses extensions: pymdownx.keys`

!!! note ""
	++ctrl+alt+delete++
	
	++z++
	
	++alt+f4++
	
	++arrow-up+arrow-up+arrow-down+arrow-down+arrow-left+arrow-right+arrow-left+arrow-right+b+a+enter++

A full list can be found [here](https://facelessuser.github.io/pymdown-extensions/extensions/keys/#key-map-index)

#### Superscript 

`uses extensions: pymdownx.caret`

Small symbols facing up

!!! note ""
	H^2^0
	
	this is^a\ superscript^

#### Subscript

`uses extensions: pymdownx.tilde`

Small symbols facing down

!!! note ""
	CH~3~CH~2~OH
	
	this is~a\ subscript~

#### Highlighting changes

`uses extensions: pymdownx.critic`

This has a somewhat limited use scope

!!! note ""
	You can make {--striked-through text red--} and {++underscored text green++}
	
	And also {>>make comments inline<<}
	
	{==
	
	You can do blocks too!
	
	==}

## Abbreviations

---

Only plain text is supported

`uses extensions: abbr`

### Regular

!!! note ""
	This can technically be any word whatsoever

*[any word]: Yes, this one

### With a glossary

`uses extensions: pymdownx.snippets`

!!! note ""
	The INI files that Linum uses are actually converted to JSON in-engine

--8<-- "docs/_assets/abbreviations.md"

## Admonitions

---

Also known as call-outs

`uses extensions: admonition`

### Regular blocks

!!! note "This is a title"
    This is a text

!!! note ""
    Look, there's no title

### Types of blocks

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

### Collapsible blocks

`uses extensions: pymdownx.details`

??? fail "Closed"
	This is a closed collapsible block
	
???+ success "Open"
	This is an open collapsible block

### Inline blocks

!!! info inline "Inline"
    This is an inline admonition
	
	`inline` or `inline end`

This is the text after an inline admonition

## Buttons

---

`uses extensions: attr_list`

[Empty button](linum-framework/index.md){ .md-button }

[Filled button](linum-framework/index.md){ .md-button .md-button--primary }

