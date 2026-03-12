import { ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

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
  private authService = inject(AuthService);

  editingCommentId: number | null = null;
  editCommentText: string = '';

  posts: any[] = [];
  comments: { [key: number]: any[] } = {};
  newComment: { [key: number]: string } = {};

  rows = 20;
  offset = 0;

  loadingMore = false;
  refreshing = false;
  allPostsLoaded = false;

  editingPostId: number | null = null;
  editPostTitle: string = '';
  editPostDescription: string = '';

  pendingAttachment: File | null = null;
  currentAttachment: string | null = null;
  attachmentRemoved = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    if (this.allPostsLoaded) return; // Stop if all posts are loaded
    const url = `${environment.apiUrl}/rest/getposts?rows=${this.rows}&offset=${this.offset}`;
    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        if (res.length === 0) {
          this.allPostsLoaded = true;
        } else if (this.offset === 0) {
          // No more posts
          this.posts = [...res]; // reset feed if refreshing
        } else {
          this.posts = [...this.posts, ...res]; // append for infinite scroll
        }

        res.forEach((post) => this.loadComments(post.id));
        this.loadingMore = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 404) {
          // If backend returns 404 for no more posts
          this.allPostsLoaded = true;
        }
        console.error('Failed to load posts', err);
        this.loadingMore = false;
        this.refreshing = false;
      },
    });
  }

  loadComments(postId: number) {
    const url = `${environment.apiUrl}/rest/posts/${postId}/comments`;
    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        // Attach username and comment text
        this.comments = { ...this.comments, [postId]: res };
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load comments', err),
    });
  }

  addComment(postId: number) {
    const comment = this.newComment[postId];
    if (!comment?.trim()) return;

    const url = `${environment.apiUrl}/rest/postcomment?post_id=${postId}&comment=${encodeURIComponent(comment)}`;
    this.http.post(url, {}).subscribe({
      next: () => {
        this.newComment[postId] = '';
        this.loadComments(postId);
      },
      error: (err) => console.error('Failed to post comment', err),
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
    const url = `${environment.apiUrl}/rest/editcomment?post_id=${commentId}&comment=${encodeURIComponent(this.editCommentText)}`;
    this.http.put(url, {}).subscribe({
      next: () => {
        this.editingCommentId = null;
        this.editCommentText = '';
        this.loadComments(postId);
      },
      error: (err) => console.error('Failed to update comment', err),
    });
  }

  deleteComment(commentId: number, postId: number) {
    // Optimistically remove comment from local array
    if (this.comments[postId]) {
      this.comments[postId] = this.comments[postId].filter((c) => c.id !== commentId);
    }

    // Call API to delete
    const url = `${environment.apiUrl}/rest/deletecomment?comment_id=${commentId}`;
    this.http.delete(url).subscribe({
      next: () => {
        // Ensure we trigger change detection
        this.toastr.success('Comment deleted successfully');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete comment', err);
        // Optional: reload comments on error
        this.loadComments(postId);
      },
    });
  }
  trackPost(index: number, post: any) {
    return post.id;
  }

  isImage(url: string): boolean {
    if (!url) return false;
    if (url.startsWith('data:image/')) return true;
    const ext = url.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  }

  getFileName(url: string): string {
    return url?.split('/').pop() || 'Attachment';
  }

  /** ---------- SCROLL INFINITE ---------- */
  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.allPostsLoaded || this.loadingMore) return; // <-- early exit

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 120) {
      this.loadingMore = true;
      this.offset += this.rows;
      this.loadPosts();
    }
  }

  /** ---------- REFRESH BUTTON ---------- */
  refreshFeed() {
    this.allPostsLoaded = false;
    this.offset = 0;
    this.posts = [];
    this.comments = {};
    this.refreshing = true;
    this.loadPosts();
    setTimeout(() => (this.refreshing = false), 800);
  }

  startEditPost(post: any) {
    if (!this.isAdmin) return;

    this.editingPostId = post.id;
    this.editPostTitle = post.title;
    this.editPostDescription = post.description;

    this.currentAttachment = post.attachment || null;
    this.pendingAttachment = null;
    this.attachmentRemoved = false;
  }
  cancelEditPost() {
    this.editingPostId = null;
    this.editPostTitle = '';
    this.editPostDescription = '';

    this.pendingAttachment = null;
    this.currentAttachment = null;
    this.attachmentRemoved = false;
  }

  removePendingAttachment() {
    this.pendingAttachment = null;
  }

  removeAttachment() {
    this.currentAttachment = null;
    this.attachmentRemoved = true;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    this.pendingAttachment = input.files[0];
  }

  saveEditPost(postId: number) {
    if (!this.isAdmin) return;

    const formData = new FormData();

    if (this.pendingAttachment) {
      formData.append('file', this.pendingAttachment);
    }

    const url = `${environment.apiUrl}/rest/posts/${postId}?title=${encodeURIComponent(this.editPostTitle)}&description=${encodeURIComponent(this.editPostDescription)}`;

    this.http.put(url, formData).subscribe({
      next: (updatedPost: any) => {
        const index = this.posts.findIndex((p) => p.id === postId);

        if (index !== -1) {
          const updatedPosts = [...this.posts];
          updatedPosts[index] = updatedPost;
          this.posts = updatedPosts;
        }

        this.editingPostId = null;
        this.pendingAttachment = null;
        this.currentAttachment = null;
        this.attachmentRemoved = false;

        this.toastr.success('Post updated successfully');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to update post');
      },
    });
  }

  deletePost(postId: number) {
    if (!this.isAdmin) return;
    const url = `${environment.apiUrl}/rest/posts/${postId}`;

    // Optimistically remove post from UI
    this.posts = this.posts.filter((post) => post.id !== postId);

    this.http.delete(url).subscribe({
      next: () => {
        this.toastr.success('Post deleted successfully');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete post', err);
        this.toastr.error('Failed to delete post');

        // Reload posts if something went wrong
        this.refreshFeed();
      },
    });
  }

  confirmDelete(postId: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.deletePost(postId);
    }
  }

  get isAdmin(): boolean {
    return this.authService.currentUser?.role === 'admin';
  }
}
