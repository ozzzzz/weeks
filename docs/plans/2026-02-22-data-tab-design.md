# Data Tab Design

**Date:** 2026-02-22

## Overview

Add a new "Data" tab to the sidebar (LifeMenu) after the existing Profile and Calendars tabs. This tab consolidates all data management actions — save, load, demo, and clear — in one place and removes them from the top Navigation bar.

## Changes

### LifeMenu.tsx

- Add a third tab: **Data** (icon: `IconDatabase`)
- Data tab content: a vertical stack of 4 full-width buttons in a simple list layout:
  1. **Save data** (`IconDownload`) — downloads current state as JSON
  2. **Load data** (`IconUpload`) — opens file picker to import JSON (hidden file input)
  3. **Load demo** (`IconRefresh` or similar) — loads sample calendar data
  4. **Clear all** (`IconTrash`, color="red") — erases all calendars (with confirm dialog)
- Move all 4 handlers from Navigation into LifeMenu: `handleSaveData`, `handleLoadDataClick`, `handleLoadData`, `handleClearData`
- Move the hidden `<input type="file">` and `fileInputRef` into LifeMenu
- Move `importError` state into LifeMenu; display inline error text below the Load button if set
- Remove the "Demo" section (Load demo + Clear all buttons) from the bottom of the Profile tab

### Navigation.tsx

- Remove: 3 action icon buttons (save, load, clear), hidden file input, `fileInputRef`, `importError` state, and all related handlers
- Keep: title ("Weeks") + week stats badges (lived / remaining / extra counts)

## Non-goals

- No stats or charts in the Data tab
- No JSON viewer or editor
- Week stats badges stay in the Navigation bar
