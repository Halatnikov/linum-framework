# Markdown template

Click "edit" to see how all of the things here are written

# Built-in

## Abbreviations

`abbr`

Only plain text is supported

**Regular:**

> This can technically be any word whatsoever

*[any word]: Yes, this one

**With a glossary (with Snippets extension):**

`pymdownx.snippets`

> The INI files that Linum uses are actually converted to JSON in-engine

--8<-- "docs/special/includes/abbreviations.md"

## Admonitions

`admonition`

Also known as call-outs

**Regular:**

!!! note "This is a title"

    This is a text
	
!!! note ""

    Look, there's no title
	
**Collapsible blocks (with Details extension):**

`pymdownx.details`

??? note

	This is a closed collapsible block
	
???+ note

	This is an open collapsible block

**Inline blocks:**

`inline` or `inline end`

!!! note inline

	This is an admonition
	
This is the text after it

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

# Supported extensions

# Supported Python extensions

# Experimental Python extensions