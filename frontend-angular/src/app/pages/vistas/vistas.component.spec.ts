import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VistasComponent } from './vistas.component';
import { VistasService } from '../../services/vistas.service';
import { AuthService } from '../../services/autenticacion.service';
import { of, throwError } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { RolUsuario } from '../../models/shared.model';
import { expectOcupacionDashboard } from '../../testing/fluent-assertions';
const mockUsuario = (overrides: Partial<Usuario> = {}): Usuario => ({
  id: 1,
  idEmpresa: 1,
  nombre: 'Admin',
  correo: 'admin@test.com',
  rol: RolUsuario.ADMINISTRADOR,
  ...overrides,
});

const mockOcupacion = () => [
  { idParqueadero: 1, nombreParqueadero: 'Central', nombreEmpresa: 'Empresa A', totalCeldas: 100, celdasOcupadas: 60, celdasLibres: 40 },
  { idParqueadero: 2, nombreParqueadero: 'Norte', nombreEmpresa: 'Empresa A', totalCeldas: 50, celdasOcupadas: 25, celdasLibres: 25 },
];

const mockHistorial = () => [
  { idReserva: 1, placa: 'ABC123', tipoVehiculo: 'Carro', idCelda: 1, parqueadero: 'Central', fechaEntrada: '2023-01-01', estado: 'FINALIZADA' },
  { idReserva: 2, placa: 'XYZ999', tipoVehiculo: 'Moto', idCelda: 2, parqueadero: 'Norte', fechaEntrada: '2023-01-02', estado: 'FINALIZADA' },
];

const mockIngresos = () => [
  { empresa: 'Empresa A', parqueadero: 'Central', periodo: '2023-01', totalIngresos: 150000 },
  { empresa: 'Empresa A', parqueadero: 'Norte', periodo: '2023-01', totalIngresos: 80000 },
];

const mockFacturacion = () => [
  { idFacturaElectronica: 1, tipoDocumento: 'Factura', numeroDocumento: '001', correo: 'test@test.com', idPago: 1, monto: 20000, metodoPago: 'Tarjeta', fechaPago: '2023-01-01', cufe: 'cufe1', urlPdf: 'url1', enviada: 1 },
  { idFacturaElectronica: 2, tipoDocumento: 'Factura', numeroDocumento: '002', correo: 'test2@test.com', idPago: 2, monto: 35000, metodoPago: 'Efectivo', fechaPago: '2023-01-02', cufe: 'cufe2', urlPdf: 'url2', enviada: 1 },
];

// ─────────────────────────────────────────────────────────────────────────────
describe('VistasComponent - HU-36: Historial de Reservas (Caja Blanca)', () => {
  let component: VistasComponent;
  let fixture: ComponentFixture<VistasComponent>;

  // Las instancias de los spies se crean una vez pero se reconfiguran en cada beforeEach
  let vistasServiceSpy: jasmine.SpyObj<VistasService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Se crean spies frescos en cada test → elimina el estado compartido entre pruebas
    vistasServiceSpy = jasmine.createSpyObj('VistasService', [
      'getOcupacion', 'getHistorialReservas', 'getIngresos', 'getFacturacion',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUsuarioActual']);

    // Valores por defecto: respuestas vacías exitosas para todas las peticiones
    // Así cada test parte de un estado limpio y predecible
    vistasServiceSpy.getOcupacion.and.returnValue(of([]));
    vistasServiceSpy.getHistorialReservas.and.returnValue(of([]));
    vistasServiceSpy.getIngresos.and.returnValue(of([]));
    vistasServiceSpy.getFacturacion.and.returnValue(of([]));
    authServiceSpy.getUsuarioActual.and.returnValue(mockUsuario());

    await TestBed.configureTestingModule({
      imports: [VistasComponent],
      providers: [
        { provide: VistasService, useValue: vistasServiceSpy },
        { provide: AuthService,   useValue: authServiceSpy  },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(VistasComponent);
    component = fixture.componentInstance;
    // NOTA: NO se llama fixture.detectChanges() aquí para que cada test
    // controle exactamente cuándo se ejecuta ngOnInit
  });

  // ══════════════════════════════════════════════════════════════════════════
  // cargarDatos() — Caminos del nodo de validación de usuario
  // ══════════════════════════════════════════════════════════════════════════
  describe('cargarDatos() — validación de usuario autenticado', () => {

    it('Camino 1: No debería llamar a ningún servicio si no hay usuario autenticado', () => {
      // Arrange
      authServiceSpy.getUsuarioActual.and.returnValue(null);
      spyOn(console, 'error');

      // Act
      fixture.detectChanges(); // Dispara ngOnInit → cargarDatos()

      // Assert
      expect(component.idEmpresa).toBeNull();
      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalledWith('No hay usuario autenticado');
      expect(vistasServiceSpy.getHistorialReservas).not.toHaveBeenCalled();
      expect(vistasServiceSpy.getOcupacion).not.toHaveBeenCalled();
    });

    it('Camino 2: No debería llamar a los servicios si el usuario no tiene idEmpresa', () => {
      // Arrange
      authServiceSpy.getUsuarioActual.and.returnValue({ nombre: 'Sin empresa', idEmpresa: null } as any);
      spyOn(console, 'error');

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.idEmpresa).toBeNull();
      expect(vistasServiceSpy.getHistorialReservas).not.toHaveBeenCalled();
    });

    it('Camino 3: Debería asignar idEmpresa e iniciar las peticiones si el usuario es válido', () => {
      // Arrange — authServiceSpy ya retorna mockUsuario() por defecto en beforeEach

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.idEmpresa).toBe(1);
      expect(vistasServiceSpy.getOcupacion).toHaveBeenCalledWith(1);
      expect(vistasServiceSpy.getHistorialReservas).toHaveBeenCalledWith(1);
      expect(vistasServiceSpy.getIngresos).toHaveBeenCalledWith(1);
      expect(vistasServiceSpy.getFacturacion).toHaveBeenCalledWith(1);
    });

  });

  // ══════════════════════════════════════════════════════════════════════════
  // cargarDatosVistas() — Caminos de éxito y error por servicio
  // ══════════════════════════════════════════════════════════════════════════
  describe('cargarDatosVistas() — respuestas de los servicios', () => {

    it('Camino 1: Debería cargar el historial correctamente cuando la API responde con datos', () => {
      // Arrange
      vistasServiceSpy.getHistorialReservas.and.returnValue(of(mockHistorial()));

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.historial.length).toBe(2);
      expect(component.historial[0].placa).toBe('ABC123');
    });

    it('Camino 2: Debería dejar historial vacío y NO lanzar excepción si la API de historial falla', () => {
      // Arrange
      vistasServiceSpy.getHistorialReservas.and.returnValue(
        throwError(() => new Error('Error de red'))
      );
      spyOn(console, 'log');

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.historial).toEqual([]);
      expect(console.log).toHaveBeenCalledWith(
        'Error no cargo historial de reservas',
        jasmine.any(Error),
      );
    });

    it('Camino 3: Debería dejar ocupación vacía si la API de ocupación falla', () => {
      // Arrange
      vistasServiceSpy.getOcupacion.and.returnValue(
        throwError(() => new Error('Error ocupación'))
      );

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.ocupacion).toEqual([]);
    });

    it('Camino 4: Debería dejar ingresos vacíos si la API de ingresos falla', () => {
      // Arrange
      vistasServiceSpy.getIngresos.and.returnValue(
        throwError(() => new Error('Error ingresos'))
      );

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.ingresos).toEqual([]);
    });

    it('Camino 5: Debería dejar facturación vacía si la API de facturación falla', () => {
      // Arrange
      vistasServiceSpy.getFacturacion.and.returnValue(
        throwError(() => new Error('Error facturación'))
      );

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.facturacion).toEqual([]);
    });

  });

  // ══════════════════════════════════════════════════════════════════════════
  // validarPeticiones() — Control del contador de peticiones completadas
  // ══════════════════════════════════════════════════════════════════════════
  describe('validarPeticiones() — control del loading y estadísticas', () => {

    it('Camino 1: loading debe seguir en true si solo han completado 1 de 4 peticiones', () => {
      // Arrange — forzamos un estado donde loading ya fue activado
      // pero no se han completado las 4 peticiones
      component.loading = true;
      (component as any).peticionesCompletadas = 0;
      (component as any).totalPeticiones = 4;

      // Act — llamamos directamente el método privado (simula 1 petición completada)
      (component as any).validarPeticiones();

      // Assert
      expect(component.loading).toBeTrue();
      expect((component as any).peticionesCompletadas).toBe(1);
    });

    it('Camino 2: loading debe apagarse cuando la cuarta petición completa', () => {
      // Arrange
      component.loading = true;
      (component as any).peticionesCompletadas = 3; // Ya van 3, falta 1

      // Act
      (component as any).validarPeticiones(); // Llega a 4 → dispara calcularEstadísticas

      // Assert
      expect(component.loading).toBeFalse();
    });

  });

  // ══════════════════════════════════════════════════════════════════════════
  // calcularEstadisticas() — Cálculos sobre los datos cargados
  // ══════════════════════════════════════════════════════════════════════════
  describe('calcularEstadisticas() — cálculo de métricas', () => {

    it('Camino 1: Debería calcular estadísticas correctamente con las 4 peticiones exitosas', () => {
      // Arrange
      vistasServiceSpy.getOcupacion.and.returnValue(of(mockOcupacion()));
      vistasServiceSpy.getHistorialReservas.and.returnValue(of(mockHistorial()));
      vistasServiceSpy.getIngresos.and.returnValue(of(mockIngresos()));
      vistasServiceSpy.getFacturacion.and.returnValue(of(mockFacturacion()));

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.totalReservas).toBe(2);
      expect(component.ingresosTotal).toBe(230000);   // 150000 + 80000
      expect(component.facturacionTotal).toBe(55000); // 20000 + 35000
      expect(component.loading).toBeFalse();
    });

    it('Camino 2: Debería calcular el promedio de ocupación correctamente', () => {
      // Arrange — parqueadero 1: 60/100 = 60%, parqueadero 2: 25/50 = 50% → promedio 55%
      vistasServiceSpy.getOcupacion.and.returnValue(of(mockOcupacion()));

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.promedioOcupacion).toBe(55);
    });

    it('Camino 3: promedioOcupacion debe ser 0 si no hay datos de ocupación', () => {
      // Arrange — getOcupacion ya retorna [] por defecto en beforeEach

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.promedioOcupacion).toBe(0);
    });

    it('Camino 4: Debería calcular 0% de ocupación si totalCeldas es 0 (evitar división por cero)', () => {
      // Arrange
      const ocupacionConCero = [{ idParqueadero: 1, nombreParqueadero: 'Test', nombreEmpresa: 'Test', totalCeldas: 0, celdasOcupadas: 0, celdasLibres: 0 }];
      vistasServiceSpy.getOcupacion.and.returnValue(of(ocupacionConCero));

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.promedioOcupacion).toBe(0); // 0/0 devuelve 0, no NaN
    });

    it('Camino 5: Debería calcular correctamente con datos parciales (solo historial)', () => {
      // Arrange — solo historial tiene datos, el resto vacío
      vistasServiceSpy.getHistorialReservas.and.returnValue(of(mockHistorial()));

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.totalReservas).toBe(2);
      expect(component.ingresosTotal).toBe(0);
      expect(component.facturacionTotal).toBe(0);
      expect(component.promedioOcupacion).toBe(0);
    });

  });

});

// Emanuel
const ocupacionMock = [{ totalCeldas: 10, celdasOcupadas: 3 }];
const historialMock = [
  {
    idReserva: 1,
    placa: 'ABC123',
    tipoVehiculo: 'AUTOMOVIL',
    idCelda: 12,
    parqueadero: 'P1',
    fechaEntrada: '2026-03-23T10:00:00Z',
    fechaSalida: '2026-03-23T11:00:00Z',
    estado: 'CERRADA',
  },
];
const ingresosMock = [{ totalIngresos: 200000 }];
const facturacionMock = [{ monto: 120000 }];

describe('VistasComponent', () => {
  let component: VistasComponent;
  let authService: jasmine.SpyObj<AuthService>;
  let vistasService: jasmine.SpyObj<VistasService>;

  const initComponent = () => {
    const fixture = TestBed.createComponent(VistasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getUsuarioActual']);
    const vistasSpy = jasmine.createSpyObj<VistasService>('VistasService', [
      'getOcupacion',
      'getHistorialReservas',
      'getIngresos',
      'getFacturacion',
    ]);

    await TestBed.configureTestingModule({
      imports: [VistasComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: VistasService, useValue: vistasSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    vistasService = TestBed.inject(VistasService) as jasmine.SpyObj<VistasService>;

    authService.getUsuarioActual.and.returnValue({ idEmpresa: 1 } as any);
    vistasService.getOcupacion.and.returnValue(of(ocupacionMock as any));
    vistasService.getHistorialReservas.and.returnValue(of(historialMock as any));
    vistasService.getIngresos.and.returnValue(of(ingresosMock as any));
    vistasService.getFacturacion.and.returnValue(of(facturacionMock as any));
  });

  it('debe cargar ocupacion por empresa al iniciar', () => {
    // Act
    initComponent();

    // Assert
    expect(vistasService.getOcupacion).toHaveBeenCalledWith(1);
    expect(vistasService.getHistorialReservas).toHaveBeenCalledWith(1);
    expect(vistasService.getIngresos).toHaveBeenCalledWith(1);
    expect(vistasService.getFacturacion).toHaveBeenCalledWith(1);
  });

  it('debe calcular promedio de ocupacion', () => {
    // Act
    initComponent();

    // Assert
    expectOcupacionDashboard({
      promedioOcupacion: component.promedioOcupacion,
      totalReservas: component.totalReservas,
      ingresosTotal: component.ingresosTotal,
      facturacionTotal: component.facturacionTotal,
    })
      .toHavePromedio(30)
      .toHaveTotales({
        totalReservas: 1,
        ingresosTotal: 200000,
        facturacionTotal: 120000,
      });
  });

  it('no debe consultar vistas si no hay empresa autenticada', () => {
    // Arrange
    authService.getUsuarioActual.and.returnValue(null as any);

    // Act
    initComponent();

    // Assert
    expect(vistasService.getOcupacion).not.toHaveBeenCalled();
  });

  it('debe limpiar historial cuando falla su consulta', () => {
    // Arrange
    vistasService.getHistorialReservas.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    initComponent();

    // Assert
    expect(component.historial).toEqual([]);
  });

  it('debe limpiar ingresos cuando falla su consulta', () => {
    // Arrange
    vistasService.getIngresos.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    initComponent();

    // Assert
    expect(component.ingresos).toEqual([]);
  });

  it('debe limpiar facturacion cuando falla su consulta', () => {
    // Arrange
    vistasService.getFacturacion.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    initComponent();

    // Assert
    expect(component.facturacion).toEqual([]);
  });

  it('debe manejar ocupacion con total de celdas en cero y montos nulos', () => {
    // Arrange
    vistasService.getOcupacion.and.returnValue(of([{ totalCeldas: 0, celdasOcupadas: 5 }] as any));
    vistasService.getIngresos.and.returnValue(of([{ totalIngresos: undefined }] as any));
    vistasService.getFacturacion.and.returnValue(of([{ monto: undefined }] as any));

    // Act
    initComponent();

    // Assert
    expectOcupacionDashboard({
      promedioOcupacion: component.promedioOcupacion,
      totalReservas: component.totalReservas,
      ingresosTotal: component.ingresosTotal,
      facturacionTotal: component.facturacionTotal,
    })
      .toHavePromedio(0)
      .toHaveTotales({
        totalReservas: component.totalReservas,
        ingresosTotal: 0,
        facturacionTotal: 0,
      });
  });
});