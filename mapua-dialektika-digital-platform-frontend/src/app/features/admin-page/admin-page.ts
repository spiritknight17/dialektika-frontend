import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { HeaderComponent } from '../../core/header/header.component';
import { AdminComponent } from '../../shared/components/admin-page.component/admin-page.component';
import { MainLabelComponent } from "../../shared/components/main-label/main-label";
import { AdminModel } from '../../shared/components/admin-page.component/admin-model';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, MainLabelComponent, AdminComponent],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage {
  searchControl = new FormControl('');
  userList = new AdminModel().userList;
  imageUrl: string | null = null;
  private cdr = inject(ChangeDetectorRef);
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          this.imageUrl = result;
          this.cdr.detectChanges();
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
