import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/autenticacion.service';

describe('Regression Testing - Iniciar sesion (Frontend)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe mantener el endpoint /auth/login', () => {
    service.login({ correo: 'a@a.com', contrasena: 'bad' }).subscribe({ error: () => undefined });
    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });
});
