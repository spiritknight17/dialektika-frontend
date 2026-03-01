import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { HeaderComponent } from '../../core/header/header.component';
import { ManageAccessPageComponent } from '../../shared/components/manage-access-page.component/manage-access-page.component';
import { MainLabelComponent } from "../../shared/components/main-label/main-label";
import { ManageAccessModel } from '../../shared/components/manage-access-page.component/manage-access-model';
@Component({
  selector: 'app-manage-access-page',
  standalone: true,
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, MainLabelComponent, ManageAccessPageComponent],
  templateUrl: './manage-access-page.html',
  styleUrl: './manage-access-page.css',
})
export class ManageAccessPage {
  searchControl = new FormControl('');
  userList = new ManageAccessModel().userList;
}
