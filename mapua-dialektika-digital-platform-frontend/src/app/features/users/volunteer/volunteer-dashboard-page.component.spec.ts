import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteerDashboardPageComponent } from './volunteer-dashboard-page.component';

describe('VolunteerDashboardPageComponent', () => {
  let component: VolunteerDashboardPageComponent;
  let fixture: ComponentFixture<VolunteerDashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteerDashboardPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolunteerDashboardPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
