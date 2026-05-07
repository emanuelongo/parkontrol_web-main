import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FacturacionService } from '../../../services/facturacion.service';
import { Scenario } from '../../serenity/serenity';
import { Actor, Tasks } from '../../screenplay/screenplay';

describe('API Testing - Generar factura electronica (Frontend)', () => {
  let service: FacturacionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FacturacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe invocar POST /facturacion con payload esperado', () => {
    const dto = { idPago: 40903, idClienteFactura: 1, cufe: 'CUFE-1', urlPdf: 'http://pdf' };
    const actor = new Actor('QA Frontend');
    const scenario = new Scenario('Generar factura');
    void scenario.given(() => actor.attemptsTo(Tasks.crearFactura(service, dto as any)));
    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url.includes('/invoicing/facturas'));
    expect(req.request.body.cufe).toBe('CUFE-1');
    req.flush({ id: 1, enviada: 'N', ...dto });
  });
});
