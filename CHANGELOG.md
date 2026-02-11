# Changelog - Agile Kanban Board

All notable changes to this project are documented in this file.

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
