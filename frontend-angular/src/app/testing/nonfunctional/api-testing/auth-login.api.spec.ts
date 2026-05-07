import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/autenticacion.service';
import { Scenario } from '../../serenity/serenity';
import { Actor, Tasks } from '../../screenplay/screenplay';

describe('API Testing - Iniciar sesion (Frontend)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe invocar POST /auth/login con credenciales', () => {
    const actor = new Actor('QA Frontend');
    const scenario = new Scenario('Iniciar sesion');
    void scenario.given(() => actor.attemptsTo(Tasks.login(service, { correo: 'admin@test.com', contrasena: '123456' })));
    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url.includes('/auth/login'));
    expect(req.request.body).toEqual({ correo: 'admin@test.com', contrasena: '123456' });
    req.flush({ access_token: 'token' });
  });
});
