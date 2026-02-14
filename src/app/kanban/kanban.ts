import { Component, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

const STORAGE_KEY = 'kanban_tasks';
type TaskStatus = 'todo' | 'inprogress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high'

interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
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

  //drag task funtion

  draggedTaskId = signal<number | null>(null);
  dragOverColumn = signal<TaskStatus | null>(null);

  onDragStart(event: DragEvent, taskId: number) {
    this.draggedTaskId.set(taskId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', taskId.toString());
    }
  }

  //drag end

  onDragEnd() {
    this.draggedTaskId.set(null);
    this.dragOverColumn.set(null);
  }

  //ondrag funtion

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

  //ondrop funtion
  onDrop(event: DragEvent, newStatus: TaskStatus) {
    event.preventDefault();
    const taskId = this.draggedTaskId();
    if (taskId == null) return;

    this.tasks.update((tasks: Task[]) => {
      const updated: Task[] = tasks.map((t: Task) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      this.saveTasks(updated);
      return updated;
    });
    this.draggedTaskId.set(null);
    this.dragOverColumn.set(null);
  }

  //popup signals
  showAddTaskModal = signal(false);
  showEditTaskModal = signal(false);

  // tasks = signal([
  //   {id:1, title: 'Design UI', status: 'todo'},
  //   {id:2,title:'Create API', status:'inprogress'},
  //   {id:3,title:'Fix Bugs', status:'done'},
  //   {id:4,title:'Write Tests',status:'todo'},
  // ]);

  newTaskTitle = signal('');
  newTaskDescription = signal('');
  nextId = signal(this.getNextId());
  showPulse = signal(false);

  // Editing state
  editingTaskId = signal<number | null>(null);
  editingTitle = signal('');
  editingDescription = signal('');

  addTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    const description = this.newTaskDescription().trim();

    this.tasks.update((tasks) => {
      const updated: Task[] = [
        ...tasks,
        {
          id: this.nextId(),
          title,
          description,
          status: 'todo',
        },
      ];
      this.saveTasks(updated);
      return updated;
    });

    this.nextId.update((id) => id + 1);
    this.newTaskTitle.set('');
    this.newTaskDescription.set('');

    this.showPulse.set(true);
    setTimeout(() => this.showPulse.set(false), 600);
  }

  getTaskByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter((task) => task.status === status);
  }

  // Start editing a task
  startEdit(task: Task) {
    this.editingTaskId.set(task.id);
    this.editingTitle.set(task.title);
    this.editingDescription.set(task.description);
    this.showEditTaskModal.set(true);
  }

  // Cancel editing
  cancelEdit() {
    this.editingTaskId.set(null);
    this.editingTitle.set('');
    this.editingDescription.set('');
    this.showEditTaskModal.set(false);
  }

  // Save edited task
  saveEdit(taskId: number) {
    const newTitle = this.editingTitle().trim();
    if (!newTitle) return;

    const newDescription = this.editingDescription().trim();

    this.tasks.update((tasks: Task[]) => {
      const updated: Task[] = tasks.map((t: Task) =>
        t.id === taskId ? { ...t, title: newTitle, description: newDescription } : t
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

  // moveTask(task: Task) {
  //   this.tasks.update((tasks: Task[]) => {
  //     const updated: Task[] = tasks.map((t) =>
  //       t.id === task.id
  //         ? {
  //             ...t,
  //             status:
  //               t.status === 'todo' ? 'inprogress' : t.status === 'inprogress' ? 'done' : 'done',
  //           }
  //         : t
  //     );

  //     this.saveTasks(updated);
  //     return updated;
  //   });
  // }

  private loadTasks(): Task[] {
    const stored = this.isBrowser ? localStorage.getItem(STORAGE_KEY) : null;
    return stored ? (JSON.parse(stored) as Task[]) : [];
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
