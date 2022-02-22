# Markdown template

Click "Edit" to see how all of the things here are written

[Guide from *Material for MKDocs*](https://squidfunk.github.io/mkdocs-material/reference/)

## Abbreviations

---

Only plain text is supported

`uses extensions: abbr`

### Regular

> This can technically be any word whatsoever

*[any word]: Yes, this one

### With a glossary

`uses extensions: pymdownx.snippets`

> The INI files that Linum uses are actually converted to JSON in-engine

--8<-- "docs/special/includes/abbreviations.md"

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

[Empty button](/index.md){ .md-button }

[Filled button](/index.md){ .md-button .md-button--primary }

