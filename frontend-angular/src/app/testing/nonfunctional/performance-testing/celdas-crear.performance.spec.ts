import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CeldasService } from '../../../services/celdas.service';

describe('Performance Testing - Crear celda (Frontend)', () => {
  let service: CeldasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CeldasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe emitir una sola solicitud al crear celda', () => {
    service.create({ idParqueadero: 1, idTipoCelda: 1, idSensor: 1, estado: 'LIBRE' } as any).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/cells'));
    req.flush({ id: 1 });
    expect(httpMock.match((r) => r.url.includes('/cells')).length).toBe(0);
  });
});
