import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FacturacionService } from '../../../services/facturacion.service';

describe('Performance Testing - Generar factura electronica (Frontend)', () => {
  let service: FacturacionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FacturacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe emitir una sola solicitud al crear factura', () => {
    service.crearFactura({ idPago: 1, idClienteFactura: 1, cufe: 'C', urlPdf: 'U' } as any).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/invoicing/facturas'));
    req.flush({ id: 1, enviada: 'N' });
    expect(httpMock.match((r) => r.url.includes('/invoicing/facturas')).length).toBe(0);
  });
});
