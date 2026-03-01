import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Task {
  type: string;
  user: string;
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrls: ['./post-card.css'],
})
export class PostCard {
  @Input() title!: string;
  @Input() tasksRemaining!: number;
  @Input() collection!: string;
  @Input() year!: number;
  @Input() borderColor: string = '#007bff';
  @Input() avatars: string[] = [];
  @Input() tasks: Task[] = [];
  @Input() itemTaskId!: string;
  @Output() addTaskClick = new EventEmitter<string>();

  /** Track toggle state */
  isExpanded = false;

  toggleTasks() {
    this.isExpanded = !this.isExpanded;
  }

  addTask() {
    this.addTaskClick.emit(this.itemTaskId);
  }
}
