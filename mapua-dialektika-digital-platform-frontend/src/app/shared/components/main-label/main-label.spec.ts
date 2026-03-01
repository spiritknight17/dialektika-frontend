import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLabelComponent } from './main-label';

describe('MainLabelComponent', () => {
  let component: MainLabelComponent;
  let fixture: ComponentFixture<MainLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLabelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLabelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
