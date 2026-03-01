import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAccessPageComponent } from './manage-access-page.component';

describe('ManageAccessPageComponent', () => {
  let component: ManageAccessPageComponent;
  let fixture: ComponentFixture<ManageAccessPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAccessPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAccessPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
