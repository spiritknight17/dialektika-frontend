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
import { HttpClient, HttpHeaders, provideHttpClient } from '@angular/common/http';
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
  imports: [HeaderComponent, CommonModule, FormsModule],
  templateUrl: './dialektika-board.html',
  styleUrl: './dialektika-board.css',
})
export class DialektikaBoard implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private readonly DEBUG_BYPASS = true;

  editingCommentId: number | null = null;
  editCommentText: string = '';

  posts: any[] = [];
  comments: { [key: number]: any[] } = {};
  newComment: { [key: number]: string } = {};

  rows = 20;
  offset = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    const url = `http://localhost:8000/rest/getposts?rows=${this.rows}&offset=${this.offset}`;

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        this.posts = [...res]; // new reference like the Kanban project
        this.cdr.detectChanges();

        this.posts.forEach((post) => {
          this.loadComments(post.id);
        });
      },
      error: (err) => {
        console.error('Failed to load posts', err);
      },
    });
  }

  loadComments(postId: number) {
    const url = `http://localhost:8000/rest/posts/${postId}/comments`;

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        this.comments = {
          ...this.comments,
          [postId]: res,
        };

        this.cdr.detectChanges(); // same fix used in Kanban board
      },
      error: (err) => {
        console.error('Failed to load comments', err);
      },
    });
  }

  addComment(postId: number) {
    const comment = this.newComment[postId];

    if (!comment || comment.trim() === '') return;

    const url = `http://localhost:8000/rest/postcomment?post_id=${postId}&comment=${encodeURIComponent(comment)}`;

    this.http.post(url, {}).subscribe({
      next: () => {
        this.newComment[postId] = '';
        this.loadComments(postId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to post comment', err);
      },
    });
  }

  startEdit(comment: any) {
    this.editingCommentId = comment.id;
    this.editCommentText = comment.comment;
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.editCommentText = '';
  }

  updateComment(commentId: number, postId: number) {
    const url = `http://localhost:8000/rest/editcomment?post_id=${commentId}&comment=${encodeURIComponent(this.editCommentText)}`;

    this.http.put(url, {}).subscribe({
      next: () => {
        this.editingCommentId = null;
        this.editCommentText = '';

        this.loadComments(postId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update comment', err);
      },
    });
  }

  deleteComment(commentId: number, postId: number) {
    const url = `http://localhost:8000/rest/deletecomment?comment_id=${commentId}`;

    this.http.delete(url).subscribe({
      next: () => {
        this.loadComments(postId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete comment', err);
      },
    });
  }

  trackPost(index: number, post: any) {
    return post.id;
  }

  isImage(url: string): boolean {
    if (!url) return false;

    const ext = url.split('.').pop()?.toLowerCase();

    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  }

  getFileName(url: string): string {
    return url.split('/').pop() || 'Attachment';
  }
}
