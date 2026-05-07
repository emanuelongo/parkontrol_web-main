import { FacturacionService } from 'src/facturacion/facturacion.service';

describe('Regression Testing - Generar factura electronica (Backend)', () => {
  it('debe conservar asignacion de enviada=N al crear factura', async () => {
    const service = new FacturacionService(
      { create: jest.fn((d) => ({ ...d })), save: jest.fn(async (d) => d) } as any,
      { findOne: jest.fn(async () => ({ id: 1 })) } as any,
      { findPagoById: jest.fn(async () => ({ id: 1 })) } as any,
    );

    const result = await service.crearFactura({ idPago: 1, idClienteFactura: 1, cufe: 'C', urlPdf: 'U' } as any);

    expect(result.enviada).toBe('N');
  });
});
