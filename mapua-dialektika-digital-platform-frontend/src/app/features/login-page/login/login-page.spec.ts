import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { LoginPage } from './login-page';
import { DialektikaBoard } from '../../dialektika-board/dialektika-board';
import { ForgotPassword } from '../forgot-password/forgot-password';
import { AuthService } from '../../../core/services/auth.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

describe('LoginPage navigation and auth', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;
  let router: Router;
  let location: Location;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [
        LoginPage,
        RouterTestingModule.withRoutes([
          { path: '', component: LoginPage },
          { path: 'dialektika-board', component: DialektikaBoard },
          { path: 'forgot-password', component: ForgotPassword },
        ]),
      ],
      providers: [{ provide: AuthService, HTTP_INTERCEPTORS, useClass: LoginPage, multi: true}],
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router.initialNavigation();
    await fixture.whenStable();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  })
  it('navigates to mc-board on successful login', async() =>{
    spyOn(component['http'], 'post').and.returnValue(of({ access_token: 'a', refresh_token: 'b'}));
    const spy = spyOn(router, 'navigateByUrl');
    component.onLogin();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('/mc-board');
  });
  it('shows error on 401', async () => {
    spyOn(component['http'], 'post').and.returnValue(throwError(() => ({status: 401})));
    component.onLogin();
    await fixture.whenStable();
    expect(component.error()).toBe('Invalid Credentials!');
  });
});