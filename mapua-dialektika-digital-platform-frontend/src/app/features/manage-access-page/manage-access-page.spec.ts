import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAccessPage } from './manage-access-page';

describe('ManageAccessPage', () => {
  let component: ManageAccessPage;
  let fixture: ComponentFixture<ManageAccessPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAccessPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAccessPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
