import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FacturacionService } from '../../../services/facturacion.service';

describe('Security Testing - Generar factura electronica (Frontend)', () => {
  let service: FacturacionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FacturacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe enviar datos minimos para crear factura', () => {
    service.crearFactura({ idPago: 1, idClienteFactura: 1, cufe: 'CUFE', urlPdf: 'URL' } as any).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/invoicing/facturas'));
    expect(Object.keys(req.request.body).sort((a, b) => a.localeCompare(b))).toEqual(['cufe', 'idClienteFactura', 'idPago', 'urlPdf']);
    req.flush({ id: 1 });
  });
});
