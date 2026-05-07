import { Test, TestingModule } from '@nestjs/testing';
import { FacturacionService } from './facturacion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteFactura } from './entities/cliente-factura.entity';
import { FacturaElectronica } from './entities/factura-electronica.entity';
import { PagosService } from 'src/pagos/pagos.service';
import { expectFailure, expectFacturaResult } from 'src/shared/testing/fluent-assertions';

describe('FacturacionService - HU32 obtenerClientes', () => {
  let service: FacturacionService;
  let clienteFacturaRepository: jest.Mocked<Repository<ClienteFactura>>;

  const mockClienteFacturaRepository = {
    find: jest.fn(),
  };

  const mockFacturaRepository = {};
  const mockPagosService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturacionService,
        {
          provide: getRepositoryToken(FacturaElectronica),
          useValue: mockFacturaRepository,
        },
        {
          provide: getRepositoryToken(ClienteFactura),
          useValue: mockClienteFacturaRepository,
        },
        {
          provide: PagosService,
          useValue: mockPagosService,
        },
      ],
    }).compile();

    service = module.get<FacturacionService>(FacturacionService);
    clienteFacturaRepository = module.get(
      getRepositoryToken(ClienteFactura),
    );

    jest.clearAllMocks();
  });

  // ✅ CAMINO 1: 1-2-3 → Retorna array
  it('debe retornar la lista de clientes de facturación (Camino 1-2-3)', async () => {
    const clientesMock = [
      { id: 1, tipoDocumento: "CC", numeroDocumento: "1234567890", correo: "test@example.com" },
      { id: 2, tipoDocumento: "CC", numeroDocumento: "0123456789", correo: "example@test.com" },
    ] as ClienteFactura[];

    clienteFacturaRepository.find.mockResolvedValue(clientesMock);

    const resultado = await service.obtenerClientes();

    expect(clienteFacturaRepository.find).toHaveBeenCalled();
    expect(resultado).toEqual(clientesMock);
  });
});

// Emanuel

const createFacturaDto = {
  idPago: 40903,
  idClienteFactura: 1,
  cufe: 'CUFE-1',
  urlPdf: 'http://pdf',
};

describe('FacturacionService', () => {
  let service: FacturacionService;
  let currentPago: any;
  let currentCliente: any;
  let clientesList: any[];
  let savedFactura: any;
  let currentFacturaById: any;
  let facturaByPago: any;
  const findPagoByIdMock = jest.fn();

  const facturaRepo = {
    create: (data: any) => ({ id: 1, ...data }),
    save: async (factura: any) => {
      savedFactura = factura;
      return factura;
    },
    findOne: async (options: any) => {
      if (options?.where?.id !== undefined) {
        return currentFacturaById;
      }
      if (options?.where?.pago?.id !== undefined) {
        return facturaByPago;
      }
      return null;
    },
  };
  const clienteRepo = {
    findOne: async () => currentCliente,
    create: (data: any) => data,
    save: async (data: any) => data,
    find: async () => clientesList,
  };
  const pagosService = { findPagoById: findPagoByIdMock };

  beforeEach(async () => {
    currentPago = { id: 40903 };
    currentCliente = { id: 1 };
    clientesList = [];
    savedFactura = null;
    currentFacturaById = null;
    facturaByPago = null;
    findPagoByIdMock.mockResolvedValue(currentPago);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturacionService,
        { provide: getRepositoryToken(FacturaElectronica), useValue: facturaRepo },
        { provide: getRepositoryToken(ClienteFactura), useValue: clienteRepo },
        { provide: PagosService, useValue: pagosService },
      ],
    }).compile();

    service = module.get(FacturacionService);
    jest.clearAllMocks();
  });

  it('debe fallar si no existe cliente', async () => {
    // Arrange
    currentCliente = null;

    // Act + Assert
    await expectFailure(service.crearFactura(createFacturaDto as any)).toBeNotFound();
    expect(findPagoByIdMock).toHaveBeenCalledWith(40903);
  });

  it('debe crear factura con datos validos', async () => {
    // Arrange
    currentPago = { id: 40903 };
    currentCliente = { id: 1 };
    findPagoByIdMock.mockResolvedValue(currentPago);

    // Act
    const result = await service.crearFactura(createFacturaDto as any);

    // Assert
    expectFacturaResult(result).toBeCreatedAs({
      id: 1,
      pago: currentPago,
      clienteFactura: currentCliente,
      cufe: 'CUFE-1',
      urlPdf: 'http://pdf',
      enviada: 'N',
    });
    expect(findPagoByIdMock).toHaveBeenCalledWith(40903);
    expect(savedFactura).toEqual(result);
  });

  it('debe crear cliente de facturacion', async () => {
    // Arrange
    const createClienteDto = { nombreCompleto: 'Cliente Uno', numeroDocumento: '123' };

    // Act
    const result = await service.crearCliente(createClienteDto as any);

    // Assert
    expect(result).toEqual(createClienteDto);
  });

  it('debe marcar factura como enviada', async () => {
    // Arrange
    currentFacturaById = { id: 10, enviada: 'N' };

    // Act
    const result = await service.marcarComoEnviada(10);

    // Assert
    expect(result.enviada).toBe('Y');
    expect(savedFactura.id).toBe(10);
  });

  it('debe fallar al marcar enviada si factura no existe', async () => {
    // Arrange
    currentFacturaById = null;

    // Act + Assert
    await expectFailure(service.marcarComoEnviada(404)).toBeNotFound();
  });

  it('debe consultar factura por pago', async () => {
    // Arrange
    facturaByPago = { id: 50, pago: { id: 40903 } };

    // Act
    const result = await service.findByPago(40903);

    // Assert
    expect(result).toEqual({ id: 50, pago: { id: 40903 } });
  });

  it('debe listar clientes de facturacion', async () => {
    // Arrange
    clientesList = [{ id: 1 }, { id: 2 }];

    // Act
    const result = await service.obtenerClientes();

    // Assert
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });
});