import { Test, TestingModule } from '@nestjs/testing';
import { CeldasService } from './celdas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Celda } from './entities/celda.entity';
import { TipoCelda } from 'src/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/shared/entities/sensor.entity';
import { ParqueaderosService } from 'src/parqueaderos/parqueaderos.service';
import { NotFoundException } from '@nestjs/common';
import { expectCeldaResult, expectFailure } from 'src/shared/testing/fluent-assertions';

describe('CeldasService - HU09 findByParqueadero', () => {
  let service: CeldasService;
  let celdaRepository: jest.Mocked<Repository<Celda>>;

  const mockCeldaRepository = {
    find: jest.fn(),
  };

  const mockTipoCeldaRepository = {};
  const mockSensorRepository = {};
  const mockParqueaderosService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CeldasService,
        {
          provide: getRepositoryToken(Celda),
          useValue: mockCeldaRepository,
        },
        {
          provide: getRepositoryToken(TipoCelda),
          useValue: mockTipoCeldaRepository,
        },
        {
          provide: getRepositoryToken(Sensor),
          useValue: mockSensorRepository,
        },
        {
          provide: ParqueaderosService,
          useValue: mockParqueaderosService,
        },
      ],
    }).compile();

    service = module.get<CeldasService>(CeldasService);
    celdaRepository = module.get(getRepositoryToken(Celda));
    jest.clearAllMocks();
  });

  // ✅ CAMINO 1: 1-2-3 → Retorna lista de celdas
  it('debe retornar la lista de celdas de un parqueadero (Camino 1-2-3)', async () => {
    const idParqueadero = 1;

    const celdasMock = [
      {
        id: 1,
        estado: 'DISPONIBLE',
        parqueadero: { id: 1 },
        tipoCelda: { id: 1 },
        sensor: { id: 1 },
      },
      {
        id: 2,
        estado: 'OCUPADA',
        parqueadero: { id: 1 },
        tipoCelda: { id: 2 },
        sensor: { id: 2 },
      },
    ] as Celda[];

    celdaRepository.find.mockResolvedValue(celdasMock);

    const resultado = await service.findByParqueadero(idParqueadero);

    expect(celdaRepository.find).toHaveBeenCalledWith({
      where: { parqueadero: { id: idParqueadero } },
      relations: ['parqueadero', 'tipoCelda', 'sensor'],
    });

    expect(resultado).toEqual(celdasMock);
  });
});

// Emanuel
const createDto = {
  idParqueadero: 321,
  idTipoCelda: 1,
  idSensor: 1,
  estado: 'LIBRE',
};

describe('CeldasService', () => {
  let service: CeldasService;
  let currentParqueadero: any;
  let currentTipoCelda: any;
  let currentSensor: any;
  let savedCelda: any;
  let currentCeldaById: any;
  let celdasByParqueadero: any[];
  const findParqueaderoByIdMock = jest.fn();

  const celdaRepo = {
    create: (data: any) => ({ id: 1, ...data }),
    save: async (celda: any) => {
      savedCelda = celda;
      return celda;
    },
    find: async () => celdasByParqueadero,
    findOne: async () => currentCeldaById,
  };
  const tipoRepo = {
    findOne: async () => currentTipoCelda,
  };
  const sensorRepo = {
    findOne: async () => currentSensor,
  };
  const parqueaderosService = {
    findParqueaderoById: findParqueaderoByIdMock,
  };

  beforeEach(async () => {
    currentParqueadero = { id: 321 };
    currentTipoCelda = { id: 1 };
    currentSensor = { id: 1 };
    savedCelda = null;
    currentCeldaById = null;
    celdasByParqueadero = [];
    findParqueaderoByIdMock.mockResolvedValue(currentParqueadero);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CeldasService,
        { provide: getRepositoryToken(Celda), useValue: celdaRepo },
        { provide: getRepositoryToken(TipoCelda), useValue: tipoRepo },
        { provide: getRepositoryToken(Sensor), useValue: sensorRepo },
        { provide: ParqueaderosService, useValue: parqueaderosService },
      ],
    }).compile();

    service = module.get(CeldasService);
    jest.clearAllMocks();
  });

  it('debe fallar si no existe tipo de celda', async () => {
    // Arrange
    currentTipoCelda = null;

    // Act + Assert
    await expectFailure(service.crear(createDto as any)).toBeNotFound();
    expect(findParqueaderoByIdMock).toHaveBeenCalledWith(321);
  });

  it('debe fallar si no existe sensor', async () => {
    // Arrange
    currentTipoCelda = { id: 1 };
    currentSensor = null;

    // Act + Assert
    await expectFailure(service.crear(createDto as any)).toBeNotFound();
    expect(findParqueaderoByIdMock).toHaveBeenCalledWith(321);
  });

  it('debe crear celda con datos validos', async () => {
    // Arrange
    currentParqueadero = { id: 321 };
    currentTipoCelda = { id: 1 };
    currentSensor = { id: 1 };
    findParqueaderoByIdMock.mockResolvedValue(currentParqueadero);

    // Act
    const result = await service.crear(createDto as any);

    // Assert
    expectCeldaResult(result).toBeCreatedAs({
      id: 1,
      estado: 'LIBRE',
      parqueadero: currentParqueadero,
      tipoCelda: currentTipoCelda,
      sensor: currentSensor,
    });
    expect(findParqueaderoByIdMock).toHaveBeenCalledWith(321);
    expect(savedCelda).toEqual(result);
  });

  it('debe retornar celdas por parqueadero', async () => {
    // Arrange
    celdasByParqueadero = [{ id: 1 }, { id: 2 }];

    // Act
    const result = await service.findByParqueadero(321);

    // Assert
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('debe retornar celda por id', async () => {
    // Arrange
    currentCeldaById = { id: 88, estado: 'LIBRE' };

    // Act
    const result = await service.findCeldaById(88);

    // Assert
    expect(result).toEqual({ id: 88, estado: 'LIBRE' });
  });

  it('debe fallar si no existe celda por id', async () => {
    // Arrange
    currentCeldaById = null;

    // Act + Assert
    await expect(service.findCeldaById(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('debe actualizar estado de la celda', async () => {
    // Arrange
    currentCeldaById = { id: 77, estado: 'LIBRE', ultimoCambioEstado: null };

    // Act
    const result = await service.actualizarEstado(77, 'OCUPADA');

    // Assert
    expect(result.estado).toBe('OCUPADA');
    expect(result.ultimoCambioEstado).toEqual(expect.any(Date));
    expect(savedCelda.id).toBe(77);
  });
});