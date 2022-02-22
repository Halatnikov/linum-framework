# Markdown template

Click "Edit" to see how all of the things here are written

*[Material-MKDocs guide](https://squidfunk.github.io/mkdocs-material/reference/)*

*[Abbreviations]: abbr
*[Admonitions]: admonition

*[Details]: pymdownx.details
*[Snippets]: pymdownx.snippets

## Built-in

### Abbreviations

Only plain text is supported

**Regular:**

> This can technically be any word whatsoever

*[any word]: Yes, this one

**With a glossary (with Snippets extension):**

> The INI files that Linum uses are actually converted to JSON in-engine

--8<-- "docs/special/includes/abbreviations.md"

### Admonitions

Also known as call-outs

**Regular:**

!!! note "This is a title"
    This is a text
	
!!! note ""
    Look, there's no title
	
**Collapsible blocks (with Details extension):**

??? note "Closed"
	This is a closed collapsible block
	
???+ note "Open"
	This is an open collapsible block

**Inline blocks:**

`inline` or `inline end`

!!! info inline "Inline"
    This is an inline admonition

This is the text after an inline admonition

**Types:**

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

## Supported extensions

## Supported Python extensions

## Experimental Python extensions