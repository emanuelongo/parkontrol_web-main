import { FacturacionService } from 'src/facturacion/facturacion.service';

describe('Performance Testing - Generar factura electronica (Backend)', () => {
  it('debe generar factura en tiempo acotado', async () => {
    const service = new FacturacionService(
      { create: jest.fn((d) => d), save: jest.fn(async (d) => d) } as any,
      { findOne: jest.fn(async () => ({ id: 1 })) } as any,
      { findPagoById: jest.fn(async () => ({ id: 1 })) } as any,
    );

    const start = performance.now();
    await service.crearFactura({ idPago: 1, idClienteFactura: 1, cufe: 'x', urlPdf: 'y' } as any);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(300);
  });
});
