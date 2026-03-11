import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
export interface UserDto {
  id?: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  role: string;
  hash?: string;
}
@Component({
  selector: 'app-user-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.css',
})
export class UserModal {
  @Input() mode: 'view' | 'edit' | 'add' = 'add';
  @Input() user: UserDto | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<UserDto>();
  @Output() modeChange = new EventEmitter<'view' | 'edit' | 'add'>();

  editableUser: UserDto = {
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    role: 'user',
    hash: ''
  };

  ngOnInit() {
    if (this.user) {
      this.editableUser = { ...this.user, hash: '' };
    }
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.save.emit(this.editableUser);
  }
}
