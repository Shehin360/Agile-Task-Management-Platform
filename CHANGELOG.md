# Changelog - Agile Kanban Board

All notable changes to this project are documented in this file.

---

## [v14.0] - 25 February 2026

### 🔐 Login Page & Authentication — Route Protection

**Files created:** `auth/auth.service.ts`, `auth/auth.guard.ts`, `login/login.ts`, `login/login.html`, `login/login.css`
**Files edited:** `app.ts`, `app.routes.ts`, `app.routes.server.ts`, `kanban/kanban.ts`, `kanban/kanban.html`, `kanban/kanban.css`

#### Summary

Added a full login page with hardcoded credentials, an auth guard to protect the board route, and a user bar on the Kanban board showing the current user with a logout button. The login page uses the same glassmorphism design language as the board.

#### What Changed:

- ✅ **NEW:** `AuthService` — manages login/logout with hardcoded credentials, persists user session to localStorage
- ✅ **NEW:** `authGuard` — Angular functional route guard that redirects unauthenticated users to `/login`
- ✅ **NEW:** Login page — glassmorphism card with username/password inputs, show/hide password toggle, loading spinner, shake animation on error
- ✅ **NEW:** Demo credential hints — clickable buttons that auto-fill `demo/demo` or `admin/admin123`
- ✅ **NEW:** User bar on Kanban board — shows logged-in user's display name and a logout button
- ✅ **NEW:** Lazy-loaded routes — `/login` and `/board` are loaded on demand for better performance
- ✅ **NEW:** SSR compatibility — login and board routes use `RenderMode.Client`

#### Hardcoded Credentials:

| Username | Password  | Display Name |
| -------- | --------- | ------------ |
| admin    | admin123  | Admin        |
| shehin   | shehin123 | Shehin       |
| demo     | demo      | Demo User    |

#### File Details:

- `auth/auth.service.ts` — `login()`, `logout()`, `currentUser` signal, `isLoggedIn` signal, localStorage persistence
- `auth/auth.guard.ts` — `CanActivateFn` that checks `isLoggedIn()` and redirects to `/login`
- `login/login.ts` — Login component with signals, form validation, loading state, shake animation
- `login/login.html` — Glassmorphism login card with floating orbs, input fields, demo hints
- `login/login.css` — Full login page styling matching the board's design
- `app.ts` — Replaced inline `<app-kanban />` with `<router-outlet />`
- `app.routes.ts` — Added `/login`, `/board` (guarded), and redirect routes
- `app.routes.server.ts` — Set `/login` and `/board` to `RenderMode.Client`
- `kanban/kanban.ts` — Injected `AuthService` and `Router`, added `logout()` and `currentUser`
- `kanban/kanban.html` — Replaced standalone title with user bar (title + user name + logout)
- `kanban/kanban.css` — Added `.user-bar`, `.user-info`, `.user-avatar`, `.user-name`, `.logout-btn` styles

---

## [v12.0] - 23 February 2026

### 🔔 Toast Notifications — Visual Feedback for All User Actions

**Files edited:** `kanban.ts`, `kanban.html`, `kanban.css`

#### Summary

Every user action on the board now triggers a beautiful animated toast notification that slides in from the right, displays a color-coded message with an icon, and auto-dismisses after 3.5 seconds with a progress bar. Users can also click to dismiss immediately.

#### What Changed:

**Before:**

- ❌ No feedback when tasks or columns were created, edited, deleted, or moved
- ❌ Users had to visually scan the board to confirm their action worked

**After:**

- ✅ **NEW:** Toast notification system with 4 types: `success` (✅), `error` (❌), `info` (ℹ️), `warning` (⚠️)
- ✅ **NEW:** Toasts appear for: task created, task updated, task deleted, column added, column renamed, column deleted, task moved (drag & drop)
- ✅ **NEW:** Animated slide-in/slide-out with Angular `@toastAnim` trigger
- ✅ **NEW:** Auto-dismiss after 3.5 seconds with animated progress bar
- ✅ **NEW:** Click to dismiss early, close button on each toast
- ✅ **NEW:** Glassmorphism styling matching the board's design language
- ✅ **NEW:** Color-coded left accent bar per toast type (green/red/blue/amber)
- ✅ **NEW:** Responsive — full-width on mobile, fixed-width on desktop

#### TypeScript Changes (`kanban.ts`):

- Added `ToastType` type (`'success' | 'error' | 'info' | 'warning'`)
- Added `ToastMessage` interface with `id`, `text`, `type`, and `icon`
- Added `toasts` signal to track active toast messages
- Added `showToast(text, type)` method with auto-dismiss via `setTimeout`
- Added `dismissToast(id)` to remove a toast by ID
- Added `@toastAnim` animation trigger for slide-in/slide-out
- Integrated `showToast()` calls into: `addTask()`, `saveEdit()`, `deleteTask()`, `addColumn()`, `deleteColumn()`, `saveEditColumn()`, `onDrop()` (cross-column moves)

#### HTML Changes (`kanban.html`):

- Added `toast-container` with `@for` loop rendering active toasts
- Each toast shows icon, message text, and a close button
- Uses `@toastAnim` animation trigger for enter/leave transitions

#### CSS Changes (`kanban.css`):

- Added `.toast-container` — fixed bottom-right positioning with `z-index: 2000`
- Added `.toast` base styles — glassmorphism card with blur, border, shadow
- Added `.toast-success`, `.toast-error`, `.toast-info`, `.toast-warning` — type-specific accent colors
- Added `.toast-icon`, `.toast-text`, `.toast-close` — layout and interaction styles
- Added `::after` pseudo-element with `toastProgress` keyframe for countdown bar
- Added responsive rules for mobile (full-width toasts)

---

## [v11.0] - 20 February 2026

### 🏗️ Dynamic Columns — Add, Rename & Remove Workflow Stages

**Files edited:** `kanban.ts`, `kanban.html`, `kanban.css`

#### Summary

The board is no longer limited to three hardcoded columns (To Do, In Progress, Done). You can now **add custom columns**, **rename** existing ones, and **delete** columns you no longer need. Each column gets its own unique color from a rotating palette, and all data is persisted to localStorage.

#### What Changed:

**Before:**

- ✅ Three fixed columns: To Do, In Progress, Done
- ❌ No way to customize workflow stages
- ❌ Column colors were hardcoded via CSS `nth-child` selectors

**After:**

- ✅ **NEW:** Dynamic column system — add unlimited custom columns (e.g. "In Review", "QA", "Blocked")
- ✅ **NEW:** "Add Column" card at the end of the board with modal for naming
- ✅ **NEW:** Inline column rename — click the ✏️ on any column header to edit in place
- ✅ **NEW:** Column deletion with confirmation modal — tasks are moved to the first remaining column
- ✅ **NEW:** Task count badge on each column header
- ✅ **NEW:** 8-color rotating gradient palette for column headers and task accents
- ✅ **NEW:** Columns persisted to `localStorage` under `kanban_columns` key
- ✅ **NEW:** Each column's "+ Add Task" button adds to that specific column

#### TypeScript Changes (`kanban.ts`):

- Added `Column` interface with `id`, `name`, and `colorIndex`
- Added `COLUMN_COLORS` palette with 8 gradient/glow/accent presets
- Changed `TaskStatus` from a union type to `string` (dynamic column IDs)
- Added `columns` signal with `loadColumns()` / `saveColumns()` persistence
- Replaced hardcoded `todoTasks`, `inprogressTasks`, `doneTasks` computed signals with a single `getColumnTasks(columnId)` method
- Added `addColumn()`, `deleteColumn()`, `startEditColumn()`, `saveEditColumn()`, `cancelEditColumn()` methods
- Added `showAddColumnModal`, `showDeleteColumnConfirm`, `editingColumnId`, `editingColumnName` signals
- Added `addTaskColumnId` signal and `openAddTaskModal(columnId)` to support per-column task addition
- Updated `addTask()` to use `addTaskColumnId()` instead of hardcoded `'todo'`
- Updated all drag/drop handlers to use `string` instead of `TaskStatus` union

#### HTML Changes (`kanban.html`):

- Replaced three hardcoded column blocks with a single `@for (column of columns())` loop
- Column header now uses inline `[style.background]` and `[style.box-shadow]` for dynamic colors
- Added inline-edit mode in column headers (input + save/cancel buttons)
- Added column action buttons (✏️ rename, 🗑️ delete) that appear on header hover
- Added task count badge in column header
- Added "Add Column" card at end of board
- Added "Add Column" modal and "Delete Column" confirmation modal
- Each task card now uses `[style.--col-accent]` CSS custom property for its left border glow
- Each "+ Add Task" button uses `[style.--btn-accent]` for hover color

#### CSS Changes (`kanban.css`):

- Removed all `nth-child(1/2/3)` selectors for column headers, task borders, and drag-over states
- Column header now uses `display: flex` layout with `.column-header-content`, `.column-header-actions`
- Added `.column-task-count` badge styles
- Added `.col-action-btn`, `.col-edit-btn`, `.col-delete-btn` for header action buttons
- Added `.column-header-edit`, `.column-name-input` for inline rename
- Task `::before` left border now uses `var(--col-accent)` CSS custom property
- Add-task button hover uses `var(--btn-accent)` CSS custom property
- Added `.add-column-card` with dashed border, hover glow, and icon/text styles
- Added `.modal-sm`, `.modal-header-danger`, `.confirm-text`, `.modal-btn.danger` for column modals

---

## [v10.0] - 20 February 2026

### 🔀 Smart Sort — Sort Tasks by Due Date or Priority

**Files edited:** `kanban.ts`, `kanban.html`, `kanban.css`

#### Summary

Added a sort toggle button that lets you cycle through three sorting modes across all columns: **Manual** (default drag order), **Due Date** (earliest deadline first), and **Priority** (high → medium → low). The button glows with a distinct color for each active mode.

#### What Changed:

**Before:**

- ✅ Tasks sorted by manual drag order only
- ❌ No way to auto-sort by urgency or importance

**After:**

- ✅ **NEW:** Sort toggle button above the board
- ✅ **NEW:** Three sort modes — Manual ↕️, Due Date 📅, Priority 🎯
- ✅ **NEW:** Click to cycle: Manual → Due Date → Priority → Manual...
- ✅ **NEW:** Active mode shown with color-coded glow (blue for date, amber for priority)
- ✅ **NEW:** Smart tiebreakers — priority mode sub-sorts by due date, due date mode falls back to manual order

#### TypeScript Changes (`kanban.ts`):

- Added `sortMode` signal with type `'manual' | 'dueDate' | 'priority'`
- Added `cycleSortMode()` to cycle through the three modes
- Added `sortLabel` computed signal for display text
- Added `priorityWeight()` helper for numeric priority comparison
- Added `sortTasks()` method with smart tiebreaker logic
- Refactored all three computed task lists to use `sortTasks()` instead of inline `.sort()`

#### HTML Changes (`kanban.html`):

- Added sort bar with toggle button between title and board
- Button displays current mode icon + label and a "Click to change sort" hint

#### CSS Changes (`kanban.css`):

- Added `.sort-bar`, `.sort-btn`, `.sort-icon`, `.sort-hint` styles
- Added `.sort-active-manual`, `.sort-active-dueDate`, `.sort-active-priority` glow variants

---

## [v9.0] - 17 February 2026

### 📅 Due Dates for Tasks

**Files edited:** `kanban.ts`, `kanban.html`, `kanban.css`

#### Summary

Added due date support for tasks with a date picker in the Add/Edit modals and color-coded due date badges on task cards. Tasks now display visual indicators showing whether they are overdue (red pulse), due today (amber), or upcoming (blue).

#### What Changed:

**Before:**

- ✅ Task cards show title, description, and priority
- ❌ No way to set or track deadlines
- ❌ No visual urgency feedback

**After:**

- ✅ Task cards show title, description, priority, **and due date**
- ✅ **NEW:** Date picker in Add Task modal
- ✅ **NEW:** Date picker in Edit Task modal
- ✅ **NEW:** Color-coded due date badges:
  - 🔴 **Overdue** — Red pulsing glow (e.g., "2d overdue")
  - 🟡 **Due Today** — Amber badge ("Due today")
  - 🔵 **Upcoming** — Blue badge ("Due tomorrow", "3d left", or "Jan 25")
- ✅ Due dates are persisted in localStorage
- ✅ Due date is optional — tasks without a due date show no badge

#### TypeScript Changes (`kanban.ts`):

**1. Added `dueDate` field to Task interface:**

```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  dueDate: string | null; // ISO date string (YYYY-MM-DD) or null
}
```

**2. Added signals for due date in Add/Edit forms:**

```typescript
newTaskDueDate = signal<string | null>(null);
editingDueDate = signal<string | null>(null);
```

**3. Added `getDueDateStatus()` helper — determines badge color:**

```typescript
getDueDateStatus(dueDate: string | null): 'overdue' | 'today' | 'upcoming' | 'none' {
  // Compares due date to today and returns status
}
```

**4. Added `formatDueDate()` helper — formats human-readable label:**

```typescript
formatDueDate(dueDate: string | null): string {
  // Returns "2d overdue", "Due today", "Due tomorrow", "3d left", or "Jan 25"
}
```

**5. Updated `addTask()`, `startEdit()`, `cancelEdit()`, `saveEdit()` to handle `dueDate`.**

#### HTML Changes (`kanban.html`):

**1. Added due date badge to all three column task cards:**

```html
@if (task.dueDate) {
<span class="due-date-badge" [class]="'due-' + getDueDateStatus(task.dueDate)">
  📅 {{ formatDueDate(task.dueDate) }}
</span>
}
```

**2. Added date picker to Add Task modal:**

```html
<label class="modal-label">Due Date</label>
<input
  class="modal-input modal-date"
  type="date"
  [value]="newTaskDueDate() || ''"
  (input)="newTaskDueDate.set($any($event.target).value || null)"
/>
```

**3. Added date picker to Edit Task modal (same pattern with `editingDueDate`).**

#### CSS Changes (`kanban.css`):

**1. Base due date badge styling** (pill shape matching priority badges)

**2. `.due-overdue`** — Red background, pulsing glow animation

**3. `.due-today`** — Amber/yellow background with subtle glow

**4. `.due-upcoming`** — Cool blue background

**5. `.modal-date`** — Dark color scheme for native date picker, styled picker indicator

---

## [v8.0] - 17 February 2026

### 🔄 Drag to Reorder Within Columns

**Files edited:** `kanban.ts`, `kanban.html`, `kanban.css`

#### Summary

Added the ability to reorder tasks within the same column by dragging and dropping. Tasks now maintain their position order, and you can prioritize tasks by dragging them above or below other tasks in the same column.

#### What Changed:

**Before:**

- ✅ Drag tasks between columns (To Do → In Progress → Done)
- ❌ Cannot reorder tasks within the same column
- ❌ New tasks always appear at the end

**After:**

- ✅ Drag tasks between columns (To Do → In Progress → Done)
- ✅ **NEW:** Drag tasks within the same column to reorder
- ✅ **NEW:** Visual drop indicator shows where task will be placed
- ✅ Task order is persisted in localStorage

#### TypeScript Changes (`kanban.ts`):

**1. Added `order` field to Task interface:**

```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  order: number; // NEW - For sorting within columns
}
```

**2. Added drop target signal for reordering:**

```typescript
dropTargetTaskId = signal<number | null>(null); // Track hover target
```

**3. Updated computed task lists to sort by order:**

```typescript
todoTasks = computed(
  () =>
    this.tasks()
      .filter((t) => t.status === 'todo')
      .sort((a, b) => a.order - b.order) // Sort by order
);
// Same for inprogressTasks and doneTasks
```

**4. Enhanced `addTask()` to assign order:**

```typescript
addTask() {
  // ...existing code...
  this.tasks.update((tasks) => {
    // Get max order for 'todo' column
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const maxOrder = todoTasks.length > 0
      ? Math.max(...todoTasks.map(t => t.order))
      : 0;

    const updated: Task[] = [
      ...tasks,
      {
        id: this.nextId(),
        title,
        description,
        status: 'todo',
        priority,
        order: maxOrder + 1, // Add to end
      },
    ];
    // ...
  });
}
```

**5. Completely rewrote `onDrop()` to handle reordering:**

```typescript
onDrop(event: DragEvent, newStatus: TaskStatus) {
  event.preventDefault();
  const taskId = this.draggedTaskId();
  const targetTaskId = this.dropTargetTaskId();
  const draggedTask = this.tasks().find(t => t.id === taskId);

  this.tasks.update((tasks: Task[]) => {
    // If dropped on a specific task (reordering)
    if (targetTaskId !== null) {
      const targetTask = tasks.find(t => t.id === targetTaskId);
      if (targetTask && targetTask.status === newStatus) {
        // Reorder within same column
        const columnTasks = tasks
          .filter(t => t.status === newStatus && t.id !== taskId)
          .sort((a, b) => a.order - b.order);

        const targetIndex = columnTasks.findIndex(t => t.id === targetTaskId);

        // Insert dragged task at target position
        columnTasks.splice(targetIndex, 0, { ...draggedTask, status: newStatus });

        // Reassign order values
        columnTasks.forEach((task, index) => {
          const taskInArray = tasks.find(t => t.id === task.id);
          if (taskInArray) {
            taskInArray.order = index + 1;
            if (taskInArray.id === taskId) {
              taskInArray.status = newStatus;
            }
          }
        });

        return [...tasks];
      }
    }

    // Moving to different column
    if (draggedTask.status !== newStatus) {
      const newColumnTasks = tasks.filter(t => t.status === newStatus);
      const maxOrder = newColumnTasks.length > 0
        ? Math.max(...newColumnTasks.map(t => t.order))
        : 0;

      return tasks.map((t: Task) =>
        t.id === taskId
          ? { ...t, status: newStatus, order: maxOrder + 1 }
          : t
      );
    }

    return tasks;
  });

  this.draggedTaskId.set(null);
  this.dragOverColumn.set(null);
  this.dropTargetTaskId.set(null);
}
```

**6. Added `onDragOverTask()` handler:**

```typescript
onDragOverTask(event: DragEvent, taskId: number) {
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  this.dropTargetTaskId.set(taskId);
}
```

**7. Updated `loadTasks()` migration logic:**

```typescript
private loadTasks(): Task[] {
  // ...existing code...
  return tasks.map((task, index) => ({
    ...task,
    description: task.description || '',
    priority: task.priority || 'medium',
    order: task.order ?? index + 1, // Assign order if missing
  }));
}
```

#### HTML Changes (`kanban.html`):

Added drag events to all task cards in all 3 columns:

```html
<div
  class="task"
  draggable="true"
  [class.dragging]="draggedTaskId() === task.id"
  [class.drop-target]="dropTargetTaskId() === task.id"
  (dragstart)="onDragStart($event, task.id)"
  (dragend)="onDragEnd()"
  (dragover)="onDragOverTask($event, task.id)"
>
  <!-- task content -->
</div>
```

#### CSS Changes (`kanban.css`):

Added visual feedback for drop target:

```css
/* Visual feedback for drop target (reordering within column) */
.task.drop-target {
  border-top: 3px solid rgba(196, 77, 255, 0.8);
  margin-top: 8px;
  box-shadow: 0 -4px 20px rgba(196, 77, 255, 0.3);
  transform: translateY(2px);
}
```

#### How It Works:

1. **Drag a task** → Task becomes semi-transparent
2. **Hover over another task** → A glowing line appears above the target task
3. **Drop** → Task is inserted at that position
4. **All tasks in the column are automatically renumbered** (order: 1, 2, 3, ...)

#### User Experience:

| Action                        | Result                                         |
| ----------------------------- | ---------------------------------------------- |
| Drag task within same column  | Task moves to new position, other tasks shift  |
| Drag task to different column | Task moves to end of new column                |
| Drag task over another task   | Shows insertion line (drop target indicator)   |
| Release drag                  | Tasks reorder, order persisted to localStorage |

#### Benefits:

- ✅ Prioritize tasks by dragging to top of column
- ✅ Group related tasks together
- ✅ Visual feedback makes it clear where task will drop
- ✅ Order persists across page reloads
- ✅ Smooth animations for better UX

---

## [v7.1] - 14 February 2026

### 🧹 Code Optimization & Cleanup

**Files edited:** `kanban.ts`, `kanban.html`, `kanban.css`

#### Summary

Full code audit and optimization pass. Removed all dead code, improved performance with Angular `computed()` signals, and cleaned up unused CSS.

#### Performance Optimization — `computed()` signals (`kanban.ts`):

**Before (inefficient):** `getTaskByStatus()` method ran on every change detection cycle.

```typescript
// OLD — re-filters on every render
getTaskByStatus(status: TaskStatus): Task[] {
  return this.tasks().filter((task) => task.status === status);
}
```

**After (optimized):** `computed()` signals cache results and only recalculate when `tasks` signal changes.

```typescript
// NEW — cached, only recalculates when tasks change
todoTasks = computed(() => this.tasks().filter((t) => t.status === 'todo'));
inprogressTasks = computed(() => this.tasks().filter((t) => t.status === 'inprogress'));
doneTasks = computed(() => this.tasks().filter((t) => t.status === 'done'));
```

#### HTML Updated (`kanban.html`):

```html
<!-- Before -->
@for (task of getTaskByStatus('todo'); track task.id) { ... }

<!-- After -->
@for (task of todoTasks(); track task.id) { ... }
```

#### Dead Code Removed (`kanban.ts`):

| Removed                                   | Reason                                 |
| ----------------------------------------- | -------------------------------------- |
| `console.log()` in `saveEdit()`           | Debug logging not needed in production |
| `showPulse` signal + `setTimeout`         | Signal was never read in template      |
| Commented-out `moveTask()` method         | Replaced by drag & drop in v4.0        |
| Commented-out old `tasks = signal([...])` | Replaced by `loadTasks()` in v1.2      |

#### Dead CSS Removed (`kanban.css`):

| Removed                                        | Reason                                        |
| ---------------------------------------------- | --------------------------------------------- |
| `.save-btn` / `.cancel-btn` styles             | Inline edit buttons replaced by modal in v4.1 |
| `.edit-input` / `.description-textarea` styles | Inline edit form replaced by modal in v4.1    |
| Duplicate `.column { transition }` rule        | Already defined in main `.column` block       |

#### Result:

- ✅ TypeScript: 248 → 212 lines (−36 lines)
- ✅ CSS: ~80 lines of dead rules removed
- ✅ Performance: `computed()` caching instead of per-render filtering
- ✅ Zero compile errors, zero lint warnings
- ✅ Clean comments (fixed typos like "funtion" → proper labels)

---

## [v7.0] - 14 February 2026

### 🎨 Complete Visual Redesign — Modern Glassmorphism UI

**Files edited:** `kanban.css`, `styles.css`, `index.html`

#### Summary

Complete CSS overhaul transforming the board into a cutting-edge, visually stunning dark UI with glassmorphism, animated backgrounds, glowing accents, and modern micro-interactions — inspired by the latest web design trends.

#### Font & Global Styles:

**`index.html`** — Added Google Fonts Inter (weights 400–900):

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
  rel="stylesheet"
/>
```

**`styles.css`** — Global resets, font smoothing, custom scrollbar:

```css
html,
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}
```

#### Animated Background (`kanban.css`):

```css
.page {
  background: #0a0a1a;
  background-image: radial-gradient(ellipse 80% 50% at 20% 40%, rgba(120, 40, 200, 0.25)...),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(0, 180, 220, 0.2)...), radial-gradient(
      ellipse 50% 60% at 60% 80%,
      rgba(233, 69, 96, 0.15)...
    ), radial-gradient(ellipse 40% 40% at 10% 90%, rgba(15, 155, 88, 0.12)...);
}
```

**Floating ambient orbs** (2 pseudo-elements with slow infinite animations):

```css
.page::before {
  animation: floatOrb1 20s ease-in-out infinite;
}
.page::after {
  animation: floatOrb2 25s ease-in-out infinite;
}
```

#### Title — Animated Gradient Text:

```css
.title {
  background: linear-gradient(135deg, #ff6b9d, #c44dff, #00d4ff, #ff6b9d);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 6s ease-in-out infinite;
}
```

#### Columns — Glassmorphism:

```css
.column {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
}
```

**Column headers** — Vibrant color-coded gradients:

| Column      | Gradient            | Glow             |
| ----------- | ------------------- | ---------------- |
| To Do       | `#e94560 → #c44dff` | Pink/purple glow |
| In Progress | `#00b4d8 → #7c3aed` | Cyan/blue glow   |
| Done        | `#10b981 → #06b6d4` | Green/teal glow  |

#### Task Cards — Glass Effect + Glowing Borders:

```css
.task {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
}
.task::before {
  /* 3px glowing left border, color-coded per column */
}
.task:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}
```

#### Priority Badges — Glowing Pills:

| Priority | Background                 | Text      | Glow       |
| -------- | -------------------------- | --------- | ---------- |
| Low      | `rgba(16, 185, 129, 0.15)` | `#6ee7b7` | Green glow |
| Medium   | `rgba(251, 191, 36, 0.15)` | `#fcd34d` | Amber glow |
| High     | `rgba(239, 68, 68, 0.15)`  | `#fca5a5` | Red glow   |

#### Modal — Frosted Glass Popup:

```css
.modal-backdrop {
  backdrop-filter: blur(10px);
}
.modal {
  background: rgba(20, 20, 40, 0.85);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  animation: modalSlideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### Drag & Drop — Glowing Feedback:

```css
.task.dragging {
  opacity: 0.35;
  transform: scale(0.95) rotate(1deg);
}
.column.drag-over {
  outline: 2px dashed rgba(196, 77, 255, 0.5);
}
```

#### Micro-Interactions:

- Column hover: lift + shadow
- Task hover: lift + scale + glow
- Button hover: scale + color glow
- Button active: squish effect (`scale(0.88)`)
- Action buttons: fade in on task hover

#### Responsive Design:

- **Tablet (≤1024px):** Columns stack vertically, fluid title sizing
- **Mobile (≤480px):** Compact padding, larger tap targets, scaled modal

---

## [v6.0] - 14 February 2026

### ⭐ Task Priority Levels

**Files edited:** `kanban.ts`, `kanban.html`, `kanban.css`

#### Summary

Added **Low**, **Medium**, and **High** priority levels to tasks. Each task now displays a colored priority badge, and priority can be set when creating or editing tasks.

#### TypeScript Changes (`kanban.ts`):

```typescript
// Added priority type
type TaskPriority = 'low' | 'medium' | 'high';

// Updated Task interface
interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority; // NEW
}

// Added priority signals
newTaskPriority = signal<TaskPriority>('medium');
editingPriority = signal<TaskPriority>('medium');

// Updated addTask() to include priority
addTask() {
  const priority = this.newTaskPriority();
  this.tasks.update((tasks) => {
    const updated: Task[] = [
      ...tasks,
      {
        id: this.nextId(),
        title,
        description,
        status: 'todo',
        priority, // NEW
      },
    ];
    // ...
  });
  this.newTaskPriority.set('medium'); // Reset to default
}

// Updated startEdit() to load task priority
startEdit(task: Task) {
  // ...existing code...
  this.editingPriority.set(task.priority);
}

// Updated saveEdit() to save priority
saveEdit(taskId: number) {
  const newPriority = this.editingPriority();
  this.tasks.update((tasks: Task[]) => {
    const updated: Task[] = tasks.map((t: Task) =>
      t.id === taskId
        ? { ...t, title: newTitle, description: newDescription, priority: newPriority }
        : t
    );
    // ...
  });
}
```

#### HTML Changes (`kanban.html`):

**1) Added priority badge to all task cards:**

```html
<div class="task-content">
  <div class="task-header">
    <span class="task-title">{{ task.title }}</span>
    <span class="priority-badge" [class]="'priority-' + task.priority">
      {{ task.priority.toUpperCase() }}
    </span>
  </div>
  @if (task.description) {
  <span class="task-description">{{ task.description }}</span>
  }
</div>
```

**2) Added priority dropdown to Add Task modal:**

```html
<label class="modal-label">Priority</label>
<select
  class="modal-select"
  [value]="newTaskPriority()"
  (change)="newTaskPriority.set($any($event.target).value)"
>
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
</select>
```

**3) Added priority dropdown to Edit Task modal** (same structure as Add Task)

#### CSS Changes (`kanban.css`):

**Task header layout:**

```css
.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.task-title {
  flex: 1; /* Takes remaining space */
}
```

**Priority badge styles:**

```css
.priority-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
}

.priority-low {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.priority-medium {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.priority-high {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
```

**Select dropdown styles (dark theme):**

```css
.modal-select {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #233554;
  border-radius: 10px;
  background: #0f3460;
  color: white;
  cursor: pointer;
}

.modal-select:hover {
  border-color: #4a5568;
}

.modal-select:focus {
  border-color: #e94560;
}
```

#### Visual Result:

| Priority   | Badge Color              | Border        | Text Color       |
| ---------- | ------------------------ | ------------- | ---------------- |
| **LOW**    | Light Green (`#d4edda`)  | Green border  | Dark green text  |
| **MEDIUM** | Light Yellow (`#fff3cd`) | Yellow border | Dark orange text |
| **HIGH**   | Light Red (`#f8d7da`)    | Red border    | Dark red text    |

#### User Flow:

1. **Add Task**: Select priority from dropdown (default: Medium) → Task created with colored badge
2. **Edit Task**: Click ✏️ → Modal opens with current priority pre-selected → Change and save
3. **View Tasks**: Priority badge displayed next to task title in all columns

---

## [v5.0] - 14 February 2026

### 📱 Responsive Design

**Files edited:** `kanban.css`

#### Media Queries Added:

```css
/* Tablet/iPad (≤1024px) - Stack columns vertically */
@media (max-width: 1024px) {
  .board {
    flex-direction: column;
    gap: 16px;
  }
  .column {
    width: 100%;
  }
  .title {
    font-size: clamp(1.2rem, 4vw, 1.8rem);
  }
}

/* Mobile (≤480px) - Optimize spacing */
@media (max-width: 480px) {
  .page {
    padding: 16px;
  }
  .modal {
    width: 90vw;
    max-width: 400px;
  }
  .task-btn {
    min-width: 44px;
    min-height: 44px; /* Bigger tap targets */
  }
}
```

#### Result:

- ✅ Columns stack vertically on tablets/phones (no horizontal scrolling)
- ✅ Touch-friendly 44px button size on mobile
- ✅ Modal scales to 90% viewport width
- ✅ Reduced padding on small screens

---

## [v4.1] - 14 February 2026

### 🪟 Modal Popup for Editing Tasks

**Files edited:** `kanban.ts`, `kanban.html`

#### Summary

Replaced inline editing form with a modal popup (same style as "Add Task" modal). Now clicking ✏️ on any task opens a popup instead of showing inline inputs.

#### Before → After

| Feature | Before                           | After                                    |
| ------- | -------------------------------- | ---------------------------------------- |
| Edit UI | Inline form appears in task card | Modal popup (like Add Task)              |
| Editing | Only in To Do column             | All 3 columns (To Do, In Progress, Done) |
| UX      | Task card expands with inputs    | Clean popup, task stays compact          |

#### TypeScript changes (`kanban.ts`):

```typescript
// Added modal signal
showEditTaskModal = signal(false);

// Updated methods to show/hide modal
startEdit(task: Task) {
  this.editingTaskId.set(task.id);
  this.editingTitle.set(task.title);
  this.editingDescription.set(task.description);
  this.showEditTaskModal.set(true); // ← NEW
}

cancelEdit() {
  // ...existing code...
  this.showEditTaskModal.set(false); // ← NEW
}

saveEdit(taskId: number) {
  // ...existing code...
  this.cancelEdit(); // Closes modal after saving
}
```

#### HTML changes (`kanban.html`):

**Removed:** Inline `@if (editingTaskId() === task.id)` forms from all task cards

**Added:** Edit Task modal (after Add Task modal):

```html
@if (showEditTaskModal()) {
<div class="modal-backdrop" (click)="cancelEdit()">
  <div class="modal">
    <div class="modal-header">
      <h2>Edit Task</h2>
      <button class="modal-close" (click)="cancelEdit()">✕</button>
    </div>
    <div class="modal-body">
      <label>Title</label>
      <input
        [value]="editingTitle()"
        (input)="editingTitle.set($any($event.target).value)"
        (keyup.enter)="saveEdit(editingTaskId()!)"
      />

      <label>Description</label>
      <textarea
        [value]="editingDescription()"
        (input)="editingDescription.set($any($event.target).value)"
      >
      </textarea>
    </div>
    <div class="modal-actions">
      <button (click)="cancelEdit()">Cancel</button>
      <button (click)="saveEdit(editingTaskId()!)">Save Changes</button>
    </div>
  </div>
</div>
}
```

#### Benefits:

- ✅ Consistent UI (both Add and Edit use modals)
- ✅ Cleaner task cards (no expanding inline forms)
- ✅ Can edit tasks from any column
- ✅ Keyboard shortcuts: Enter to save, Escape to cancel

---

## [v4.0] - 10 February 2026

### 🖱️ Drag & Drop Task Movement

**Files edited:** `kanban.ts`, `kanban.html`, `kanban.css`

#### Summary

Replaced the old click-to-move system with a full drag-and-drop implementation. Tasks can now be dragged between any columns (To Do ↔ In Progress ↔ Done) in any direction, not just forward.

#### Before → After

| Feature         | Before                                    | After                                                    |
| --------------- | ----------------------------------------- | -------------------------------------------------------- |
| Task movement   | Click task content → moves to next column | Drag task → drop onto any column                         |
| Direction       | One-way (To Do → In Progress → Done)      | Any direction (freely between all 3 columns)             |
| Visual feedback | None                                      | Dragging opacity, grab cursor, column highlight on hover |
| Cursor          | Default pointer                           | `grab` / `grabbing` cursor on tasks                      |

#### TypeScript logic added to `kanban.ts`:

```typescript
// Signals for drag state
draggedTaskId = signal<number | null>(null);
dragOverColumn = signal<TaskStatus | null>(null);

// Event handlers
onDragStart(event: DragEvent, taskId: number) {
  this.draggedTaskId.set(taskId);
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', taskId.toString());
}

onDragEnd() {
  this.draggedTaskId.set(null);
  this.dragOverColumn.set(null);
}

onDragOver(event: DragEvent, column: TaskStatus) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  this.dragOverColumn.set(column);
}

onDragLeave() {
  this.dragOverColumn.set(null);
}

onDrop(event: DragEvent, newStatus: TaskStatus) {
  // Updates task status via signal .update() and saves to localStorage
}
```

#### Removed:

```typescript
// Old click-based moveTask() — REMOVED
moveTask(task: Task) {
  // todo → inprogress → done (one-way only)
}
```

#### HTML changes (`kanban.html`):

```html
<!-- Each column now has drag event listeners -->
<div
  class="column"
  [class.drag-over]="dragOverColumn() === 'todo'"
  (dragover)="onDragOver($event, 'todo')"
  (dragleave)="onDragLeave()"
  (drop)="onDrop($event, 'todo')"
>
  <!-- Each task is now draggable -->
  <div
    class="task"
    draggable="true"
    [class.dragging]="draggedTaskId() === task.id"
    (dragstart)="onDragStart($event, task.id)"
    (dragend)="onDragEnd()"
  ></div>
</div>
```

#### CSS changes (`kanban.css`):

```css
/* Grab cursor on draggable tasks */
.task[draggable='true'] {
  cursor: grab;
}
.task[draggable='true']:active {
  cursor: grabbing;
}

/* Faded + scaled effect while dragging */
.task.dragging {
  opacity: 0.4;
  transform: scale(0.95);
  box-shadow: 0 8px 24px rgba(233, 69, 96, 0.3);
}

/* Color-coded dashed outline on target column */
.column.drag-over {
  outline: 2px dashed #e94560;
  box-shadow: 0 0 20px rgba(233, 69, 96, 0.25);
  background: #1a2747;
}
```

---

## [v3.0] - 10 February 2026

### 🎨 Complete UI Redesign (Dark Theme)

**Files edited:** `kanban.css`, `kanban.html`

#### Before → After

| Feature        | Before                              | After                                             |
| -------------- | ----------------------------------- | ------------------------------------------------- |
| Background     | White (`#fff`)                      | Dark navy (`#1a1a2e`)                             |
| Columns        | White cards                         | Dark panels (`#16213e`)                           |
| Column headers | Plain gray                          | Color-coded gradients (Red / Green / Teal)        |
| Tasks          | White cards, no border              | White cards with colored left border              |
| Title          | Black centered text                 | Red (`#e94560`) left-aligned, uppercase           |
| Add Task       | Top input bar + green circle button | Red "+ NEW TASK" button at bottom of To Do column |

#### Logic:

- Removed the old top-level `.add-task` input bar from `kanban.html`
- The `+ NEW TASK` button now sits at the bottom of the To Do column
- Clicking it opens a **modal popup** instead of inline inputs

---

### 🪟 Modal Popup for Adding Tasks

**Files edited:** `kanban.html`, `kanban.css`, `kanban.ts`

#### Before:

```html
<!-- Old: Inline inputs at the top of the page -->
<div class="add-task">
  <input placeholder="Enter new task..." />
  <input placeholder="Add description..." />
  <button class="add-btn">+</button>
</div>
```

#### After:

```html
<!-- New: Modal popup triggered by button -->
<button class="column-add-btn" (click)="showAddTaskModal.set(true)">+ NEW TASK</button>

<!-- Modal appears on click -->
@if (showAddTaskModal()) {
<div class="modal-backdrop">
  <div class="modal">
    <!-- Title input, Description textarea, Cancel/Add buttons -->
  </div>
</div>
}
```

#### TypeScript logic added:

```typescript
// Signal to control modal visibility
showAddTaskModal = signal(false);

// addTask() creates the task and modal closes via:
// (click)="addTask(); showAddTaskModal.set(false)"
```

#### CSS logic added:

```css
/* Dark themed modal with blur backdrop */
.modal-backdrop {
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

.modal {
  background: #16213e;
  animation: slideUp 0.3s ease; /* slides up when opening */
}

/* Dark inputs that match the theme */
.modal-input,
.modal-textarea {
  background: #0f3460;
  color: white;
  border-color: #233554;
}
```

---

## [v2.2] - 9 February 2026

### 🗑️ Delete Task Feature

**Files edited:** `kanban.ts`, `kanban.html`, `kanban.css`

#### Logic added to `kanban.ts`:

```typescript
deleteTask(taskId: number) {
  this.tasks.update((tasks: Task[]) => {
    const updated = tasks.filter(t => t.id !== taskId);
    this.saveTasks(updated);
    return updated;
  });
}
```

#### HTML: Added ✕ button to all columns

```html
<button class="task-btn delete-btn" (click)="deleteTask(task.id)">✕</button>
```

#### CSS: Red delete button styling

```css
.delete-btn {
  background: #fab1a0;
  color: #d63031;
}
.delete-btn:hover {
  background: #e17055;
  color: white;
}
```

---

## [v2.1] - 9 February 2026

### 📝 Description Field Added

**Files edited:** `kanban.ts`, `kanban.html`, `kanban.css`

#### Before:

```typescript
interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}
```

#### After:

```typescript
interface Task {
  id: number;
  title: string;
  description: string; // NEW
  status: TaskStatus;
}
```

#### Signals added:

```typescript
newTaskDescription = signal('');
editingDescription = signal('');
```

#### HTML: Shows description below title in italic gray text

```html
@if (task.description) {
<span class="task-description">{{ task.description }}</span>
}
```

---

## [v2.0] - 9 February 2026

### ✏️ Edit Task Feature (To Do column only)

**Files edited:** `kanban.ts`, `kanban.html`, `kanban.css`

#### Signals added:

```typescript
editingTaskId = signal<number | null>(null);
editingTitle = signal('');
```

#### Methods added:

```typescript
startEdit(task); // Sets editing state
cancelEdit(); // Clears editing state
saveEdit(taskId); // Updates task title via .map() and saves
```

#### HTML: Toggles between view mode and edit mode

```html
@if (editingTaskId() === task.id) {
<!-- Show input + Save/Cancel buttons -->
} @else {
<!-- Show title + Edit button -->
}
```

---

## [v1.2] - 9 February 2026

### 💾 LocalStorage Persistence

**Files edited:** `kanban.ts`

#### Logic:

```typescript
// Load from localStorage on init
private loadTasks(): Task[] {
  const stored = this.isBrowser ? localStorage.getItem(STORAGE_KEY) : null;
  return stored ? (JSON.parse(stored) as Task[]) : [];
}

// Save after every change
private saveTasks(tasks: Task[]) {
  if (this.isBrowser) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
```

#### SSR-safe guard:

```typescript
private platformId = inject(PLATFORM_ID);
private isBrowser = isPlatformBrowser(this.platformId);
// Prevents "localStorage is not defined" on server
```

---

## [v1.1] - 8 February 2026

### ➕ Add Task Feature

**Files edited:** `kanban.ts`, `kanban.html`

#### Logic:

```typescript
addTask() {
  const title = this.newTaskTitle().trim();
  if (!title) return;

  this.tasks.update(tasks => [...tasks, { id: this.nextId(), title, status: 'todo' }]);
  this.nextId.update(id => id + 1);
  this.newTaskTitle.set('');
}
```

---

## [v1.0] - 8 February 2026

### 🎯 Initial Kanban Board

**Files created:** `kanban.ts`, `kanban.html`, `kanban.css`

#### Features:

- 3-column layout: To Do, In Progress, Done
- Click task to move to next stage
- Enter/leave animations using `@angular/animations`
- Signal-based state management
- Standalone Angular component

#### Core logic:

```typescript
tasks = signal<Task[]>([...]);

getTaskByStatus(status: TaskStatus): Task[] {
  return this.tasks().filter(task => task.status === status);
}

moveTask(task: Task) {
  // todo → inprogress → done
}
```
