import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CeldasService } from '../../../services/celdas.service';

describe('Security Testing - Crear celda (Frontend)', () => {
  let service: CeldasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CeldasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe conservar estado permitido y no inyectar campos extra', () => {
    service.create({ idParqueadero: 1, idTipoCelda: 1, idSensor: 1, estado: 'LIBRE' } as any).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/cells'));
    expect(req.request.body.estado).toBe('LIBRE');
    expect(req.request.body.admin).toBeUndefined();
    req.flush({ id: 1 });
  });
});
