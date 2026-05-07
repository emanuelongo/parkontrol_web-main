import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReservasService } from '../../../services/reservas.service';

describe('Regression Testing - Finalizar reserva (Frontend)', () => {
  let service: ReservasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ReservasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe conservar metodo PATCH al finalizar', () => {
    service.finalizar(8).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/reservations/8/finalizar'));
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 8, estado: 'CERRADA' });
  });
});
