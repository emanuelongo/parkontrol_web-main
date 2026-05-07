import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { VistasService } from '../../../services/vistas.service';

describe('Performance Testing - Consultar ocupacion por parqueadero (Frontend)', () => {
  let service: VistasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(VistasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe emitir una sola solicitud al consultar ocupacion', () => {
    service.getOcupacion(321).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/views/ocupacion'));
    expect(req.request.urlWithParams).toContain('idEmpresa=321');
    req.flush({ idParqueadero: 321 });
    expect(httpMock.match((r) => r.url.includes('/views/ocupacion')).length).toBe(0);
  });
});
