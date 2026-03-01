// task-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../../features/dialektika-board/dialektika-board';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-modal',
  templateUrl: './post-modal.html',
  styleUrls: ['./post-modal.css'],
  imports: [CommonModule, FormsModule],
})
export class PostModalComponent {
  /** Mode: 'add' | 'view' | 'update' */
  @Input() mode: 'add' | 'view' | 'edit' = 'add';

  /** The task being viewed or edited */
  @Input() task: Task | null = null;

  /** Emits the updated task on save */
  @Output() save = new EventEmitter<Task>();

  /** Close modal signal */
  @Output() close = new EventEmitter<void>();

  @Output() modeChange = new EventEmitter<'add' | 'view' | 'edit'>();

  originalTask: Task | null = null;

  /** Local copy for editing */
  editableTask: Task = {
    id: 0,
    title: '',
    description: '',
    postDate: new Date(),
    priority: 'low',
    status: 'todo',
  };

  /* Admin View */
  showAddAttachment = false;

  /** Hardcoded assignee for modal only */
  selectedAssignee: 'admin' | 'employee' | 'student' = 'admin';

  /* Comments */
  comments: { author: 'admin' | 'employee' | 'me'; message: string }[] = [];

  /** Text in the comment input */
  newCommentText = '';

  ngOnChanges() {
    if (this.task) {
      this.editableTask = { ...this.task };
      this.originalTask = { ...this.task };

      // Hardcoded comments for now:
      this.comments = [
        { author: 'admin', message: 'Admin comment for task.' },
        { author: 'employee', message: 'Employee comment for task.' },
      ];

      // Admin View
      this.selectedAssignee = 'admin'; // default
    } else if (this.mode === 'add') {
      this.editableTask = {
        id: 0,
        title: '',
        description: '',
        postDate: new Date(),
        priority: 'low',
        status: 'todo',
      };

      this.originalTask = null;
      this.comments = [];
      this.selectedAssignee = 'admin'; // default
    }
  }

  onSave() {
    this.save.emit(this.editableTask);
    console.log('Emitted task:', this.editableTask);
  }

  isClosing = false; // track closing animation

  onClose() {
    if (this.mode === 'edit' && this.originalTask) {
      const hasChanges =
        this.originalTask.title !== this.editableTask.title ||
        this.originalTask.description !== this.editableTask.description ||
        this.originalTask.priority !== this.editableTask.priority ||
        this.originalTask.status !== this.editableTask.status ||
        this.compareDates(this.originalTask.deadlineDate, this.editableTask.deadlineDate) === false;

      if (hasChanges) {
        const confirmClose = confirm('You have unsaved changes. Discard them?');

        if (!confirmClose) return;
      }
    }

    // Trigger closing animation
    this.isClosing = true;

    // Delay removal until animation finishes (match your CSS duration)
    setTimeout(() => {
      this.close.emit(); // emit to parent to set activeModal = false
      this.isClosing = false; // reset
    }, 300); // 300ms matches modal-drop-fade duration
  }

  private compareDates(date1?: Date, date2?: Date): boolean {
    if (!date1 && !date2) return true;
    if (!date1 || !date2) return false;
    return date1.getTime() === date2.getTime();
  }

  onDeadlineChange(value: string) {
    this.editableTask.deadlineDate = value ? new Date(value) : undefined;
  }

  /* Comments */
  addComment() {
    if (!this.newCommentText.trim()) return;

    this.comments.push({
      author: 'me', // your own user
      message: this.newCommentText.trim(),
    });

    this.newCommentText = '';
    setTimeout(() => {
      const panel = document.querySelector('.comments-panel');
      if (panel) panel.scrollTop = panel.scrollHeight; // auto-scroll to bottom
    });
  }

  /** Handle Enter key in input */
  handleCommentKey(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.addComment();
    }
  }
}
