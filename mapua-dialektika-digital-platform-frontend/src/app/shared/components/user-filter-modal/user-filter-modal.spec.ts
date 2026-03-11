import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFilterModal } from './user-filter-modal';

describe('UserFilterModal', () => {
  let component: UserFilterModal;
  let fixture: ComponentFixture<UserFilterModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFilterModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserFilterModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
