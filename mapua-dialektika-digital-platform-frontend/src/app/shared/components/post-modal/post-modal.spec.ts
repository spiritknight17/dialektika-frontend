import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskModal } from './post-modal';

describe('TaskModal', () => {
  let component: TaskModal;
  let fixture: ComponentFixture<TaskModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
