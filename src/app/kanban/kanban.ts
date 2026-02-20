import { Component, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

const STORAGE_KEY = 'kanban_tasks';
type TaskStatus = 'todo' | 'inprogress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  dueDate: string | null; // ISO date string (YYYY-MM-DD) or null
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

  tasks = signal<Task[]>(this.loadTasks());

  // Search
  searchQuery = signal('');

  // Check if a task matches the search query
  taskMatchesSearch(task: Task): boolean {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return true;
    return (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.priority.toLowerCase().includes(query)
    );
  }

  // Sort mode: 'manual' (drag order), 'dueDate' (earliest first), 'priority' (high first)
  sortMode = signal<'manual' | 'dueDate' | 'priority'>('manual');

  // Cycle through sort modes
  cycleSortMode() {
    const modes: ('manual' | 'dueDate' | 'priority')[] = ['manual', 'dueDate', 'priority'];
    const currentIndex = modes.indexOf(this.sortMode());
    this.sortMode.set(modes[(currentIndex + 1) % modes.length]);
  }

  // Sort label for display
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

  // Priority weight for sorting (higher priority = lower number = sorted first)
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

  // Shared sort function based on current mode
  private sortTasks(tasks: Task[]): Task[] {
    const mode = this.sortMode();
    if (mode === 'manual') {
      return tasks.sort((a, b) => a.order - b.order);
    }
    if (mode === 'dueDate') {
      return tasks.sort((a, b) => {
        // Tasks with due dates come first, then sort by date ascending
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        return a.order - b.order; // Fallback to manual order
      });
    }
    // priority mode
    return tasks.sort((a, b) => {
      const diff = this.priorityWeight(a.priority) - this.priorityWeight(b.priority);
      if (diff !== 0) return diff;
      // Same priority? Sort by due date (earliest first), then manual order
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return a.order - b.order;
    });
  }

  // Computed task lists — filter by search, then sort
  todoTasks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let filtered = this.tasks().filter((t) => t.status === 'todo');
    if (query) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.priority.toLowerCase().includes(query)
      );
    }
    return this.sortTasks(filtered);
  });
  inprogressTasks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let filtered = this.tasks().filter((t) => t.status === 'inprogress');
    if (query) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.priority.toLowerCase().includes(query)
      );
    }
    return this.sortTasks(filtered);
  });
  doneTasks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let filtered = this.tasks().filter((t) => t.status === 'done');
    if (query) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.priority.toLowerCase().includes(query)
      );
    }
    return this.sortTasks(filtered);
  });

  // Drag state
  draggedTaskId = signal<number | null>(null);
  dragOverColumn = signal<TaskStatus | null>(null);
  dropTargetTaskId = signal<number | null>(null); // For reordering within column

  onDragStart(event: DragEvent, taskId: number) {
    this.draggedTaskId.set(taskId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', taskId.toString());
    }
  }

  // Drag end
  onDragEnd() {
    this.draggedTaskId.set(null);
    this.dragOverColumn.set(null);
  }

  // Drag over
  onDragOver(event: DragEvent, column: TaskStatus) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverColumn.set(column);
  }

  onDragLeave() {
    this.dragOverColumn.set(null);
  }

  // Drop handler
  onDrop(event: DragEvent, newStatus: TaskStatus) {
    event.preventDefault();
    const taskId = this.draggedTaskId();
    if (taskId == null) return;

    const targetTaskId = this.dropTargetTaskId();
    const draggedTask = this.tasks().find((t) => t.id === taskId);
    if (!draggedTask) return;

    this.tasks.update((tasks: Task[]) => {
      const oldStatus = draggedTask.status;

      // If dropped on a specific task (for reordering)
      if (targetTaskId !== null) {
        const targetTask = tasks.find((t) => t.id === targetTaskId);
        if (targetTask && targetTask.status === newStatus) {
          // Reordering within same column
          const columnTasks = tasks
            .filter((t) => t.status === newStatus && t.id !== taskId)
            .sort((a, b) => a.order - b.order);

          const targetIndex = columnTasks.findIndex((t) => t.id === targetTaskId);

          // Insert dragged task at target position
          columnTasks.splice(targetIndex, 0, { ...draggedTask, status: newStatus });

          // Reassign order values
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

      // Moving to different column or empty column
      if (oldStatus !== newStatus) {
        // Get tasks in new column
        const newColumnTasks = tasks.filter((t) => t.status === newStatus);
        const maxOrder =
          newColumnTasks.length > 0 ? Math.max(...newColumnTasks.map((t) => t.order)) : 0;

        const updated: Task[] = tasks.map((t: Task) =>
          t.id === taskId ? { ...t, status: newStatus, order: maxOrder + 1 } : t
        );

        this.saveTasks(updated);
        return updated;
      } else {
        // Same column, no reorder (dropped on empty space)
        return tasks;
      }
    });

    this.draggedTaskId.set(null);
    this.dragOverColumn.set(null);
    this.dropTargetTaskId.set(null);
  }

  // New: Handle drag over specific task (for reordering)
  onDragOverTask(event: DragEvent, taskId: number) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dropTargetTaskId.set(taskId);
  }

  // Modal state
  showAddTaskModal = signal(false);
  showEditTaskModal = signal(false);

  // New task form state
  newTaskTitle = signal('');
  newTaskDescription = signal('');
  newTaskPriority = signal<TaskPriority>('medium');
  newTaskDueDate = signal<string | null>(null);
  nextId = signal(this.getNextId());

  // Editing state
  editingTaskId = signal<number | null>(null);
  editingTitle = signal('');
  editingDescription = signal('');
  editingPriority = signal<TaskPriority>('medium');
  editingDueDate = signal<string | null>(null);

  addTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    const description = this.newTaskDescription().trim();
    const priority = this.newTaskPriority();
    const dueDate = this.newTaskDueDate();

    this.tasks.update((tasks) => {
      // Get max order for 'todo' column
      const todoTasks = tasks.filter((t) => t.status === 'todo');
      const maxOrder = todoTasks.length > 0 ? Math.max(...todoTasks.map((t) => t.order)) : 0;

      const updated: Task[] = [
        ...tasks,
        {
          id: this.nextId(),
          title,
          description,
          status: 'todo',
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

  // Start editing a task
  startEdit(task: Task) {
    this.editingTaskId.set(task.id);
    this.editingTitle.set(task.title || '');
    this.editingDescription.set(task.description || '');
    this.editingPriority.set(task.priority || 'medium');
    this.editingDueDate.set(task.dueDate || null);
    this.showEditTaskModal.set(true);
  }

  // Cancel editing
  cancelEdit() {
    this.editingTaskId.set(null);
    this.editingTitle.set('');
    this.editingDescription.set('');
    this.editingPriority.set('medium');
    this.editingDueDate.set(null);
    this.showEditTaskModal.set(false);
  }

  // Save edited task
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

  // Delete a task
  deleteTask(taskId: number) {
    this.tasks.update((tasks: Task[]) => {
      const updated: Task[] = tasks.filter((t: Task) => t.id !== taskId);
      this.saveTasks(updated);
      return updated;
    });
  }

  // Due date helpers
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

  private loadTasks(): Task[] {
    const stored = this.isBrowser ? localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) return [];

    const tasks = JSON.parse(stored) as Task[];
    // Migrate old tasks to ensure all fields exist with defaults
    return tasks.map((task, index) => ({
      ...task,
      description: task.description || '',
      priority: task.priority || 'medium',
      order: task.order ?? index + 1, // Assign order if missing
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
