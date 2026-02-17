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

  // Computed task lists — efficient, only recalculate when tasks signal changes
  todoTasks = computed(() =>
    this.tasks()
      .filter((t) => t.status === 'todo')
      .sort((a, b) => a.order - b.order)
  );
  inprogressTasks = computed(() =>
    this.tasks()
      .filter((t) => t.status === 'inprogress')
      .sort((a, b) => a.order - b.order)
  );
  doneTasks = computed(() =>
    this.tasks()
      .filter((t) => t.status === 'done')
      .sort((a, b) => a.order - b.order)
  );

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
  nextId = signal(this.getNextId());

  // Editing state
  editingTaskId = signal<number | null>(null);
  editingTitle = signal('');
  editingDescription = signal('');
  editingPriority = signal<TaskPriority>('medium');

  addTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    const description = this.newTaskDescription().trim();
    const priority = this.newTaskPriority();

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
          order: maxOrder + 1, // Add to end of todo column
        },
      ];
      this.saveTasks(updated);
      return updated;
    });

    this.nextId.update((id) => id + 1);
    this.newTaskTitle.set('');
    this.newTaskDescription.set('');
    this.newTaskPriority.set('medium');
  }

  // Start editing a task
  startEdit(task: Task) {
    this.editingTaskId.set(task.id);
    this.editingTitle.set(task.title || '');
    this.editingDescription.set(task.description || '');
    this.editingPriority.set(task.priority || 'medium');
    this.showEditTaskModal.set(true);
  }

  // Cancel editing
  cancelEdit() {
    this.editingTaskId.set(null);
    this.editingTitle.set('');
    this.editingDescription.set('');
    this.editingPriority.set('medium');
    this.showEditTaskModal.set(false);
  }

  // Save edited task
  saveEdit(taskId: number) {
    const newTitle = this.editingTitle().trim();
    if (!newTitle) return;

    const newDescription = (this.editingDescription() || '').trim();
    const newPriority = this.editingPriority() || 'medium';

    this.tasks.update((tasks: Task[]) => {
      const updated: Task[] = tasks.map((t: Task) =>
        t.id === taskId
          ? { ...t, title: newTitle, description: newDescription, priority: newPriority }
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
