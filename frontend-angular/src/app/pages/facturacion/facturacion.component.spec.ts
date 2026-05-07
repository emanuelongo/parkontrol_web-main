import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core'; // Para evitar errores de componentes de Material
import { FacturacionComponent } from './facturacion.component';
import { FacturacionService } from '../../services/facturacion.service';
import { AuthService } from '../../services/autenticacion.service';
import { VistasService } from '../../services/vistas.service';
import { ClienteFactura } from '../../models/facturacion.model';
import { expectFacturaCreationFlow } from '../../testing/fluent-assertions';

describe('FacturacionComponent - HU-32: Listar clientes de facturación', () => {
  let component: FacturacionComponent;
  let fixture: ComponentFixture<FacturacionComponent>;
  
  let facturacionServiceSpy: jasmine.SpyObj<FacturacionService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let vistasServiceSpy: jasmine.SpyObj<VistasService>;

  const mockClientes: ClienteFactura[] = [
    { id: 1, nombre: 'Cliente Test', numeroDocumento: '123' } as any
  ];

  beforeEach(async () => {
    facturacionServiceSpy = jasmine.createSpyObj('FacturacionService', [
      'obtenerClientesFactura', 
      'crearFactura', 
      'crearClienteFactura'
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUsuarioActual']);
    vistasServiceSpy = jasmine.createSpyObj('VistasService', ['getFacturacion']);

    await TestBed.configureTestingModule({
      imports: [FacturacionComponent],
      providers: [
        { provide: FacturacionService, useValue: facturacionServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: VistasService, useValue: vistasServiceSpy }
      ],
      // SOLUCIÓN SIN PAQUETES DE ANIMACIONES:
      // Ignoramos los errores de etiquetas personalizadas de Material (mat-tab, mat-icon)
      schemas: [NO_ERRORS_SCHEMA] 
    }).compileComponents();

    fixture = TestBed.createComponent(FacturacionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- PRUEBA CAMINO 1 (ÉXITO) ---
  it('Camino 1: Debería asignar clientesFactura cuando el servicio responde con éxito', () => {
    facturacionServiceSpy.obtenerClientesFactura.and.returnValue(of(mockClientes));
    
    component.cargarClientesFactura();

    expect(component.clientesFactura).toEqual(mockClientes);
    expect(component.clientesFactura.length).toBe(1);
  });

  // --- PRUEBA CAMINO ERROR ---
  it('Debería limpiar clientesFactura cuando el servicio falla', () => {
    facturacionServiceSpy.obtenerClientesFactura.and.returnValue(throwError(() => new Error('Error')));

    component.cargarClientesFactura();

    expect(component.clientesFactura).toEqual([]);
  });

  // --- COBERTURA validarPeticiones ---
  it('debería finalizar el estado loading al completar todas las peticiones', () => {
    component.loading = true;
    component.peticionesCompletadas = 1; 
    component.totalPeticiones = 2;

    (component as any).validarPeticiones();

    expect(component.peticionesCompletadas).toBe(2);
    expect(component.loading).toBeFalse();
  });

  // --- COBERTURA ngOnInit ---
  it('debería configurar idEmpresa e iniciar cargas si el usuario existe', () => {
    const mockUsuario = { idEmpresa: 55 };
    authServiceSpy.getUsuarioActual.and.returnValue(mockUsuario as any);
    
    // Espiamos los métodos para verificar que ngOnInit los dispara
    spyOn(component, 'cargarClientesFactura');
    spyOn(component, 'cargarFacturas');

    component.ngOnInit();

    expect(component.idEmpresa).toBe(55);
    expect(component.loading).toBeTrue();
    expect(component.cargarClientesFactura).toHaveBeenCalled();
  });
});

const facturaDto = { idPago: 40903, idClienteFactura: 1, cufe: 'CUFE-1', urlPdf: 'http://pdf' };

describe('FacturacionComponent', () => {
  let component: FacturacionComponent;
  let facturacionService: jasmine.SpyObj<FacturacionService>;
  let authService: jasmine.SpyObj<AuthService>;
  let vistasService: jasmine.SpyObj<VistasService>;

  const initComponent = () => {
    const fixture = TestBed.createComponent(FacturacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    const facturacionSpy = jasmine.createSpyObj<FacturacionService>('FacturacionService', [
      'obtenerClientesFactura',
      'crearFactura',
      'crearClienteFactura',
    ]);
    const authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getUsuarioActual']);
    const vistasSpy = jasmine.createSpyObj<VistasService>('VistasService', ['getFacturacion']);

    await TestBed.configureTestingModule({
      imports: [FacturacionComponent],
      providers: [
        { provide: FacturacionService, useValue: facturacionSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: VistasService, useValue: vistasSpy },
      ],
    }).compileComponents();

    facturacionService = TestBed.inject(FacturacionService) as jasmine.SpyObj<FacturacionService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    vistasService = TestBed.inject(VistasService) as jasmine.SpyObj<VistasService>;

    authService.getUsuarioActual.and.returnValue({ idEmpresa: 1 } as any);
    facturacionService.obtenerClientesFactura.and.returnValue(of([]));
    vistasService.getFacturacion.and.returnValue(of([]));

  });

  it('debe cargar clientes y facturas en init cuando hay empresa', () => {
    // Act
    initComponent();

    // Assert
    expect(facturacionService.obtenerClientesFactura).toHaveBeenCalled();
    expect(vistasService.getFacturacion).toHaveBeenCalledWith(1);
  });

  it('debe crear factura y mostrar mensaje de exito', fakeAsync(() => {
    // Arrange
    initComponent();
    facturacionService.crearFactura.and.returnValue(of({ id: 1 } as any));

    // Act
    component.onCrearFactura(facturaDto as any);
    expectFacturaCreationFlow({
      createFacturaSpy: facturacionService.crearFactura as unknown as jasmine.Spy,
      mensajeExito: component.mensajeExito,
      errorMessage: component.errorMessage,
    })
      .toAttemptCreateWith(facturaDto)
      .toShowSuccessContaining('Factura creada');
    tick(4000);

    // Assert
    expectFacturaCreationFlow({
      createFacturaSpy: facturacionService.crearFactura as unknown as jasmine.Spy,
      mensajeExito: component.mensajeExito,
      errorMessage: component.errorMessage,
    }).toClearSuccess();
  }));

  it('debe manejar error al crear factura', fakeAsync(() => {
    // Arrange
    initComponent();
    facturacionService.crearFactura.and.returnValue(throwError(() => ({ status: 400 })));

    // Act
    component.onCrearFactura(facturaDto as any);
    expectFacturaCreationFlow({
      createFacturaSpy: facturacionService.crearFactura as unknown as jasmine.Spy,
      mensajeExito: component.mensajeExito,
      errorMessage: component.errorMessage,
    })
      .toAttemptCreateWith(facturaDto)
      .toShowErrorContaining('Error al crear la factura');
    tick(4000);

    // Assert
    expectFacturaCreationFlow({
      createFacturaSpy: facturacionService.crearFactura as unknown as jasmine.Spy,
      mensajeExito: component.mensajeExito,
      errorMessage: component.errorMessage,
    }).toClearError();
  }));

  it('no debe crear factura si no hay empresa activa', () => {
    // Arrange
    authService.getUsuarioActual.and.returnValue(null as any);
    initComponent();

    // Act
    component.onCrearFactura(facturaDto as any);

    // Assert
    expect(facturacionService.crearFactura).not.toHaveBeenCalled();
  });

  it('debe crear cliente de facturacion y mostrar mensaje de exito', fakeAsync(() => {
    // Arrange
    initComponent();
    facturacionService.crearClienteFactura.and.returnValue(
      of({ id: 5, numeroDocumento: '123456' } as any)
    );

    // Act
    component.onClienteCreado({
      tipoDocumento: 'CC',
      numeroDocumento: '123456',
      correo: 'cliente@correo.com',
    });

    // Assert
    expect(component.mensajeExito).toContain('123456');
    tick(4000);
    expect(component.mensajeExito).toBe('');
  }));

  it('debe finalizar carga cuando falla la consulta inicial', () => {
    // Arrange
    facturacionService.obtenerClientesFactura.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    initComponent();

    // Assert
    expect(component.loading).toBeFalse();
    expect(component.clientesFactura).toEqual([]);
  });

  it('debe limpiar facturas cuando falla su consulta inicial', () => {
    // Arrange
    vistasService.getFacturacion.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    initComponent();

    // Assert
    expect(component.facturas).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  it('debe finalizar loading cuando falla crear cliente de facturacion', () => {
    // Arrange
    initComponent();
    facturacionService.crearClienteFactura.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    component.onClienteCreado({ tipoDocumento: 'CC', numeroDocumento: '123', correo: 'x@y.com' });

    // Assert
    expect(component.loading).toBeFalse();
  });

  it('no debe crear cliente de facturacion si no hay empresa activa', () => {
    // Arrange
    authService.getUsuarioActual.and.returnValue(null as any);
    initComponent();

    // Act
    component.onClienteCreado({ tipoDocumento: 'CC', numeroDocumento: '123', correo: 'x@y.com' });

    // Assert
    expect(facturacionService.crearClienteFactura).not.toHaveBeenCalled();
  });

  it('no debe consultar facturas si idEmpresa es nulo al cargar facturas', () => {
    // Arrange
    initComponent();
    component.idEmpresa = null;

    // Act
    component.cargarFacturas();

    // Assert
    expect(vistasService.getFacturacion).toHaveBeenCalledTimes(1);
  });
});