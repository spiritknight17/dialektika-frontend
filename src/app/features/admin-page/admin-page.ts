import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../core/header/header.component';
import { AdminPageComponent } from '../../shared/components/admin-page.component/admin-page.component';
import { MainLabelComponent } from '../../shared/components/main-label/main-label';
import { AdminModel } from '../../shared/components/admin-page.component/admin-model';
import { UserFilterModal } from '../../shared/components/user-filter-modal/user-filter-modal';
import { UserModal, UserDto } from '../../shared/components/user-modal/user-modal';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export interface PostDto {
  id?: number;
  user_id: number;
  title: string;
  description: string;
  attachment: string;
  date_created: Date;
}

export interface PendingAttachment {
  file: File;
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MainLabelComponent,
    AdminPageComponent,
    UserFilterModal,
    UserModal,
  ],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage implements OnInit {
  pendingAttachment: PendingAttachment | null = null;

  searchControl = new FormControl('');
  private allUsersSubject = new BehaviorSubject<UserDto[]>([]);
  private filterSubject = new BehaviorSubject<string>('');
  private cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  returnUrl = '/dialektika-board';

  postForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });

  isFilterModalOpen = false;
  isUserModalOpen = false;
  currentFilter = '';
  selectedUsers: UserDto[] = [];
  userModalMode: 'view' | 'edit' | 'add' = 'add';
  recycleBinMode: boolean = false;
  isPostModalOpen = false;
  postModalMode: 'add' | 'edit' = 'add';
  selectedPost: PostDto | null = null;

  http = inject(HttpClient);
  toastr = inject(ToastrService);
  authService = inject(AuthService);

  filteredUsers$ = combineLatest([
    this.allUsersSubject.asObservable(),
    this.searchControl.valueChanges.pipe(startWith('')),
    this.filterSubject.asObservable(),
  ]).pipe(
    map(([users, searchTerm, filter]) => {
      const q = (searchTerm ?? '').toString().trim().toLowerCase();
      let result = users;

      if (q) {
        result = users.filter(
          (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
        );
      }

      if (!filter) return result;

      return [...result].sort((a, b) => {
        switch (filter) {
          case 'username-ascending':
            return a.username.localeCompare(b.username);
          case 'username-descending':
            return b.username.localeCompare(a.username);
          case 'email-ascending':
            return a.email.localeCompare(b.email);
          case 'email-descending':
            return b.email.localeCompare(a.email);
          case 'id-lowest':
            return (a.id ?? 0) - (b.id ?? 0);
          case 'id-highest':
            return (b.id ?? 0) - (a.id ?? 0);
          case 'role-hierarchy':
            return this.getRolePriority(a.role) - this.getRolePriority(b.role);
          default:
            return 0;
        }
      });
    }),
  );

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.recycleBinMode = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
    this.http
      .get<any[]>(`${environment.apiUrl}/rest/loadusers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      .subscribe({
        next: (rows) => {
          const active = (rows || []).filter((u) => {
            const deleted = String(u.is_deleted).toLowerCase();
            return deleted === 'false' || deleted === '0' || !u.is_deleted;
          });
          this.allUsersSubject.next(
            active.map((u) => ({
              id: u.id,
              firstname: u.firstname,
              lastname: u.lastname,
              username: u.username,
              email: u.email,
              role: u.role,
            })),
          );
        },
        error: (err) => console.error('Failed to load users', err),
      });
  }

  onSearch() {
    this.searchControl.setValue(this.searchControl.value);
  }

  openFilterModal() {
    this.isFilterModalOpen = true;
  }
  closeFilterModal() {
    this.isFilterModalOpen = false;
  }

  saveFilter(filter: string) {
    this.currentFilter = filter;
    this.filterSubject.next(filter);
    this.isFilterModalOpen = false;
  }

  openAddModal() {
    this.selectedUsers = [];
    this.userModalMode = 'add';
    this.isUserModalOpen = true;
  }

  openUserModal(mode: 'add' | 'view' | 'edit' = 'add') {
    if ((mode === 'view' || mode === 'edit') && this.selectedUsers.length !== 1) {
      return;
    }
    this.userModalMode = mode;
    this.isUserModalOpen = true;
  }

  closeUserModal() {
    this.isUserModalOpen = false;
  }

  onUserSelectionChange(users: UserDto[]) {
    this.selectedUsers = users;
  }

  backToManageUsers() {
    this.selectedUsers = [];
    this.loadUsers();
  }

  handleUserSave(user: UserDto) {
    if (this.userModalMode === 'add') {
      this.addUser(user);
    } else {
      this.editUser(user);
    }
  }

  addUser(user: UserDto) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
    const params = new URLSearchParams({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      username: user.username,
      password: user.hash || '',
    });

    this.http
      .post<any>(`${environment.apiUrl}/rest/adduser?${params.toString()}`, null, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      .subscribe({
        next: () => {
          this.toastr.success('User added successfully');
          this.isUserModalOpen = false;
          this.loadUsers();
        },
        error: (err: any) => this.toastr.error(err.error?.detail || 'Failed to add user'),
      });
  }

  addPost() {
    if (this.postForm.invalid) {
      this.toastr.warning('Please fill in all required fields.');
      return;
    }

    const token = localStorage.getItem('access_token') || '';
    const formData = new FormData();

    formData.append('title', this.postForm.get('title')?.value || '');
    formData.append('description', this.postForm.get('description')?.value || '');

    if (this.pendingAttachment) {
      formData.append('file', this.pendingAttachment.file);
    }

    this.http
      .post(`${environment.apiUrl}/rest/posts`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      .subscribe({
        next: () => {
          this.toastr.success('Post created successfully!');
          this.resetPostForm();
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err) => {
          this.toastr.error(err.error?.detail || 'Failed to create post');
        },
      });
  }

  removeAttachment() {
    this.pendingAttachment = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.pendingAttachment = { file: input.files[0] }; // only first file
    }

    input.value = '';
    this.cdr.detectChanges();
  }

  getAttachmentIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (imageExtensions.includes(ext!)) return 'image';
    if (ext === 'pdf') return 'picture_as_pdf';
    return 'insert_drive_file';
  }

  resetPostForm() {
    this.postForm.reset();
    this.pendingAttachment = null;
  }

  editUser(user: UserDto) {
    if (this.selectedUsers.length !== 1) return;
    const selectedUser = this.selectedUsers[0];
    if (!selectedUser.id) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
    const params = new URLSearchParams({
      user_id: selectedUser.id.toString(),
    });

    if (user.firstname !== selectedUser.firstname) params.append('firstname', user.firstname);
    if (user.lastname !== selectedUser.lastname) params.append('lastname', user.lastname);
    if (user.email !== selectedUser.email) params.append('email', user.email);
    if (user.username !== selectedUser.username) params.append('username', user.username);
    if (user.role !== selectedUser.role) params.append('role', user.role);
    if (user.hash) params.append('password', user.hash);

    this.http
      .put<any>(`${environment.apiUrl}/rest/edituser?${params.toString()}`, null, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      .subscribe({
        next: () => {
          this.toastr.success('User updated successfully');
          this.isUserModalOpen = false;
          this.loadUsers();
          this.selectedUsers = [];
        },
        error: (err) => {
          console.error('Failed to update user', err);
          this.toastr.error(err.error?.detail || 'Failed to update user');
        },
      });
  }

  HardDeleteUser() {
    if (this.selectedUsers.length !== 1) return;
    const selectedUser = this.selectedUsers[0];
    const proceed =
      typeof window !== 'undefined'
        ? window.confirm(
            `Permanently delete ${selectedUser.username}? This action cannot be undone.`,
          )
        : true;
    if (!proceed) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
    const params = new URLSearchParams({ user_id: selectedUser.id!.toString() });

    this.http
      .delete<any>(`${environment.apiUrl}/rest/deleteuser?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      .subscribe({
        next: () => {
          this.toastr.success(`User ${selectedUser.username} permanently deleted`);
          this.selectedUsers = [];
          this.loadUsers();
        },
        error: (err) => this.toastr.error(err.error?.detail || 'Failed to permanently delete user'),
      });
  }

  private getRolePriority(role: string): number {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return 1;
    if (r === 'user') return 2;
    return 3;
  }
  openEditPostModal(post: PostDto) {
    this.postModalMode = 'edit';
    this.selectedPost = post;
    this.pendingAttachment = null;

    this.postForm.patchValue({
      title: post.title,
      description: post.description,
    });

    this.isPostModalOpen = true;
  }
  onSavePost() {
    if (this.postModalMode === 'add') {
      this.addPost();
    } else {
      this.updatePost();
    }
  }
  updatePost() {
    if (!this.selectedPost?.id) {
      this.toastr.error('No post selected');
      return;
    }

    const token = localStorage.getItem('access_token') || '';

    const title = this.postForm.get('title')?.value || '';
    const description = this.postForm.get('description')?.value || '';

    const params = new URLSearchParams();

    if (title) params.append('title', title);
    if (description) params.append('description', description);

    const formData = new FormData();

    if (this.pendingAttachment) {
      formData.append('file', this.pendingAttachment.file);
    }

    this.http
      .put(
        `${environment.apiUrl}/rest/posts/${this.selectedPost.id}?${params.toString()}`,
        formData,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      )
      .subscribe({
        next: () => {
          this.toastr.success('Post updated successfully');
          this.closePostModal();
          this.router.navigateByUrl(this.returnUrl); // refresh board
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err.error?.detail || 'Failed to update post');
        },
      });
  }
  deletePost(postId: number) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    const token = localStorage.getItem('access_token') || '';
    this.http
      .delete(`${environment.apiUrl}/rest/posts/${postId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      .subscribe({
        next: () => {
          this.toastr.info('Post deleted');
        },
        error: (err) => this.toastr.error('Failed to delete post'),
      });
  }
  closePostModal() {
    this.isPostModalOpen = false;
    this.resetPostForm();
    this.selectedPost = null;
  }
}
