import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CeldasService } from '../../../services/celdas.service';
import { Scenario } from '../../serenity/serenity';
import { Actor, Tasks } from '../../screenplay/screenplay';

describe('API Testing - Crear celda (Frontend)', () => {
  let service: CeldasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CeldasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe invocar POST /celdas con payload esperado', () => {
    const dto = { idParqueadero: 321, idTipoCelda: 1, idSensor: 1, estado: 'LIBRE' };
    const actor = new Actor('QA Frontend');
    const scenario = new Scenario('Crear celda');
    void scenario.given(() => actor.attemptsTo(Tasks.createCelda(service, dto as any)));
    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url.includes('/cells'));
    expect(req.request.body.estado).toBe('LIBRE');
    req.flush({ id: 1, ...dto });
  });
});
