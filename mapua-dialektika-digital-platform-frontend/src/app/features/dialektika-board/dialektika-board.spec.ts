import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DialektikaBoard } from './dialektika-board';

describe('DialektikaBoard', () => {
  let component: DialektikaBoard;
  let fixture: ComponentFixture<DialektikaBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialektikaBoard, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DialektikaBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('redirects to login when token missing', async () => {
    localStorage.removeItem('access_token');
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate');
    component.ngOnInit();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalled();
  });
});
