import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReservasService } from '../../../services/reservas.service';

describe('Performance Testing - Finalizar reserva (Frontend)', () => {
  let service: ReservasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ReservasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe emitir una sola solicitud al finalizar reserva', () => {
    service.finalizar(12).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/reservations/12/finalizar'));
    req.flush({ id: 12, estado: 'CERRADA' });
    expect(httpMock.match((r) => r.url.includes('/reservations/12/finalizar')).length).toBe(0);
  });
});
