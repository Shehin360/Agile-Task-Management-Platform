import { Component, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

const STORAGE_KEY = 'kanban_tasks';
const COLUMNS_KEY = 'kanban_columns';
type TaskPriority = 'low' | 'medium' | 'high';

// Column gradient presets for dynamic columns
const COLUMN_COLORS = [
  {
    gradient: 'linear-gradient(135deg, #e94560, #c44dff)',
    glow: 'rgba(233, 69, 96, 0.3)',
    accent: '#e94560',
  },
  {
    gradient: 'linear-gradient(135deg, #00b4d8, #7c3aed)',
    glow: 'rgba(0, 180, 216, 0.3)',
    accent: '#00b4d8',
  },
  {
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    glow: 'rgba(16, 185, 129, 0.3)',
    accent: '#10b981',
  },
  {
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    glow: 'rgba(245, 158, 11, 0.3)',
    accent: '#f59e0b',
  },
  {
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    glow: 'rgba(139, 92, 246, 0.3)',
    accent: '#8b5cf6',
  },
  {
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    glow: 'rgba(6, 182, 212, 0.3)',
    accent: '#06b6d4',
  },
  {
    gradient: 'linear-gradient(135deg, #84cc16, #22c55e)',
    glow: 'rgba(132, 204, 22, 0.3)',
    accent: '#84cc16',
  },
  {
    gradient: 'linear-gradient(135deg, #f43f5e, #fb923c)',
    glow: 'rgba(244, 63, 94, 0.3)',
    accent: '#f43f5e',
  },
];

interface Column {
  id: string;
  name: string;
  colorIndex: number; // Index into COLUMN_COLORS
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string; // Now dynamic — matches column.id
  priority: TaskPriority;
  order: number;
  dueDate: string | null;
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [],
  templateUrl: './kanban.html',
  styleUrls: ['./kanban.css'],
  animations: [
    trigger('taskAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class Kanban {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Dynamic columns
  columns = signal<Column[]>(this.loadColumns());
  tasks = signal<Task[]>(this.loadTasks());

  // Column colors for template access
  getColumnColor(colorIndex: number) {
    return COLUMN_COLORS[colorIndex % COLUMN_COLORS.length];
  }

  // Search
  searchQuery = signal('');

  taskMatchesSearch(task: Task): boolean {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return true;
    return (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.priority.toLowerCase().includes(query)
    );
  }

  // Sort mode
  sortMode = signal<'manual' | 'dueDate' | 'priority'>('manual');

  cycleSortMode() {
    const modes: ('manual' | 'dueDate' | 'priority')[] = ['manual', 'dueDate', 'priority'];
    const currentIndex = modes.indexOf(this.sortMode());
    this.sortMode.set(modes[(currentIndex + 1) % modes.length]);
  }

  sortLabel = computed(() => {
    switch (this.sortMode()) {
      case 'manual':
        return '↕️ Manual';
      case 'dueDate':
        return '📅 Due Date';
      case 'priority':
        return '🎯 Priority';
    }
  });

  private priorityWeight(p: TaskPriority): number {
    switch (p) {
      case 'high':
        return 1;
      case 'medium':
        return 2;
      case 'low':
        return 3;
    }
  }

  private sortTasks(tasks: Task[]): Task[] {
    const mode = this.sortMode();
    if (mode === 'manual') {
      return tasks.sort((a, b) => a.order - b.order);
    }
    if (mode === 'dueDate') {
      return tasks.sort((a, b) => {
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        return a.order - b.order;
      });
    }
    return tasks.sort((a, b) => {
      const diff = this.priorityWeight(a.priority) - this.priorityWeight(b.priority);
      if (diff !== 0) return diff;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return a.order - b.order;
    });
  }

  // Dynamic: get tasks for any column
  getColumnTasks(columnId: string): Task[] {
    const query = this.searchQuery().toLowerCase().trim();
    let filtered = this.tasks().filter((t) => t.status === columnId);
    if (query) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.priority.toLowerCase().includes(query)
      );
    }
    return this.sortTasks([...filtered]);
  }

  // ──────── COLUMN MANAGEMENT ────────

  showAddColumnModal = signal(false);
  newColumnName = signal('');
  showDeleteColumnConfirm = signal<string | null>(null); // column id to confirm delete
  editingColumnId = signal<string | null>(null);
  editingColumnName = signal('');

  addColumn() {
    const name = this.newColumnName().trim();
    if (!name) return;

    const id =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now();
    const colorIndex = this.columns().length % COLUMN_COLORS.length;

    this.columns.update((cols) => {
      const updated = [...cols, { id, name, colorIndex }];
      this.saveColumns(updated);
      return updated;
    });

    this.newColumnName.set('');
    this.showAddColumnModal.set(false);
  }

  deleteColumn(columnId: string) {
    // Move tasks from deleted column to the first column, or delete them if no columns left
    const cols = this.columns();
    const remaining = cols.filter((c) => c.id !== columnId);
    const fallbackColumn = remaining.length > 0 ? remaining[0].id : null;

    this.tasks.update((tasks) => {
      let updated: Task[];
      if (fallbackColumn) {
        updated = tasks.map((t) => (t.status === columnId ? { ...t, status: fallbackColumn } : t));
      } else {
        updated = tasks.filter((t) => t.status !== columnId);
      }
      this.saveTasks(updated);
      return updated;
    });

    this.columns.update((cols) => {
      const updated = cols.filter((c) => c.id !== columnId);
      this.saveColumns(updated);
      return updated;
    });

    this.showDeleteColumnConfirm.set(null);
  }

  startEditColumn(column: Column) {
    this.editingColumnId.set(column.id);
    this.editingColumnName.set(column.name);
  }

  saveEditColumn() {
    const id = this.editingColumnId();
    const name = this.editingColumnName().trim();
    if (!id || !name) return;

    this.columns.update((cols) => {
      const updated = cols.map((c) => (c.id === id ? { ...c, name } : c));
      this.saveColumns(updated);
      return updated;
    });

    this.editingColumnId.set(null);
    this.editingColumnName.set('');
  }

  cancelEditColumn() {
    this.editingColumnId.set(null);
    this.editingColumnName.set('');
  }

  // ──────── DRAG STATE ────────

  draggedTaskId = signal<number | null>(null);
  dragOverColumn = signal<string | null>(null);
  dropTargetTaskId = signal<number | null>(null);

  onDragStart(event: DragEvent, taskId: number) {
    this.draggedTaskId.set(taskId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', taskId.toString());
    }
  }

  onDragEnd() {
    this.draggedTaskId.set(null);
    this.dragOverColumn.set(null);
  }

  onDragOver(event: DragEvent, column: string) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverColumn.set(column);
  }

  onDragLeave() {
    this.dragOverColumn.set(null);
  }

  onDrop(event: DragEvent, newStatus: string) {
    event.preventDefault();
    const taskId = this.draggedTaskId();
    if (taskId == null) return;

    const targetTaskId = this.dropTargetTaskId();
    const draggedTask = this.tasks().find((t) => t.id === taskId);
    if (!draggedTask) return;

    this.tasks.update((tasks: Task[]) => {
      const oldStatus = draggedTask.status;

      if (targetTaskId !== null) {
        const targetTask = tasks.find((t) => t.id === targetTaskId);
        if (targetTask && targetTask.status === newStatus) {
          const columnTasks = tasks
            .filter((t) => t.status === newStatus && t.id !== taskId)
            .sort((a, b) => a.order - b.order);

          const targetIndex = columnTasks.findIndex((t) => t.id === targetTaskId);
          columnTasks.splice(targetIndex, 0, { ...draggedTask, status: newStatus });

          columnTasks.forEach((task, index) => {
            const taskInArray = tasks.find((t) => t.id === task.id);
            if (taskInArray) {
              taskInArray.order = index + 1;
              if (taskInArray.id === taskId) {
                taskInArray.status = newStatus;
              }
            }
          });

          this.saveTasks(tasks);
          return [...tasks];
        }
      }

      if (oldStatus !== newStatus) {
        const newColumnTasks = tasks.filter((t) => t.status === newStatus);
        const maxOrder =
          newColumnTasks.length > 0 ? Math.max(...newColumnTasks.map((t) => t.order)) : 0;

        const updated: Task[] = tasks.map((t: Task) =>
          t.id === taskId ? { ...t, status: newStatus, order: maxOrder + 1 } : t
        );

        this.saveTasks(updated);
        return updated;
      } else {
        return tasks;
      }
    });

    this.draggedTaskId.set(null);
    this.dragOverColumn.set(null);
    this.dropTargetTaskId.set(null);
  }

  onDragOverTask(event: DragEvent, taskId: number) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dropTargetTaskId.set(taskId);
  }

  // ──────── TASK MODALS ────────

  showAddTaskModal = signal(false);
  showEditTaskModal = signal(false);
  addTaskColumnId = signal<string>(''); // which column to add a task to

  newTaskTitle = signal('');
  newTaskDescription = signal('');
  newTaskPriority = signal<TaskPriority>('medium');
  newTaskDueDate = signal<string | null>(null);
  nextId = signal(this.getNextId());

  editingTaskId = signal<number | null>(null);
  editingTitle = signal('');
  editingDescription = signal('');
  editingPriority = signal<TaskPriority>('medium');
  editingDueDate = signal<string | null>(null);

  openAddTaskModal(columnId: string) {
    this.addTaskColumnId.set(columnId);
    this.showAddTaskModal.set(true);
  }

  addTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    const description = this.newTaskDescription().trim();
    const priority = this.newTaskPriority();
    const dueDate = this.newTaskDueDate();
    const columnId = this.addTaskColumnId();

    this.tasks.update((tasks) => {
      const columnTasks = tasks.filter((t) => t.status === columnId);
      const maxOrder = columnTasks.length > 0 ? Math.max(...columnTasks.map((t) => t.order)) : 0;

      const updated: Task[] = [
        ...tasks,
        {
          id: this.nextId(),
          title,
          description,
          status: columnId,
          priority,
          order: maxOrder + 1,
          dueDate,
        },
      ];
      this.saveTasks(updated);
      return updated;
    });

    this.nextId.update((id) => id + 1);
    this.newTaskTitle.set('');
    this.newTaskDescription.set('');
    this.newTaskPriority.set('medium');
    this.newTaskDueDate.set(null);
  }

  startEdit(task: Task) {
    this.editingTaskId.set(task.id);
    this.editingTitle.set(task.title || '');
    this.editingDescription.set(task.description || '');
    this.editingPriority.set(task.priority || 'medium');
    this.editingDueDate.set(task.dueDate || null);
    this.showEditTaskModal.set(true);
  }

  cancelEdit() {
    this.editingTaskId.set(null);
    this.editingTitle.set('');
    this.editingDescription.set('');
    this.editingPriority.set('medium');
    this.editingDueDate.set(null);
    this.showEditTaskModal.set(false);
  }

  saveEdit(taskId: number) {
    const newTitle = this.editingTitle().trim();
    if (!newTitle) return;

    const newDescription = (this.editingDescription() || '').trim();
    const newPriority = this.editingPriority() || 'medium';
    const newDueDate = this.editingDueDate();

    this.tasks.update((tasks: Task[]) => {
      const updated: Task[] = tasks.map((t: Task) =>
        t.id === taskId
          ? {
              ...t,
              title: newTitle,
              description: newDescription,
              priority: newPriority,
              dueDate: newDueDate,
            }
          : t
      );
      this.saveTasks(updated);
      return updated;
    });

    this.cancelEdit();
  }

  deleteTask(taskId: number) {
    this.tasks.update((tasks: Task[]) => {
      const updated: Task[] = tasks.filter((t: Task) => t.id !== taskId);
      this.saveTasks(updated);
      return updated;
    });
  }

  // ──────── DUE DATE HELPERS ────────

  getDueDateStatus(dueDate: string | null): 'overdue' | 'today' | 'upcoming' | 'none' {
    if (!dueDate) return 'none';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    return 'upcoming';
  }

  formatDueDate(dueDate: string | null): string {
    if (!dueDate) return '';
    const due = new Date(dueDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `${diffDays}d left`;
    return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // ──────── PERSISTENCE ────────

  private loadColumns(): Column[] {
    const stored = this.isBrowser ? localStorage.getItem(COLUMNS_KEY) : null;
    if (stored) return JSON.parse(stored) as Column[];
    // Default columns
    return [
      { id: 'todo', name: 'To Do', colorIndex: 0 },
      { id: 'inprogress', name: 'In Progress', colorIndex: 1 },
      { id: 'done', name: 'Done', colorIndex: 2 },
    ];
  }

  private saveColumns(columns: Column[]) {
    if (this.isBrowser) localStorage.setItem(COLUMNS_KEY, JSON.stringify(columns));
  }

  private loadTasks(): Task[] {
    const stored = this.isBrowser ? localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) return [];
    const tasks = JSON.parse(stored) as Task[];
    return tasks.map((task, index) => ({
      ...task,
      description: task.description || '',
      priority: task.priority || 'medium',
      order: task.order ?? index + 1,
    }));
  }

  private saveTasks(tasks: Task[]) {
    if (this.isBrowser) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  private getNextId(): number {
    const stored = this.isBrowser ? localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) return 1;
    const tasks = JSON.parse(stored) as Task[];
    return tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  }
}
