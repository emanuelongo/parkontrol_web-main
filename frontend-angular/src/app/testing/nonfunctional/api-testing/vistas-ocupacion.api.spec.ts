import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { VistasService } from '../../../services/vistas.service';
import { Scenario } from '../../serenity/serenity';
import { Actor, Tasks } from '../../screenplay/screenplay';

describe('API Testing - Consultar ocupacion por parqueadero (Frontend)', () => {
  let service: VistasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(VistasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe invocar GET /vistas/ocupacion/{idParqueadero}', () => {
    const actor = new Actor('QA Frontend');
    const scenario = new Scenario('Consultar ocupacion');
    void scenario.given(() => actor.attemptsTo(Tasks.consultarOcupacion(service, 321)));
    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/views/ocupacion'));
    expect(req.request.urlWithParams).toContain('idEmpresa=321');
    req.flush({ idParqueadero: 321, totalCeldas: 10, celdasOcupadas: 3 });
  });
});
