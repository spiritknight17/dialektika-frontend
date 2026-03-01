import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/header/header.component';
import { MainLabelComponent } from '../../shared/components/main-label/main-label';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PostModalComponent } from '../../shared/components/post-modal/post-modal';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// Frontend Interfaces
interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  postDate: Date;
  completionDate?: Date;
  deadlineDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: TaskStatus;
}

export type TaskStatus = 'todo' | 'in progress' | 'to review' | 'on hold' | 'completed' | 'bin';

// Backend Interface
interface TaskDto {
  id: number;
  title: string;
  description: string | null;
  postDate: string; // ISO string from backend
  completionDate: string; // ISO string
  deadlineDate: string; // ISO string
  priority: 'low' | 'medium' | 'high';
  status: string; // we'll normalize later
}

@Component({
  selector: 'app-dialektika-board',
  imports: [
    HeaderComponent,
    MainLabelComponent,
    CommonModule,
    CommonModule,
    FormsModule,
    DragDropModule,
    PostModalComponent,
  ],
  templateUrl: './dialektika-board.html',
  styleUrl: './dialektika-board.css',
})
export class DialektikaBoard implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private readonly DEBUG_BYPASS = true;

  accessToken = localStorage.getItem('access_token');
  //accessToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJEZXJ2ZW4iLCJleHAiOjE3NzEyNTg5NzcsInR5cGUiOiJhY2Nlc3MifQ.7QmtC__GvuHKHPA8NhIAmk0UCZJzn6rMY3iHA9cdua8';

  tasks: Task[] = [];

  columns: Column[] = [
    { id: 'todo', title: 'To Do', color: '#E9A015', tasks: [] },
    { id: 'in progress', title: 'In Progress', color: '#9A0000', tasks: [] },
    { id: 'to review', title: 'Review', color: '#5F0707', tasks: [] },
    { id: 'on hold', title: 'On Hold', color: '#BC9595', tasks: [] },
    { id: 'completed', title: 'Completed', color: '#26B524', tasks: [] },
    //{ id: 'bin', title: 'Bin', color: '#000000', tasks: [] },
  ];

  // Action Buttons
  handleAction(actionId: string) {
    switch (actionId) {
      case 'add-task':
        this.openAddTaskModal();
        break;
    }
  }

  // Kanban Board Data Frontend

  // Kanban Board Backend (DTO)

  private mapToTask(dto: TaskDto): Task {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description ?? undefined,
      postDate: new Date(dto.postDate),
      completionDate: dto.completionDate ? new Date(dto.completionDate) : undefined,
      deadlineDate: dto.deadlineDate ? new Date(dto.deadlineDate) : undefined,
      priority: dto.priority as 'low' | 'medium' | 'high',
      status: this.normalizeStatus(dto.status),
    };
  }

  private normalizeStatus(status: string): TaskStatus {
    switch (status.toLowerCase()) {
      case 'to do':
        return 'todo';
      case 'in progress':
        return 'in progress';
      case 'to review':
        return 'to review';
      case 'on hold':
        return 'on hold';
      case 'completed':
        return 'completed';
      default:
        return 'todo';
    }
  }

  /* Modal */

  // Template
  newTask: Partial<Task> = {
    title: '',
    description: '',
    deadlineDate: new Date('2001-01-01'),
  };

  // Modal Logic
  activeModal = false;
  modalMode: 'add' | 'view' | 'edit' = 'add';
  selectedTask: Task | null = null;

  // Open modal
  openAddTaskModal() {
    this.modalMode = 'add';
    this.selectedTask = null;
    this.activeModal = true;
  }

  openViewTask(task: Task) {
    this.modalMode = 'view';
    this.selectedTask = task;
    this.activeModal = true;
  }

  openEditTask() {
    this.modalMode = 'edit';
  }

  closeModal() {
    this.activeModal = false;
    this.selectedTask = null;
  }

  // Submit new task
  saveTask(taskData: Task) {
    // Build query string properly
    const params = new URLSearchParams({
      title: taskData.title,
      description: taskData.description ?? '',
      priority: taskData.priority,
      status: taskData.status,
      postDate: taskData.postDate.toISOString().split('T')[0], // only date
      deadline: taskData.deadlineDate?.toISOString().split('T')[0] ?? '',
    });

    console.log('Query string:', params.toString());
    console.log('modal mode:', this.modalMode);

    if (this.modalMode === 'add') {
      if (this.DEBUG_BYPASS) {
        const newTask: Task = {
          id: Date.now(),
          title: taskData.title,
          description: taskData.description ?? undefined,
          postDate: taskData.postDate,
          completionDate: taskData.completionDate,
          deadlineDate: taskData.deadlineDate,
          priority: taskData.priority,
          status: taskData.status,
        };
        this.tasks = [...this.tasks, newTask];
        this.columns = this.columns.map((col) => ({
          ...col,
          tasks: this.tasks.filter((t) => t.status === col.id),
        }));
        this.closeModal();
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
        this.toastr.success('Task added (debug, no backend)');
      } else {
        this.http
          .post<TaskDto>(`http://localhost:8000/rest/task/createTask?${params.toString()}`, null, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
          })
          .subscribe((created) => {
            const newTask = this.mapToTask(created);
            this.tasks = [...this.tasks, newTask];
            this.columns = this.columns.map((col) => ({
              ...col,
              tasks: this.tasks.filter((t) => t.status === col.id),
            }));
            this.closeModal();
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 0);
            this.toastr.success('Task added successfully!');
          });
      }
    } else if (this.modalMode === 'edit') {
      if (this.DEBUG_BYPASS) {
        const updatedTask = { ...taskData };
        this.tasks = this.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
        this.columns = this.columns.map((col) => ({
          ...col,
          tasks: this.tasks.filter((t) => t.status === col.id).map((t) => ({ ...t })),
        }));
        this.closeModal();
        setTimeout(() => {
          this.cdr.detectChanges();
          this.toastr.success(`Task "${updatedTask.title}" updated (debug)`, '', {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          });
        }, 0);
      } else {
        this.updateTaskBackend(taskData);
      }
    }
  }

  // For drag and drop logic
  connectedDropLists: string[] = [];

  /* Helper functions */
  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      // Same column, just reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Task moved to a new column
      const movedTask = event.previousContainer.data[event.previousIndex];

      // Create a new task object with updated status
      const updatedTask: Task = { ...movedTask, status: event.container.id as TaskStatus };

      // Update the main tasks array
      this.tasks = this.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));

      // Call backend
    if (!this.DEBUG_BYPASS) {
      this.updateTaskBackend(updatedTask);
    }

      // Rebuild columns with fresh object references
      this.columns = this.columns.map((col) => ({
        ...col,
        tasks: this.tasks.filter((t) => t.status === col.id).map((t) => ({ ...t })),
      }));

      // Force Angular/CDK to detect changes
      this.cdr.detectChanges();
    }

    console.log('Tasks after drag-drop:', this.tasks);
  }

  trackByColumnId(index: number, column: Column) {
    return column.id;
  }

  trackByTaskId(index: number, task: Task) {
    return task.id;
  }

  // For Card
  getDaysRemaining(task: Task): number {
    if (!task.deadlineDate) return 0;
    const posted = new Date(task.postDate).getTime();
    const deadline = new Date(task.deadlineDate).getTime();
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((deadline - posted) / msPerDay);
  }

  // For Task Form
  updateDeadline(dateString: string) {
    this.newTask.deadlineDate = dateString ? new Date(dateString) : undefined;
  }

  // For Toast

  // Update to Backend
  updateTaskBackend(taskData: Task) {
    const params = new URLSearchParams({
      taskID: taskData.id.toString(),
      title: taskData.title,
      description: taskData.description ?? '',
      priority: taskData.priority,
      status: taskData.status,
      postDate: taskData.postDate.toISOString().split('T')[0], // only date if needed
      deadline: taskData.deadlineDate?.toISOString().split('T')[0] ?? '',
    });

    console.log('Updating task with params:', params.toString());

    this.http
      .put<TaskDto>(`http://localhost:8000/rest/task/updateTask?${params.toString()}`, null, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      })
      .subscribe((updated) => {
        const updatedTask = this.mapToTask(updated);

        this.tasks = this.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));

        this.columns = this.columns.map((col) => ({
          ...col,
          tasks: this.tasks.filter((t) => t.status === col.id).map((t) => ({ ...t })),
        }));
        this.closeModal(); // sets activeModal = false

        setTimeout(() => {
          this.cdr.detectChanges(); // update the view so modal disappears

          // Then, show the toast
          this.toastr.success(`Task "${updatedTask.title}" updated successfully!`, '', {
            timeOut: 3000,
            positionClass: 'toast-top-center', // adjust as needed
          });
        }, 0);
      });
    console.log('Sent update request for task:', taskData);
  }

  // On Init
  ngOnInit(): void {
    if (this.DEBUG_BYPASS) {
      this.connectedDropLists = this.columns.map((c) => c.id);
      return;
    }
    if (!this.accessToken) {
      this.router.navigate([''], { queryParams: { returnUrl: '/dialektika-board' } });
      return;
    }
    this.connectedDropLists = this.columns.map((c) => c.id);
    this.http
      .get<TaskDto[]>('http://localhost:8000/rest/task/getTasks', {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      })
      .subscribe((data) => {
        this.tasks = data.map((dto) => this.mapToTask(dto));
        this.columns.forEach((col) => {
          col.tasks = this.tasks.filter((t) => t.status === col.id);
        });
        this.cdr.detectChanges();
      });
  }
}
