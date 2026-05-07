import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FacturacionService } from '../../../services/facturacion.service';

describe('Regression Testing - Generar factura electronica (Frontend)', () => {
  let service: FacturacionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FacturacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe conservar endpoint de creacion de factura', () => {
    service.crearFactura({ idPago: 1, idClienteFactura: 1, cufe: 'C', urlPdf: 'U' } as any).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/invoicing/facturas'));
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, enviada: 'N' });
  });
});
