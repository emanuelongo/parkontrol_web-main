import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { VistasService } from '../../../services/vistas.service';

describe('Regression Testing - Consultar ocupacion por parqueadero (Frontend)', () => {
  let service: VistasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(VistasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe mantener query por idParqueadero en URL', () => {
    service.getOcupacion(999).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/views/ocupacion'));
    expect(req.request.urlWithParams).toContain('idEmpresa=999');
    req.flush({});
  });
});
