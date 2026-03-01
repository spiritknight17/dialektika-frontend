import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordResetSuccessful } from './password-reset-successful';

describe('PasswordResetSuccessful', () => {
  let component: PasswordResetSuccessful;
  let fixture: ComponentFixture<PasswordResetSuccessful>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordResetSuccessful]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordResetSuccessful);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
