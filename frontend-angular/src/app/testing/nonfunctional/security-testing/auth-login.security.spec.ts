import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/autenticacion.service';

describe('Security Testing - Iniciar sesion (Frontend)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe enviar solo correo y contrasena en login', () => {
    service.login({ correo: 'admin@test.com', contrasena: '123456' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    expect(Object.keys(req.request.body).sort((a, b) => a.localeCompare(b))).toEqual(['contrasena', 'correo']);
    req.flush({ access_token: 't' });
  });
});
