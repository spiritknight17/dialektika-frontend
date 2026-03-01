import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

export interface MainLabelAction {
  id: string;
  icon: string;
  tooltip?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-main-label',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule, MatTooltipModule,
    MatButtonModule,
  ],
  templateUrl: './main-label.html',
  styleUrls: ['./main-label.css'],
})
export class MainLabelComponent {
  @Input() icon: string = 'folder'; // default icon
  @Input() label: string = 'Title'; // text

  @Input() actions: MainLabelAction[] = [];
  @Output() actionClick = new EventEmitter<string>();

  onActionClick(actionId: string) {
    this.actionClick.emit(actionId);
  }
}
