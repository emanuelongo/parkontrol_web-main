import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReservasService } from '../../../services/reservas.service';
import { Scenario } from '../../serenity/serenity';
import { Actor, Tasks } from '../../screenplay/screenplay';

describe('API Testing - Finalizar reserva (Frontend)', () => {
  let service: ReservasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ReservasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe invocar PATCH para finalizar reserva', () => {
    const actor = new Actor('QA Frontend');
    const scenario = new Scenario('Finalizar reserva');
    void scenario.given(() => actor.attemptsTo(Tasks.finalizeReserva(service, 77)));
    const req = httpMock.expectOne((r) => r.method === 'PATCH' && r.url.includes('/reservations/77/finalizar'));
    expect(req.request.body).toEqual({});
    req.flush({ id: 77, estado: 'CERRADA' });
  });
});
