import { Component, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../auth/auth.service';

const STORAGE_KEY = 'kanban_tasks';
const COLUMNS_KEY = 'kanban_columns';
type TaskPriority = 'low' | 'medium' | 'high';

// Column gradient presets (shared with kanban)
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
  colorIndex: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: TaskPriority;
  order: number;
  dueDate: string | null;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate(
          '350ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px) scale(0.97)' }),
        animate(
          '400ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        ),
      ]),
    ]),
  ],
})
export class Analytics {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  // ── Data (read from shared localStorage) ──
  columns = signal<Column[]>(this.loadColumns());
  tasks = signal<Task[]>(this.loadTasks());

  // ── Navigation ──
  goBack() {
    this.router.navigate(['/board']);
  }

  // ── Column Color Helper ──
  getColumnColor(colorIndex: number) {
    return COLUMN_COLORS[colorIndex % COLUMN_COLORS.length];
  }

  // ── Avatar Helpers ──
  getInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('');
  }

  getAvatarColor(username: string): string {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
      '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++)
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  // ── Due Date Helpers ──
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

  getColumnTasks(columnId: string): Task[] {
    return this.tasks().filter((t) => t.status === columnId);
  }

  // ── Computed Stats ──
  totalTasks = computed(() => this.tasks().length);

  columnStats = computed(() => {
    const allTasks = this.tasks();
    const total = allTasks.length;
    const cols = this.columns();
    return cols.map((col, index) => {
      const count = allTasks.filter((t) => t.status === col.id).length;
      return {
        columnId: col.id,
        columnName: col.name,
        count,
        colorIndex: col.colorIndex,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
        isLast: index === cols.length - 1,
      };
    });
  });

  completionPercent = computed(() => {
    const total = this.totalTasks();
    const cols = this.columns();
    if (total === 0 || cols.length <= 1) return 0;

    const allTasks = this.tasks();
    let weightedSum = 0;
    const maxWeight = cols.length - 1;

    for (const task of allTasks) {
      const colIndex = cols.findIndex((c) => c.id === task.status);
      if (colIndex >= 0) {
        weightedSum += colIndex / maxWeight;
      }
    }
    return Math.round((weightedSum / total) * 100);
  });

  completedTasks = computed(() => {
    const cols = this.columns();
    if (cols.length === 0) return 0;
    const lastColId = cols[cols.length - 1].id;
    return this.tasks().filter((t) => t.status === lastColId).length;
  });

  progressSegments = computed(() => {
    const total = this.totalTasks();
    if (total === 0) return [];
    return this.columnStats().filter((s) => s.count > 0);
  });

  /** Priority distribution stats */
  priorityStats = computed(() => {
    const allTasks = this.tasks();
    const total = allTasks.length;
    const high = allTasks.filter((t) => t.priority === 'high').length;
    const medium = allTasks.filter((t) => t.priority === 'medium').length;
    const low = allTasks.filter((t) => t.priority === 'low').length;
    return [
      { label: 'High', count: high, percent: total > 0 ? Math.round((high / total) * 100) : 0, color: '#ef4444' },
      { label: 'Medium', count: medium, percent: total > 0 ? Math.round((medium / total) * 100) : 0, color: '#f59e0b' },
      { label: 'Low', count: low, percent: total > 0 ? Math.round((low / total) * 100) : 0, color: '#10b981' },
    ];
  });

  /** Due date status distribution */
  dueDateStats = computed(() => {
    const allTasks = this.tasks();
    const overdue = allTasks.filter((t) => this.getDueDateStatus(t.dueDate) === 'overdue').length;
    const today = allTasks.filter((t) => this.getDueDateStatus(t.dueDate) === 'today').length;
    const upcoming = allTasks.filter((t) => this.getDueDateStatus(t.dueDate) === 'upcoming').length;
    const none = allTasks.filter((t) => this.getDueDateStatus(t.dueDate) === 'none').length;
    return [
      { label: 'Overdue', count: overdue, color: '#ef4444' },
      { label: 'Due Soon', count: today, color: '#f59e0b' },
      { label: 'On Track', count: upcoming, color: '#10b981' },
      { label: 'No Date', count: none, color: '#64748b' },
    ];
  });

  /**
    Health score: 100 = all on track, 0 = everything overdue.
    On Track = full weight, Due Soon = 60% weight, No Date = 40% weight, Overdue = 0
   */
  healthScore = computed(() => {
    const stats = this.dueDateStats();
    const total = stats.reduce((sum, s) => sum + s.count, 0);
    if (total === 0) return 100;
    const weights: Record<string, number> = { 'On Track': 1, 'Due Soon': 0.6, 'No Date': 0.4, 'Overdue': 0 };
    const weighted = stats.reduce((sum, s) => sum + s.count * (weights[s.label] ?? 0), 0);
    return Math.round((weighted / total) * 100);
  });

  /** Semi-circle gauge arc segments for due date status */
  gaugeSegments = computed(() => {
    const stats = this.dueDateStats();
    const total = stats.reduce((sum, s) => sum + s.count, 0);
    if (total === 0) return [];

    const segments: { path: string; color: string; label: string }[] = [];
    // Semi-circle from 180° to 0° (left to right, bottom arc)
    // Arc center at (100, 110), radius 80
    const cx = 100, cy = 110, r = 80;
    const startAngleDeg = 180; // left
    const totalSweep = 180; // semi-circle
    let currentAngle = startAngleDeg;
    const GAP = 2; // degrees gap

    for (const s of stats) {
      if (s.count === 0) continue;
      const sweepAngle = (s.count / total) * totalSweep;
      const a1 = currentAngle + GAP / 2;
      const a2 = currentAngle + sweepAngle - GAP / 2;
      if (a2 > a1) {
        const a1Rad = (a1 * Math.PI) / 180;
        const a2Rad = (a2 * Math.PI) / 180;
        const x1 = cx + r * Math.cos(a1Rad);
        const y1 = cy + r * Math.sin(a1Rad);
        const x2 = cx + r * Math.cos(a2Rad);
        const y2 = cy + r * Math.sin(a2Rad);
        const largeArc = (a2 - a1) > 180 ? 1 : 0;
        // Note: arcs go clockwise from left to right which means top half
        // SVG coordinate: angle 180° = left, 0° = right, with y going down
        // We need the arc to go from left to right along the top half
        segments.push({
          path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
          color: s.color,
          label: s.label,
        });
      }
      currentAngle += sweepAngle;
    }
    return segments;
  });

  /** Column distribution for donut chart */
  columnDonutStats = computed(() => {
    const allTasks = this.tasks();
    const total = allTasks.length;
    return this.columns().map((col) => {
      const count = allTasks.filter((t) => t.status === col.id).length;
      return {
        label: col.name,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
        color: this.getColumnColor(col.colorIndex).accent,
      };
    });
  });

  /**
   * Task Timeline — Gantt-style schedule view.
   * Shows each task as a bar positioned on a timeline relative to today,
   * grouped by workflow column.  Non-technical users can instantly see
   * which tasks are overdue, due soon, or comfortably on track.
   */
  timelineData = computed(() => {
    const allTasks = this.tasks();
    const cols = this.columns();
    if (allTasks.length === 0 || cols.length === 0) return { groups: [], dayLabels: [], todayOffset: 50 };

    // Timeline window: 14 days back ← today → 21 days ahead  (35-day span)
    const PAST_DAYS = 14;
    const FUTURE_DAYS = 21;
    const TOTAL_DAYS = PAST_DAYS + FUTURE_DAYS;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const dayMs = 86_400_000;
    const windowStart = todayMs - PAST_DAYS * dayMs;
    const windowEnd = todayMs + FUTURE_DAYS * dayMs;

    // Day labels (show a few anchor dates)
    const dayLabels: { label: string; offset: number }[] = [];
    for (let d = -PAST_DAYS; d <= FUTURE_DAYS; d += 7) {
      const date = new Date(todayMs + d * dayMs);
      dayLabels.push({
        label: d === 0 ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        offset: ((d + PAST_DAYS) / TOTAL_DAYS) * 100,
      });
    }

    const todayOffset = (PAST_DAYS / TOTAL_DAYS) * 100;

    const priorityColors: Record<string, string> = {
      high: '#ef4444', medium: '#f59e0b', low: '#10b981',
    };

    const groups = cols.map((col) => {
      const colTasks = allTasks
        .filter((t) => t.status === col.id && t.dueDate)
        .map((t) => {
          const due = new Date(t.dueDate + 'T00:00:00');
          const dueMs = due.getTime();
          const diffDays = Math.round((dueMs - todayMs) / dayMs);
          const dueStatus = this.getDueDateStatus(t.dueDate);

          // Position: clamp within window
          const clampedMs = Math.max(windowStart, Math.min(windowEnd, dueMs));
          const offset = ((clampedMs - windowStart) / (windowEnd - windowStart)) * 100;

          return {
            title: t.title,
            priority: t.priority,
            color: priorityColors[t.priority] ?? '#64748b',
            dueLabel: this.formatDueDate(t.dueDate),
            dueStatus,
            diffDays,
            offset,              // % from left
            clamped: dueMs < windowStart || dueMs > windowEnd,
          };
        })
        .sort((a, b) => a.offset - b.offset);

      // Tasks without a due date
      const noDueTasks = allTasks
        .filter((t) => t.status === col.id && !t.dueDate)
        .map((t) => ({
          title: t.title,
          priority: t.priority,
          color: priorityColors[t.priority] ?? '#64748b',
        }));

      return {
        columnName: col.name,
        accent: this.getColumnColor(col.colorIndex).accent,
        tasks: colTasks,
        noDueTasks,
        totalTasks: allTasks.filter((t) => t.status === col.id).length,
      };
    }).filter((g) => g.totalTasks > 0);

    return { groups, dayLabels, todayOffset };
  });

  /**
   * Attention-required items — context-aware logic:
   * - Last column (e.g. "Delivered"/"Shipped") → fully done, never needs attention
   * - Second-to-last column (e.g. "Done") → work is finished, just a soft
   *   "Ready to ship" nudge if it's been sitting there past its date
   * - All earlier columns → real attention if overdue or due today
   */
  attentionItems = computed(() => {
    const allTasks = this.tasks();
    const cols = this.columns();
    if (cols.length === 0) return [];

    const lastColId = cols[cols.length - 1].id;
    // If there are 2+ columns, the second-to-last is the "done" stage
    const doneColId = cols.length >= 2 ? cols[cols.length - 2].id : null;

    return allTasks
      .filter((t) => {
        // Skip tasks in the final column — they're shipped/delivered
        if (t.status === lastColId) return false;

        const dueStatus = this.getDueDateStatus(t.dueDate);

        if (t.status === doneColId) {
          // "Done" column: only flag if overdue (gentle "ship it" reminder)
          return dueStatus === 'overdue';
        }

        // All other columns: flag overdue or due today
        return dueStatus === 'overdue' || dueStatus === 'today';
      })
      .map((t) => {
        const dueStatus = this.getDueDateStatus(t.dueDate);
        const isDoneCol = t.status === doneColId;

        return {
          title: t.title,
          priority: t.priority,
          status: isDoneCol ? 'ship' as const : dueStatus,
          dueLabel: isDoneCol
            ? 'Ready to ship'
            : this.formatDueDate(t.dueDate),
          columnName: cols.find((c) => c.id === t.status)?.name ?? t.status,
        };
      })
      .sort((a, b) => {
        // Sort: overdue first, then due today, then ship reminders
        const order = { overdue: 0, today: 1, ship: 2, upcoming: 3, none: 4 };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
      });
  });

  // ── Donut Chart Helpers ──
  getDonutPath(
    startAngle: number,
    endAngle: number,
    radius: number = 52,
    cx: number = 60,
    cy: number = 60
  ): string {
    const innerRadius = radius - 14;
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1Outer = cx + radius * Math.cos(startRad);
    const y1Outer = cy + radius * Math.sin(startRad);
    const x2Outer = cx + radius * Math.cos(endRad);
    const y2Outer = cy + radius * Math.sin(endRad);
    const x1Inner = cx + innerRadius * Math.cos(endRad);
    const y1Inner = cy + innerRadius * Math.sin(endRad);
    const x2Inner = cx + innerRadius * Math.cos(startRad);
    const y2Inner = cy + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${x1Outer} ${y1Outer}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
      'Z',
    ].join(' ');
  }

  getDonutSegments(
    stats: { label: string; count: number; percent: number; color: string }[]
  ): { path: string; color: string; label: string; count: number; percent: number }[] {
    const total = stats.reduce((sum, s) => sum + s.count, 0);
    if (total === 0) return [];
    const segments: { path: string; color: string; label: string; count: number; percent: number }[] = [];
    let currentAngle = 0;
    const GAP = 2;

    for (const s of stats) {
      if (s.count === 0) continue;
      const sliceAngle = (s.count / total) * 360;
      const actualStart = currentAngle + GAP / 2;
      const actualEnd = currentAngle + sliceAngle - GAP / 2;
      if (actualEnd > actualStart) {
        segments.push({
          path: this.getDonutPath(actualStart, actualEnd),
          color: s.color,
          label: s.label,
          count: s.count,
          percent: s.percent,
        });
      }
      currentAngle += sliceAngle;
    }
    return segments;
  }

  // ── Persistence (read-only from shared localStorage) ──
  private loadColumns(): Column[] {
    const stored = this.isBrowser ? localStorage.getItem(COLUMNS_KEY) : null;
    if (stored) return JSON.parse(stored) as Column[];
    return [
      { id: 'todo', name: 'To Do', colorIndex: 0 },
      { id: 'inprogress', name: 'In Progress', colorIndex: 1 },
      { id: 'done', name: 'Done', colorIndex: 2 },
    ];
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
}
