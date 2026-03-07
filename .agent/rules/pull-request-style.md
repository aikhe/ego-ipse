---
trigger: always_on
---

- You should give the markdown text i can copy and paste
- When making a pull request follow this format and writin style:

title:

feat(layout): split logic + reactive window scaling & size persistence + stateful window management & remove redundant fns

description:

### Summary
I've added Split window support. Cake can now open in a horizontal (side-by-side) or vertical (bottom) split, with the UI layout automatically adapting to the container's dimensions.

### Related Issue
Closes #1

### Features
- **Layout**: Support for split `horizontal` (right), and `vertical` (bottom) modes.
- **UI**: The terminal and header windows are contained within a parent split and automatically resize/reflow when the split is manipulated.
- **Size Persistence**: Remembers the last used dimensions for each split direction during the session.
- **Navigation**: Integrated `<C-w>` and `<C-{direction}>` keybinds to navigate between the plugin and other windows alongside standard Vim splits.

### Changes
- **Refactor**: Unified `M.open()` logic in [lua/cake/init.lua](cci:7://file:///c:/Users/aikhe/AppData/Local/nvim/lua/custom_plugins/cake.nvim/lua/cake/init.lua:0:0-0:0) to handle all display modes.
- **Feat**: Implemented [lua/cake/ui/split.lua](cci:7://file:///c:/Users/aikhe/AppData/Local/nvim/lua/custom_plugins/cake.nvim/lua/cake/ui/split.lua:0:0-0:0) to manage split containers and mask separators.
- **Config**: Added `mode` and `split` options to `setup()` defaults.

**API**:

```lua
function() require("cake").open { mode = "splith" } end,
function() require("cake").open { mode = "splitv" } end,
```

### Configuration
Update your setup to configure default behavior:
```lua
require('cake').setup({
  mode = "splitv", -- options: "float", "splitv", "vertical"
  split = { 
    w = 80, -- width for horizontal split (side-by-side)
    h = 30  -- height for vertical split (bottom)
  },
})
```