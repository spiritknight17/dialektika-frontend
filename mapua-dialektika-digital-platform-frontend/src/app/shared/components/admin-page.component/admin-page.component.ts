import { Component, Input } from '@angular/core';
import { NgFor, CommonModule } from "@angular/common";
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
}
@Component({
  selector: 'app-manage-access-users',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css',
})
export class AdminComponent {
  @Input() users: User[] = [];
  trackById(_: number, user: User){
    return user.id;
  }
}
