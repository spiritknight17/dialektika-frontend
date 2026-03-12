import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-filter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-filter-modal.html',
  styleUrl: './user-filter-modal.css',
})
export class UserFilterModal {
  @Input() mode: 'view' | 'edit' = 'edit';
  @Input() selectedFilter: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();
  tempFilter: string = '';
  ngOnInit(){
    this.tempFilter = this.selectedFilter;
  }
  onClose() {
    this.close.emit();
  }
  onSave() {
    this.save.emit(this.tempFilter);
  }
}
