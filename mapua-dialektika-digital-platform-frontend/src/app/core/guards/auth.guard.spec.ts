import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let service: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
    });
    service = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('allows when token exists', () => {
    localStorage.setItem('access_token', 't');
    const result = service.canActivate({} as any, { url: '/dialektika-board' } as any);
    expect(result).toBeTrue();
    localStorage.removeItem('access_token');
  });
  it('blocks when token missing', () => {
    localStorage.removeItem('access_token');
    const result = service.canActivate({} as any, { url: '/dialektika-board' } as any);
    expect(result).toBeFalse();
  });
});
