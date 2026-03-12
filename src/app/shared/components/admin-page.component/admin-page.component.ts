import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, CommonModule, NgIf } from '@angular/common';
import { UserDto } from '../user-modal/user-modal';

@Component({
  selector: 'app-admin-access-users',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css',
})
export class AdminPageComponent {
  @Input() users: UserDto[] = [];
  @Input() query: string = '';
  @Output() selectionChange = new EventEmitter<UserDto[]>();

  selectedUserIds: Set<number> = new Set();

  trackById(_: number, user: UserDto) { return user.id ?? 0; }

  onCheckboxChange(user: UserDto, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const userId = user.id ?? 0;
    
    if (checked) {
      this.selectedUserIds.clear();
      this.selectedUserIds.add(userId);
    } else {
      this.selectedUserIds.delete(userId);
    }
    const selectedUsers = this.users.filter(u => this.selectedUserIds.has(u.id ?? 0));
    this.selectionChange.emit(selectedUsers);
  }
  
  isSelected(user: UserDto): boolean {
    return this.selectedUserIds.has(user.id ?? 0);
  }
}
