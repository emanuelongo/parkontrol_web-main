import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CeldasComponent } from './celdas.component';
import { CeldasService } from '../../services/celdas.service';
import { ParqueaderosService } from '../../services/parqueaderos.service';
import { AuthService } from '../../services/autenticacion.service';
import { MatDialog } from '@angular/material/dialog';
import { Celda } from '../../models/celda.model';
import { expectCeldaCreationFlow } from '../../testing/fluent-assertions';


describe('CeldasComponent - HU-09', () => {
  let component: CeldasComponent;
  let fixture: ComponentFixture<CeldasComponent>;
  let celdasServiceSpy: jasmine.SpyObj<CeldasService>;

  const mockCeldas: Celda[] = [
    { 
      id: 1, 
      estado: 'LIBRE', 
      tipoCelda: { id: 1, nombre: 'Carro' }, 
      sensor: { id: 1, estado: 'ACTIVO' } 
    } as any
  ];

  beforeEach(async () => {
    const celdasSpy = jasmine.createSpyObj('CeldasService', ['getByParqueadero']);
    const parqueaderosSpy = jasmine.createSpyObj('ParqueaderosService', ['getByEmpresa']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUsuarioActual', 'isAdministrador']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [CeldasComponent],
      providers: [
        { provide: CeldasService, useValue: celdasSpy },
        { provide: ParqueaderosService, useValue: parqueaderosSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CeldasComponent);
    component = fixture.componentInstance;
    celdasServiceSpy = TestBed.inject(CeldasService) as jasmine.SpyObj<CeldasService>;
  });

  it('Camino 1: Debería cargar las celdas correctamente (Éxito)', () => {
    celdasServiceSpy.getByParqueadero.and.returnValue(of(mockCeldas));

    // Ejecutamos la función
    (component as any).cargarCeldas(1);

    expect(component.loading).toBeFalse();
    expect(component.celdas).toEqual(mockCeldas);
    expect(component.celdasFiltradas.length).toBe(1);
  });

  it('Camino 2: Debería manejar el error cuando no cargan las celdas (Fallo)', () => {
    celdasServiceSpy.getByParqueadero.and.returnValue(throwError(() => ({ status: 500 })));
    spyOn(console, 'error');

    (component as any).cargarCeldas(1);

    expect(component.loading).toBeFalse();
    expect(component.celdas.length).toBe(0);
    expect(console.error).toHaveBeenCalledWith('Error no cargaron las celdas', jasmine.any(Object));
  });
});

// Emanuel

const parqueaderosMock = [{ id: 321, nombre: 'P1' }];

describe('CeldasComponent', () => {
  let component: CeldasComponent;
  let celdasService: jasmine.SpyObj<CeldasService>;
  let parqueaderosService: jasmine.SpyObj<ParqueaderosService>;
  let authService: jasmine.SpyObj<AuthService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);

  beforeEach(async () => {
    const celdasSpy = jasmine.createSpyObj<CeldasService>('CeldasService', [
      'getByParqueadero',
      'create',
      'updateEstado',
    ]);
    const parqueaderosSpy = jasmine.createSpyObj<ParqueaderosService>('ParqueaderosService', [
      'getByEmpresa',
    ]);
    const authSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'getUsuarioActual',
      'isAdministrador',
    ]);
    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialogRefSpy.afterClosed.and.returnValue(of(null));
    dialogSpy.open.and.returnValue(dialogRefSpy);

    await TestBed.configureTestingModule({
      imports: [CeldasComponent],
      providers: [
        { provide: CeldasService, useValue: celdasSpy },
        { provide: ParqueaderosService, useValue: parqueaderosSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CeldasComponent);
    component = fixture.componentInstance;
    celdasService = TestBed.inject(CeldasService) as jasmine.SpyObj<CeldasService>;
    parqueaderosService = TestBed.inject(ParqueaderosService) as jasmine.SpyObj<ParqueaderosService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    authService.getUsuarioActual.and.returnValue({ idEmpresa: 1 } as any);
    authService.isAdministrador.and.returnValue(true);
    parqueaderosService.getByEmpresa.and.returnValue(of(parqueaderosMock as any));
    celdasService.getByParqueadero.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('debe cargar parqueaderos y celdas al iniciar', () => {
    // Assert
    expect(parqueaderosService.getByEmpresa).toHaveBeenCalled();
    expect(celdasService.getByParqueadero).toHaveBeenCalledWith(321);
  });

  it('debe recargar celdas al cambiar parqueadero', () => {
    // Act
    component.onParqueaderoCambia(777);

    // Assert
    expect(celdasService.getByParqueadero).toHaveBeenCalledWith(777);
  });

  it('debe abrir modal de creacion', () => {
    // Act
    component.abrirModalCrear();

    // Assert
    expect(dialog.open).toHaveBeenCalled();
  });

  it('debe crear celda cuando el modal retorna datos', () => {
    // Arrange
    dialogRefSpy.afterClosed.and.returnValue(of({ idParqueadero: 321, tipoCelda: 1 } as any));
    celdasService.create.and.returnValue(of({ id: 1 } as any));

    // Act
    component.abrirModalCrear();

    // Assert
    expectCeldaCreationFlow({
      createSpy: celdasService.create as unknown as jasmine.Spy,
      refreshSpy: celdasService.getByParqueadero as unknown as jasmine.Spy,
      errorMessage: component.errorMessage,
    }).toCreateCelda();
  });

  it('debe mostrar error al crear celda con tipo invalido', fakeAsync(() => {
    // Arrange
    celdasService.create.and.returnValue(
      throwError(() => ({ status: 404, error: { message: 'tipo' } }))
    );

    // Act
    (component as any).crearCelda({});
    expectCeldaCreationFlow({
      createSpy: celdasService.create as unknown as jasmine.Spy,
      refreshSpy: celdasService.getByParqueadero as unknown as jasmine.Spy,
      errorMessage: component.errorMessage,
    }).toShowErrorContaining('tipo de celda');
    tick(5000);

    // Assert
    expectCeldaCreationFlow({
      createSpy: celdasService.create as unknown as jasmine.Spy,
      refreshSpy: celdasService.getByParqueadero as unknown as jasmine.Spy,
      errorMessage: component.errorMessage,
    })
      .toCreateCelda()
      .toHaveNoError();
  }));

  it('debe mostrar error al crear celda con sensor invalido', () => {
    // Arrange
    celdasService.create.and.returnValue(
      throwError(() => ({ status: 404, error: { message: 'sensor' } }))
    );

    // Act
    (component as any).crearCelda({});

    // Assert
    expect(component.errorMessage).toContain('sensor');
  });

  it('debe recargar listado al crear celda exitosamente', () => {
    // Arrange
    celdasService.create.and.returnValue(of({ id: 1 } as any));

    // Act
    (component as any).crearCelda({ idParqueadero: 321, tipoCelda: 1 });

    // Assert
    expectCeldaCreationFlow({
      createSpy: celdasService.create as unknown as jasmine.Spy,
      refreshSpy: celdasService.getByParqueadero as unknown as jasmine.Spy,
      errorMessage: component.errorMessage,
    })
      .toHaveNoError()
      .toRefreshParqueadero(321);
  });

  it('no debe cargar parqueaderos si no hay usuario autenticado', () => {
    // Arrange
    authService.getUsuarioActual.and.returnValue(null as any);

    // Act
    component.ngOnInit();

    // Assert
    expect(parqueaderosService.getByEmpresa).toHaveBeenCalledTimes(1);
  });

  it('debe finalizar loading cuando no hay parqueaderos', () => {
    // Arrange
    parqueaderosService.getByEmpresa.and.returnValue(of([] as any));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.loading).toBeFalse();
  });

  it('debe detener loading cuando falla la carga de parqueaderos', () => {
    // Arrange
    parqueaderosService.getByEmpresa.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.loading).toBeFalse();
  });

  it('debe actualizar estado de celda y recargar listado', () => {
    // Arrange
    celdasService.updateEstado.and.returnValue(of({} as any));

    // Act
    component.cambiarEstado({ id: 10 } as any, 'OCUPADA');

    // Assert
    expect(celdasService.updateEstado).toHaveBeenCalledWith(10, 'OCUPADA');
    expect(celdasService.getByParqueadero).toHaveBeenCalledWith(321);
  });

  it('debe limpiar listas si falla carga de celdas por parqueadero', () => {
    // Arrange
    component.celdas = [{ id: 1 } as any];
    component.celdasFiltradas = [{ id: 1 } as any];
    celdasService.getByParqueadero.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    component.onParqueaderoCambia(321);

    // Assert
    expect(component.celdas).toEqual([]);
    expect(component.celdasFiltradas).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  it('debe mostrar error generico al crear celda cuando status 404 no coincide con tipo o sensor', () => {
    // Arrange
    celdasService.create.and.returnValue(
      throwError(() => ({ status: 404, error: { message: 'otro error' } }))
    );

    // Act
    (component as any).crearCelda({ idParqueadero: 321, tipoCelda: 1 });

    // Assert
    expect(component.errorMessage).toContain('Error al crear la celda');
  });

  it('debe mostrar error generico al crear celda', () => {
    // Arrange
    celdasService.create.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    (component as any).crearCelda({ idParqueadero: 321, idTipoCelda: 1, idSensor: 1, estado: 'LIBRE' });

    // Assert
    expect(component.errorMessage).toContain('Error al crear la celda');
  });
});