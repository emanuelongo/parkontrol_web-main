import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/autenticacion.service';

describe('Performance Testing - Iniciar sesion (Frontend)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe emitir una sola solicitud por login', () => {
    service.login({ correo: 'admin@test.com', contrasena: '123' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    req.flush({ access_token: 't' });
    expect(httpMock.match((r) => r.url.includes('/auth/login')).length).toBe(0);
  });
});
