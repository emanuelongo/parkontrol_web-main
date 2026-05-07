import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReservasService } from './reservas.service';
import { Reserva } from './entities/reserva.entity';
import { VehiculosService } from 'src/vehiculos/vehiculos.service';
import { CeldasService } from 'src/celdas/celdas.service';
import { expectFailure, expectReservaResult } from 'src/shared/testing/fluent-assertions';

const createDto = { idVehiculo: 10, idCelda: 20, estado: 'ABIERTA' };

describe('ReservasService', () => {
  let service: ReservasService;
  let currentVehiculo: any;
  let currentCelda: any;
  let currentReserva: any;
  let reservasList: any[];
  let savedReserva: any;
  const actualizarEstadoMock = jest.fn();

  const reservaRepo = {
    create: (data: any) => ({ id: 1, ...data }),
    save: async (reserva: any) => {
      savedReserva = reserva;
      return reserva;
    },
    findOne: async () => currentReserva,
    find: async () => reservasList,
  };
  const vehiculosService = {
    findVehiculoById: async () => currentVehiculo,
  };
  const celdasService = {
    findCeldaById: async () => currentCelda,
    actualizarEstado: actualizarEstadoMock,
  };

  beforeEach(async () => {
    currentVehiculo = { id: 10 };
    currentCelda = { id: 20, estado: 'LIBRE' };
    currentReserva = null;
    reservasList = [];
    savedReserva = null;
    actualizarEstadoMock.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: getRepositoryToken(Reserva), useValue: reservaRepo },
        { provide: VehiculosService, useValue: vehiculosService },
        { provide: CeldasService, useValue: celdasService },
      ],
    }).compile();

    service = module.get(ReservasService);
    jest.clearAllMocks();
  });

  it('debe rechazar crear reserva si la celda no esta LIBRE', async () => {
    // Arrange
    currentCelda = { id: 20, estado: 'OCUPADA' };

    // Act + Assert
    await expect(service.crear(createDto as any)).rejects.toBeInstanceOf(BadRequestException);
    expect(actualizarEstadoMock).not.toHaveBeenCalled();
  });

  it('debe crear reserva y ocupar la celda', async () => {
    // Arrange
    currentVehiculo = { id: 10 };
    currentCelda = { id: 20, estado: 'LIBRE' };

    // Act
    const result = await service.crear(createDto as any);

    // Assert
    expect(result).toEqual({
      id: 1,
      vehiculo: { id: 10 },
      celda: { id: 20, estado: 'LIBRE' },
      estado: 'ABIERTA',
      fechaEntrada: expect.any(Date),
    });
    expect(actualizarEstadoMock).toHaveBeenCalledWith(20, 'OCUPADA');
    expect(savedReserva).toEqual(result);
  });

  it('debe rechazar finalizar reserva ya cerrada', async () => {
    // Arrange
    currentReserva = { id: 1, fechaSalida: new Date(), celda: { id: 20 } };

    // Act + Assert
    await expectFailure(service.finalizarReserva(1)).toBeBadRequest();
    expect(actualizarEstadoMock).not.toHaveBeenCalled();
  });

  it('debe finalizar reserva y liberar la celda', async () => {
    // Arrange
    currentReserva = {
      id: 1,
      fechaSalida: null,
      estado: 'ABIERTA',
      celda: { id: 20 },
    };

    // Act
    const result = await service.finalizarReserva(1);

    // Assert
    expectReservaResult(result).toBeFinalizadaConCelda(20);
    expect(actualizarEstadoMock).toHaveBeenCalledWith(20, 'LIBRE');
  });

  it('debe retornar reserva por id', async () => {
    // Arrange
    currentReserva = { id: 33, estado: 'ABIERTA' };

    // Act
    const result = await service.findReservaById(33);

    // Assert
    expect(result).toEqual({ id: 33, estado: 'ABIERTA' });
  });

  it('debe fallar cuando no existe reserva por id', async () => {
    // Arrange
    currentReserva = null;

    // Act + Assert
    await expect(service.findReservaById(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('debe listar reservas por parqueadero', async () => {
    // Arrange
    reservasList = [{ id: 1 }, { id: 2 }];

    // Act
    const result = await service.findByParqueadero(321);

    // Assert
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('debe listar reservas activas', async () => {
    // Arrange
    reservasList = [{ id: 7, estado: 'ABIERTA' }];

    // Act
    const result = await service.findActivas();

    // Assert
    expect(result).toEqual([{ id: 7, estado: 'ABIERTA' }]);
  });
});

// Dilan y Vale

describe('ReservasService (UNIT - AAA SIN FINALIZAR)', () => {
  let service: ReservasService;

  let reservaRepository: any;
  let vehiculosService: any;
  let celdasService: any;

  const dtoBase = { idVehiculo: 1, idCelda: 1, estado: 'ABIERTA' };

  beforeEach(async () => {
    reservaRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    vehiculosService = {
      findVehiculoById: jest.fn(),
    };

    celdasService = {
      findCeldaById: jest.fn(),
      actualizarEstado: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: getRepositoryToken(Reserva), useValue: reservaRepository },
        { provide: VehiculosService, useValue: vehiculosService },
        { provide: CeldasService, useValue: celdasService },
      ],
    }).compile();

    service = module.get<ReservasService>(ReservasService);
    jest.clearAllMocks();
  });

  it('C1: Debe crear reserva correctamente', async () => {
    const vehiculoMock = { id: 1 };
    const celdaMock = { id: 1, estado: 'LIBRE' };
    const reservaMock = { id: 1 };

    vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
    celdasService.findCeldaById.mockResolvedValue(celdaMock);

    reservaRepository.create.mockReturnValue(reservaMock);
    reservaRepository.save.mockResolvedValue(reservaMock);

    const result = await service.crear(dtoBase as any);

    expect(result).toEqual(reservaMock);
    expect(reservaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        vehiculo: vehiculoMock,
        celda: celdaMock,
        estado: 'ABIERTA',
      })
    );
    expect(celdasService.actualizarEstado).toHaveBeenCalledWith(1, 'OCUPADA');
  });

  it('C2: Debe fallar si el vehículo no existe', async () => {
    vehiculosService.findVehiculoById.mockRejectedValue(new NotFoundException());

    const action = service.crear(dtoBase as any);

    await expect(action).rejects.toThrow(NotFoundException);
    expect(reservaRepository.create).not.toHaveBeenCalled();
  });

  it('C3: Debe fallar si la celda no existe', async () => {
    vehiculosService.findVehiculoById.mockResolvedValue({ id: 1 });
    celdasService.findCeldaById.mockRejectedValue(new NotFoundException());

    const action = service.crear(dtoBase as any);

    await expect(action).rejects.toThrow(NotFoundException);
  });

  it('C4: Debe fallar si la celda no está LIBRE', async () => {
    vehiculosService.findVehiculoById.mockResolvedValue({ id: 1 });
    celdasService.findCeldaById.mockResolvedValue({ id: 1, estado: 'OCUPADA' });

    const action = service.crear(dtoBase as any);

    await expect(action).rejects.toThrow(BadRequestException);
    expect(celdasService.actualizarEstado).not.toHaveBeenCalled();
  });

  it('C5: Debe asignar fechaEntrada automáticamente', async () => {
    vehiculosService.findVehiculoById.mockResolvedValue({ id: 1 });
    celdasService.findCeldaById.mockResolvedValue({ id: 1, estado: 'LIBRE' });

    reservaRepository.create.mockImplementation((data) => data);
    reservaRepository.save.mockImplementation((data) => Promise.resolve(data));

    const result = await service.crear(dtoBase as any);

    expect(result.fechaEntrada).toBeInstanceOf(Date);
  });

  it('C6: Debe retornar reserva por ID', async () => {
    const reservaMock = { id: 1 };

    reservaRepository.findOne.mockResolvedValue(reservaMock);

    const result = await service.findReservaById(1);

    expect(result).toEqual(reservaMock);
    expect(reservaRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['vehiculo', 'vehiculo.tipoVehiculo', 'celda', 'celda.parqueadero'],
    });
  });

  it('C7: Debe fallar si no existe reserva por ID', async () => {
    reservaRepository.findOne.mockResolvedValue(null);

    const action = service.findReservaById(999);

    await expect(action).rejects.toThrow(NotFoundException);
  });

  it('C8: Debe listar reservas por parqueadero', async () => {
    const reservasMock = [{ id: 1 }];
    reservaRepository.find.mockResolvedValue(reservasMock);

    const result = await service.findByParqueadero(1);

    expect(result).toEqual(reservasMock);
    expect(reservaRepository.find).toHaveBeenCalledWith({
      where: { celda: { parqueadero: { id: 1 } } },
      relations: ['vehiculo', 'vehiculo.tipoVehiculo', 'celda'],
      order: { fechaEntrada: 'DESC' },
    });
  });

  it('C9: Debe listar reservas activas', async () => {
    const reservasMock = [{ id: 1, estado: 'ABIERTA' }];
    reservaRepository.find.mockResolvedValue(reservasMock);

    const result = await service.findActivas();

    expect(result).toEqual(reservasMock);
    expect(reservaRepository.find).toHaveBeenCalledWith({
      where: { estado: 'ABIERTA' },
      relations: ['vehiculo', 'vehiculo.tipoVehiculo', 'celda', 'celda.parqueadero'],
    });
  });

});