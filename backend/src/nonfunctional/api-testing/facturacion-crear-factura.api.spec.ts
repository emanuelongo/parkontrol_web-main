import { FacturacionService } from 'src/facturacion/facturacion.service';
import { Actor, Tasks } from '../screenplay/screenplay';
import { Scenario, Steps } from '../serenity/serenity';

describe('API Testing - Generar factura electronica (Backend)', () => {
  it('debe crear factura con estado enviada=N', async () => {
    const facturaRepo = {
      create: jest.fn((d) => ({ id: 1, ...d })),
      save: jest.fn(async (d) => d),
    };
    const clienteRepo = { findOne: jest.fn(async () => ({ id: 1 })) };
    const pagosService = { findPagoById: jest.fn(async () => ({ id: 40903 })) };
    const service = new FacturacionService(facturaRepo as any, clienteRepo as any, pagosService as any);
    const actor = new Actor('QA Backoffice');
    const scenario = new Scenario('Generar factura electronica');

    const result = await scenario.given(
      Steps.crearFactura(() =>
        actor.attemptsTo(
          Tasks.crearFactura(service, { idPago: 40903, idClienteFactura: 1, cufe: 'CUFE-1', urlPdf: 'http://pdf' } as any),
        ),
      ),
    );

    expect(result.enviada).toBe('N');
    expect(result.cufe).toBe('CUFE-1');
  });
});
