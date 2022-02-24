---
title: Skin metadata
---

|Option|Required?|Value type|Description|Version added|Default value|
|:-|:-:|:-:|:-|:-:|-:|
|`GameVersion`|:octicons-check-circle-fill-16:|String|Minimum required Linum version to be able <br> to play with this skin|[0.2.0]{.ver}||
|`Version`|:octicons-x-circle-16:|Integer|Skin’s own version, ==up this by 1 when you make== <br> ==a change==, this is for multiplayer lobbies to <br> differentiate if someone has an outdated version <br> of a skin|[0.2.0]{.ver}|`1`|
|`Name`|:octicons-check-circle-fill-16:|String|Skin’s full name|[0.2.0]{.ver}||
|`ShortName`|:octicons-x-circle-16:|String|Skin’s shortened name, for various menus|[0.2.0]{.ver}|If *not* set, `Name` <br> will be used instead|
|`Author`|:octicons-x-circle-16:|String|Who made the skin, duh|[0.2.0]{.ver}||
|`Description`|:octicons-x-circle-16:|List|Skin’s description, you can use it to tell <br> what game it’s from or who made the sprites <br> ==Use== `|` ==to make new lines==|[0.2.0]{.ver}||


--8<-- "docs/_include/include.md"
