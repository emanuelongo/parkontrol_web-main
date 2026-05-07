import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReservasService } from '../../../services/reservas.service';

describe('Security Testing - Finalizar reserva (Frontend)', () => {
  let service: ReservasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ReservasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe finalizar con body vacio para reducir superficie de ataque', () => {
    service.finalizar(1).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/reservations/1/finalizar'));
    expect(req.request.body).toEqual({});
    req.flush({ id: 1, estado: 'CERRADA' });
  });
});
