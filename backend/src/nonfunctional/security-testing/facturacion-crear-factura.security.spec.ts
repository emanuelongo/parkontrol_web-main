import { FacturacionService } from 'src/facturacion/facturacion.service';

describe('Security Testing - Generar factura electronica (Backend)', () => {
  it('no debe guardar factura si no existe cliente', async () => {
    const facturaRepo = { create: jest.fn(), save: jest.fn() };
    const service = new FacturacionService(
      facturaRepo as any,
      { findOne: jest.fn(async () => null) } as any,
      { findPagoById: jest.fn(async () => ({ id: 1 })) } as any,
    );

    await expect(service.crearFactura({ idPago: 1, idClienteFactura: 777, cufe: 'C', urlPdf: 'U' } as any)).rejects.toThrow();
    expect(facturaRepo.save).not.toHaveBeenCalled();
  });
});
