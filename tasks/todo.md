# Task Progress Dashboard

## Plan

Implement a dynamic Task Progress section between the toolbar and the board.

### Components:

1. **Header**: "Task Progress" with "X / Y Tasks Completed • Z%"
   - "Completed" = tasks in the last column (convention: last column = done)
2. **Segmented Progress Bar**: One colored segment per column, width proportional to task count
3. **Stat Cards Row**: Scrollable row — Total card + one card per column with task count
   - Each card has the column's accent color as border-top
   - All dynamic — adapts when columns/tasks are added/removed

### Implementation Steps:

- [x] Add computed signals in `kanban.ts` for progress stats
- [x] Add HTML template section between toolbar and board
- [x] Add CSS styles (glassmorphism, matching existing design)
- [x] Add responsive rules for tablet/mobile (1024px, 768px, 480px)
- [x] Build & verify — clean build, zero errors

### Review:

- All signals are reactive (`computed`) — automatically update when tasks/columns change
- Adding/removing columns dynamically updates stat cards and progress segments
- Progress bar uses per-column gradient colors for visual consistency
- Stat cards scroll horizontally when many columns exist
- Responsive at all breakpoints: 1024px, 768px, 480px

### Redesign (v2):

- [x] Fix completion logic — weighted progress through columns (not just last column)
- [x] Add circular progress ring (SVG) with animated percentage
- [x] Redesign layout — ring + info side by side, bigger stat cards with % badges
- [x] Add color legend dots below progress bar
- [x] Update all responsive breakpoints (1024px, 768px, 480px)
- [x] Build & verify — clean build, zero errors

---

## Unified Navbar & Layout Separation (v3)

### Plan:

Move search and sorting into a unified navbar with the brand and user menu. Add a visual section divider between the dashboard and the board. Wrap dashboard + board in a scrollable main-content area.

### Implementation Steps:

- [x] Merge user-bar + toolbar into a single `<nav class="navbar">` with left/center/right sections
- [x] Brand + task count stat on the left
- [x] Search box + sort button centered in the navbar
- [x] User avatar/dropdown on the right
- [x] Add `.main-content` wrapper around dashboard + divider + board for clean layout
- [x] Add section divider ("Board") between dashboard and the columns
- [x] Update CSS — remove old `.user-bar` and `.toolbar`, add `.navbar`, `.navbar-left/center/right`, `.main-content`, `.section-divider`
- [x] Update all responsive breakpoints (1024px, 768px, 480px) — navbar wraps center row below on tablet/mobile
- [x] Build & verify — clean build, zero errors
