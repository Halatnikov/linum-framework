# 0.2.0-6 `(2022-02-18)`
### Added:
- Counter on level select
- *Early steps* at **grid view in level select** and an **alternative audio visualiser**
### Changed:
- *WIP* updated language file a teeny bit
- **Moved to GitHub**, i think that means i have to document *every* slight change now? ~~i'm sorry in advance~~

# 0.2.0-5 `(2022-02-12)`
### Added:
- *Early steps* at **logging** and **chat logging**
### Changed:
- *WIP* better **level select**
- Levels and skins now **pre-cache** when starting the game
- Redrawn **gamepad icons** to 12x12

# 0.2.0-4 `(2022-01-20)`
### Added:
- **New level** - *Green Hill Zone 1* from Sonic 1
### Changed:
- Made special objects a bit transparent
- You can now press **D** to toggle sensors visibility
### Fixed:
- Tiles now properly set their size when placed

# 0.2.0-3 `(2022-01-19)`
### Added:
- Skin colorschemes now can be **animated**
### Changed:
- *WIP* colorschemes rework, skin's source colors **now load from a** `.png`
### Fixed:
- Tile effects in the editor now only apply once and when on-screen, **this drastically improved performance**, whoops

# 0.2.0-2 `(2022-01-16)`
### Added:
- **New skin** - *Surge The Rabbit* from Open Surge
- Skins now change **up to 12 colors** and also an UI color by using pre-made **colorschemes**
### Changed:
- You can now reuse default skin metadata sections and default extra sprites
- Skins now have proper offsets

# 0.2.0-1 `(2022-01-15)`
### Added:
- *WIP* **skin system**: loads sprites, custom hitbox and effects, brief metadata with flags, animation properties and engine stats
### Changed:
- *WIP* **skin animation rework**
- Editor state now saves in `LinumFramework/saves/editor`
- Main and Animation sensors now have proper offsets

> # 0.2.0 starts ^^^

# *RELEASE* 0.1.2 `(2021-08-25)`
### Added:
- **New level** - *Not So Green Zone* from Simple Sonic Worlds EX
- *Temp* **empty level** for easy copying

# *RELEASE* 0.1.1 `(2021-08-23)`
### Added:
- **New level** - *Sunshine Paradise* from Open Surge

# *RELEASE* 0.1.0 `(2021-08-21)`
> ### SAGE 2021 Release
> Sorry there's no versions below, i was kinda rushing to SAGE 2021 since like middle of August, i initially lost motivation because my Windows 10 died in June, but there was like **27+ builds** and **2 pre-releases** overall
> 
### Added:
- **2 new levels** - Core Engine and example level with a bunch of premade tiles
- *Temp* **online multiplayer** (ported from earlier iteration of Linum): player synchronisation, nicknames above skins, lobby, chat and player list, barebones checking if all players have same level, waiting until all players finish loading, (broken) aborting game by host
> Menus, UI, all that stuff
- Ported back **title card** and **stage music pop-up** from earlier Linum iteration
- **Splash screens**: SAGE 2021 logo and "Based on:" `(animation code from Core Engine)`
- *Temp* multiplayer **race UI**, based on distance between start position and finish sign `(code by BluePinStudio)`
- *WIP* **in-game HUD** with time `(code by Maverick1912)`
- *WIP* **music system**: looping, fading, playlists (selections) and remembering position, level music and play from path
- *Temp* music change button in menus
- "Quickmenus" created from an `.ini` file for **temporary menus** and stuff; types: none, do an action (create quickmenu, change menu, close, call a function), select value from list (with defaults), replace text
- As an adittion to above: main menu, settings, credits, exit editor dialog, warning when not using WebGL, auto-updater, error messages, multiplayer lobby
- *Temp* game settings and applying of them
- *Temp* **update checking and downloading** ported from earlier iteration of Linum
> Level (and editor by extension)
- *Temp* rushed **level layers** system (was added extremely late)
- *WIP* rushed **built-in objects**: finish sign (fake) and springs (were added like 2 hours before deadline); and **special objects**: start position and collision layer changers
- *Temp* broken **platform tile collisions**, but it's better than nothing
- *WIP* **tile collision layers** (for loops and stuff): 0 and 1, also none
> Editor specifically
- Editor **"play" button** and transition
- *Temp* **object properties** and **level layers** sub-menus in editor
- Different tile types are now **highlighted with different colors** in editor, a toggle in editor settings sub-menu
> Miscellanious
- System messages in bottom left corner
- Debug mode global variable for indev versions
- More stuff i forgot and lots of unused code probably
### Changed:
- Better **UI cursors** and *WIP* **fonts** `(by Ayleen_Seraph)` and reused old **menu icons** from earlier Linum iteration `(by DniweTamp)`
- Replaced peeling-out sprites of Sonic `(by facundragomez and dawphra)`
- *Temp* rushed ported **collision editor** into the level editor itself
- There's now a cursor at all times
- All editor settings now reset on start
- An (broken) attempt to do transition input locking in menus
### Fixed:
- Levels now load faster
- Showing collisions in editor is now a bit more optimised
### Removed *(temporarily)*:
- Language translation system
- GameJolt API
- Editor cursor tooltips
- Wiki tab in editor help menu
- Keyboard shortcut to change grid type in editor

> # 0.1.0-27 `(2021-08-20)`
> # 0.1.0-21 `(2021-08-08)`
> **These were released privately to be approved for SAGE 2021**

# 0.1.0-14 `(2021-05-18)`
### Added:
- Zoom now has buttons
- There is now an icon for editor settings button

# 0.1.0-13 `(2021-05-15)`
### Changed:
- Yet another really **large internal rework**, editor should make more sense now
- **Proper layer sorting** in editor UI, prevent clicks if just exited another menu
### Fixed:
- Fixed many oddities with picker, preview is now correct size

# 0.1.0-12 `(2021-05-13)`
### Added:
- Loading screens now have **details text** and **progress bar**
### Changed:
- Now the levelmap loads only if it's marked as "default"
- You can now hold the button to use pencil/eraser
### Fixed:
- Fixed some inconsistencies with being able to place some tiles on top of eachother

# 0.1.0-11 `(2021-05-11)`
### Changed:
- Rewrote entire saving/loading system and it **now generates a pretty INI file**
- Tile's hotpoint is now in the middle
- You can now use eraser when just pointing at tile, not it's collision
- Changed cursors a tiny bit
### Fixed:
- Picker cursor now shows accurate angle when going negative

# 0.1.0-10 `(2021-03-04)`
### Added:
- *WIP* **disclaimer screen** after loading
- *WIP* "play" button
### Changed:
- Splash screens are now skippable

> # 0.1.0-9 `(2021-02-17)`
> # 0.1.0-8 `(2021-02-15)`
### Added:
- Implemented **whole new gameplay framework** `(based on Core Engine by Nihil and others)`
- *Temp* **camera system** `(from Sonic Open Construct by IsraelGames)`

# 0.1.0-7 `(2021-01-27)`
### Added:
- Ported **splash screens** from earlier Linum iteration
- *WIP* example tiles

# 0.1.0-6 `(2021-01-23)`
### Added:
- *WIP* **language support**
- There's now a notice that you're using an indev build
### Changed:
- Lots of **internal restructuring**
- Picker now uses tabs

# 0.1.0-5 `(2021-01-21)`
### Added:
- **Status messages** in editor
- Keyboard shortcuts
- *WIP* help screen
### Fixed:
- You can no longer save without any tiles and place tiles without collision

# 0.1.0-4 `(2021-01-15)`
### Added:
- **Saving and loading** level maps and current position in editor
- *WIP* level select menu
### Changed:
- Changed icons for UI and cursor

# 0.1.0-3 `(2021-01-13)`
### Added:
- You can actually **place and remove tiles** now
- *WIP* **picker menu**: actually loads animations, can change pages, has cursor and active tile, placement mode changement (does nothing yet)
- *WIP* **collision editor** `(modified from Polygon demo by Yann)`
- **Editor placement cursor** that follows grid and current tile's size
- Info near cursor about tile's angle and flipped state
- **Action buttons**: mirror, flip and rotate tile; You can rotate and flip tiles
- **Collisions** are now placed with the corresponding tiles and follow it's angle and mirrored/flipped state
- Toggle for showing collisions in editor settings
### Changed:
- Picker button now displays current tile and placement mode

# 0.1.0-2 `(2021-01-12)`
### Added:
- *WIP* picker button
- *Early* picker menu mock-up
- Pseudo loading mask to hide low fps when changing layouts `(code by Toby R)`
- Custom **checkboxes** and **dropdown menus**
- Grid is now 2 types: Dots and Lines
### Changed:
- **Title screen** now displays version, song name (mock-up) and progress bar, grid scrolls in opposite direction
- Tooltips now stop at edges of the screen

# 0.1.0-1 `(2021-01-10)`
### Added:
- *WIP* **title screen**
- **Transition** between menus
- *WIP* **changing instruments** (only scrolling works)
- *WIP* **editor settings** sub-menu: show grid, change grid size
- *WIP* on-screen info: X, Y and Zoom
- *WIP* cursor with tooltips

> # 0.1.x starts ^^^

> **neo_linum** changelog

> this is like a third rework already lol (*h***e**~~l~~*p* **m***e*)
