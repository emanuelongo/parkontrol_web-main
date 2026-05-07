import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReservasComponent } from './reservas.component';
import { ReservasService } from '../../services/reservas.service';
import { ParqueaderosService } from '../../services/parqueaderos.service';
import { AuthService } from '../../services/autenticacion.service';
import { PagosService } from '../../services/pagos.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CrearReservaDto } from '../../models/reserva.model';
import { expectReservaFinalizacionFlow } from '../../testing/fluent-assertions';

describe('ReservasComponent - Pruebas Front Crear Reserva', () => {
  let component: ReservasComponent;
  let fixture: ComponentFixture<ReservasComponent>;

  let reservasServiceSpy: jasmine.SpyObj<ReservasService>;
  let parqueaderosServiceSpy: jasmine.SpyObj<ParqueaderosService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const usuarioMock = { id: 1, idEmpresa: 1, nombre: 'Admin' };
  const parqueaderosMock = [{ id: 10, nombre: 'Parqueadero Test', capacidadTotal: 10, ubicacion: 'Centro', idEmpresa: 1 }];
  const reservaDataMock: CrearReservaDto = { idVehiculo: 1, idCelda: 5, estado: 'ABIERTA' };

  beforeEach(async () => {
    // Arrange: Crear los spies (dobles)
    reservasServiceSpy = jasmine.createSpyObj('ReservasService', ['getByParqueadero', 'create']);
    parqueaderosServiceSpy = jasmine.createSpyObj('ParqueaderosService', ['getByEmpresa']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUsuarioActual']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    authServiceSpy.getUsuarioActual.and.returnValue(usuarioMock as any);
    parqueaderosServiceSpy.getByEmpresa.and.returnValue(of(parqueaderosMock as any));
    reservasServiceSpy.getByParqueadero.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReservasComponent, MatDialogModule ],
      providers: [
        { provide: ReservasService, useValue: reservasServiceSpy },
        { provide: ParqueaderosService, useValue: parqueaderosServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PagosService, useValue: jasmine.createSpyObj('PagosService', ['create']) },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasComponent);
    component = fixture.componentInstance;

    spyOn(console, 'log');
    spyOn(console, 'error');
  });

  // ============================
  // ngOnInit y carga inicial
  // ============================
  it('ngOnInit debería cargar parqueaderos y reservas', fakeAsync(() => {
    // Act
    component.ngOnInit();
    tick();

    // Assert
    expect(parqueaderosServiceSpy.getByEmpresa).toHaveBeenCalledWith(usuarioMock.idEmpresa);
    expect(component.parqueaderos.length).toBe(1);
    expect(component.parqueaderoSeleccionado).toBe(parqueaderosMock[0].id);
    expect(reservasServiceSpy.getByParqueadero).toHaveBeenCalledWith(parqueaderosMock[0].id);
  }));

  // ============================
  // Cambio de parqueadero
  // ============================
  it('onParqueaderoCambia debería actualizar parqueadero y recargar reservas', fakeAsync(() => {
    // Act
    component.onParqueaderoCambia(10);
    tick();

    // Assert
    expect(component.parqueaderoSeleccionado).toBe(10);
    expect(reservasServiceSpy.getByParqueadero).toHaveBeenCalledWith(10);
  }));

  // ============================
  // Abrir modal y crear reserva - éxito
  // ============================
  it('abrirModalCrear crea reserva correctamente', fakeAsync(() => {
    // Arrange
    dialogSpy.open.and.returnValue({ afterClosed: () => of(reservaDataMock) } as any);
    reservasServiceSpy.create.and.returnValue(of({} as any));
    component.parqueaderoSeleccionado = 10;

    // Act
    component.abrirModalCrear();
    tick();
    tick();

    // Assert
    expect(reservasServiceSpy.create).toHaveBeenCalledWith(reservaDataMock);
    expect(reservasServiceSpy.getByParqueadero).toHaveBeenCalledWith(10);
    expect(console.log).toHaveBeenCalledWith('Reserva creada exitosamente');
  }));

  // ============================
  // Modal cerrado sin crear
  // ============================
  it('abrirModalCrear no crea reserva si modal se cierra', fakeAsync(() => {
    // Arrange
    dialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as any);
    component.parqueaderoSeleccionado = 10;

    // Act
    component.abrirModalCrear();
    tick();

    // Assert
    expect(reservasServiceSpy.create).not.toHaveBeenCalled();
  }));

  // ============================
  // Error 400 celda ocupada
  // ============================
  it('crearReserva muestra error si celda ocupada', fakeAsync(() => {
    // Arrange
    const errorMsg = { status: 400, error: { message: 'La celda no está LIBRE' } };
    reservasServiceSpy.create.and.returnValue(throwError(() => errorMsg));

    // Act
    (component as any).crearReserva(reservaDataMock);

    // Assert
    expect(component.errorMessage).toBe('La celda seleccionada esta OCUPADA');

    tick(5000);
    expect(component.errorMessage).toBe('');
  }));

  // ============================
  // Error genérico
  // ============================
  it('crearReserva muestra error genérico si falla backend', fakeAsync(() => {
    // Arrange
    reservasServiceSpy.create.and.returnValue(throwError(() => new Error('Server Error')));

    // Act
    (component as any).crearReserva(reservaDataMock);

    // Assert
    expect(component.errorMessage).toBe('Error no pudo crear la reserva');

    tick(5000);
    expect(component.errorMessage).toBe('');
  }));

  // ============================
  // getEstadoColor
  // ============================
  it('getEstadoColor retorna azul para ABIERTA y verde para otra', () => {
    expect(component.getEstadoColor('ABIERTA')).toBe('#2196f3');
    expect(component.getEstadoColor('CERRADA')).toBe('#4caf50');
  });
});

const parqueaderosMock = [{ id: 321, nombre: 'P1' }];

describe('ReservasComponent', () => {
  let component: ReservasComponent;
  let reservasService: jasmine.SpyObj<ReservasService>;
  let parqueaderosService: jasmine.SpyObj<ParqueaderosService>;
  let authService: jasmine.SpyObj<AuthService>;
  let pagosService: jasmine.SpyObj<PagosService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);

  beforeEach(async () => {
    const reservasSpy = jasmine.createSpyObj<ReservasService>('ReservasService', [
      'getByParqueadero',
      'create',
      'finalizar',
    ]);
    const parqueaderosSpy = jasmine.createSpyObj<ParqueaderosService>('ParqueaderosService', [
      'getByEmpresa',
    ]);
    const authSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'getUsuarioActual',
    ]);
    const pagosSpy = jasmine.createSpyObj<PagosService>('PagosService', ['create']);
    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialogRefSpy.afterClosed.and.returnValue(of({ idReserva: 41602 }));
    dialogSpy.open.and.returnValue(dialogRefSpy);

    await TestBed.configureTestingModule({
      imports: [ReservasComponent],
      providers: [
        { provide: ReservasService, useValue: reservasSpy },
        { provide: ParqueaderosService, useValue: parqueaderosSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: PagosService, useValue: pagosSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ReservasComponent);
    component = fixture.componentInstance;
    reservasService = TestBed.inject(ReservasService) as jasmine.SpyObj<ReservasService>;
    parqueaderosService = TestBed.inject(ParqueaderosService) as jasmine.SpyObj<ParqueaderosService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    pagosService = TestBed.inject(PagosService) as jasmine.SpyObj<PagosService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    authService.getUsuarioActual.and.returnValue({ idEmpresa: 1 } as any);
    parqueaderosService.getByEmpresa.and.returnValue(of(parqueaderosMock as any));
    reservasService.getByParqueadero.and.returnValue(of([]));
    pagosService.create.and.returnValue(of({ monto: 100 } as any));

    fixture.detectChanges();
  });

  it('debe cargar parqueaderos y reservas al iniciar', () => {
    // Assert
    expect(parqueaderosService.getByEmpresa).toHaveBeenCalled();
    expect(reservasService.getByParqueadero).toHaveBeenCalledWith(321);
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

  it('debe finalizar loading cuando falla carga de parqueaderos', () => {
    // Arrange
    parqueaderosService.getByEmpresa.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.loading).toBeFalse();
  });

  it('no debe abrir modal de crear si no hay parqueadero seleccionado', () => {
    // Arrange
    component.parqueaderoSeleccionado = null;

    // Act
    component.abrirModalCrear();

    // Assert
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('debe procesar pago al finalizar reserva', () => {
    // Act
    component.finalizarReserva({ id: 41602 } as any);

    // Assert
    expectReservaFinalizacionFlow({
      openDialogSpy: dialog.open as unknown as jasmine.Spy,
      createPagoSpy: pagosService.create as unknown as jasmine.Spy,
    })
      .toOpenDialog()
      .toProcessPayment();
  });

  it('debe abrir modal de crear y crear reserva si el modal retorna datos', () => {
    // Arrange
    dialogRefSpy.afterClosed.and.returnValue(of({ idVehiculo: 1, idCelda: 2, estado: 'ABIERTA' } as any));
    reservasService.create.and.returnValue(of({ id: 99 } as any));

    // Act
    component.abrirModalCrear();

    // Assert
    expect(dialog.open).toHaveBeenCalled();
    expect(reservasService.create).toHaveBeenCalled();
  });

  it('debe manejar error en procesar pago', fakeAsync(() => {
    // Arrange
    pagosService.create.and.returnValue(throwError(() => ({ status: 400, error: { message: 'ABIERTA' } })));

    // Act
    (component as any).procesarPago({ idReserva: 41602 });
    expect(component.errorMessage).toContain('ABIERTA');
    tick(4000);

    // Assert
    expect(component.errorMessage).toBe('');
  }));

  it('debe mostrar mensaje de exito al procesar pago valido', fakeAsync(() => {
    // Arrange
    pagosService.create.and.returnValue(of({ monto: 100 } as any));

    // Act
    (component as any).procesarPago({ idReserva: 41602 });

    // Assert
    expect(component.mensajeExito).toContain('Pago procesado exitosamente');
    tick(3000);
    expect(component.mensajeExito).toBe('');
  }));

  it('debe mostrar mensaje cuando ya existe un pago', () => {
    // Arrange
    pagosService.create.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'existe un pago' } }))
    );

    // Act
    (component as any).procesarPago({ idReserva: 41602, idMetodoPago: 1 });

    // Assert
    expect(component.errorMessage).toContain('Ya existe un pago registrado');
  });

  it('debe recargar reservas al cambiar parqueadero', () => {
    // Act
    component.onParqueaderoCambia(999);

    // Assert
    expect(reservasService.getByParqueadero).toHaveBeenCalledWith(999);
  });

  it('debe limpiar reservas si falla la carga por parqueadero', () => {
    // Arrange
    component.reservas = [{ id: 1 } as any];
    reservasService.getByParqueadero.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    component.onParqueaderoCambia(999);

    // Assert
    expect(component.reservas).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  it('debe crear reserva y recargar listado', () => {
    // Arrange
    reservasService.create.and.returnValue(of({ id: 55 } as any));

    // Act
    (component as any).crearReserva({ idVehiculo: 1, idCelda: 2, estado: 'ABIERTA' });

    // Assert
    expect(reservasService.create).toHaveBeenCalled();
    expect(reservasService.getByParqueadero).toHaveBeenCalledWith(321);
  });

  it('debe mostrar error de celda ocupada al crear reserva', fakeAsync(() => {
    // Arrange
    reservasService.create.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'LIBRE' } }))
    );

    // Act
    (component as any).crearReserva({ idVehiculo: 1, idCelda: 2, estado: 'ABIERTA' });
    expect(component.errorMessage).toContain('OCUPADA');
    tick(5000);

    // Assert
    expect(component.errorMessage).toBe('');
  }));

  it('debe mostrar error de datos al crear reserva con status 400 distinto de LIBRE', fakeAsync(() => {
    // Arrange
    reservasService.create.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'otra validacion' } }))
    );

    // Act
    (component as any).crearReserva({ idVehiculo: 1, idCelda: 2, estado: 'ABIERTA' });
    expect(component.errorMessage).toContain('Error en los datos de la reserva');
    tick(5000);

    // Assert
    expect(component.errorMessage).toBe('');
  }));

  it('debe mostrar error generico al crear reserva con status distinto', fakeAsync(() => {
    // Arrange
    reservasService.create.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    (component as any).crearReserva({ idVehiculo: 1, idCelda: 2, estado: 'ABIERTA' });
    expect(component.errorMessage).toContain('no pudo crear la reserva');
    tick(5000);

    // Assert
    expect(component.errorMessage).toBe('');
  }));

  it('debe mostrar error cuando no existe metodo de pago', () => {
    // Arrange
    pagosService.create.and.returnValue(
      throwError(() => ({ status: 404, error: { message: 'método de pago' } }))
    );

    // Act
    (component as any).procesarPago({ idReserva: 41602, idMetodoPago: 99 });

    // Assert
    expect(component.errorMessage).toContain('No existe un metodo pago');
  });

  it('debe mostrar error cuando id de metodo de pago no existe en status 400', () => {
    // Arrange
    pagosService.create.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'No existe método de pago' } }))
    );

    // Act
    (component as any).procesarPago({ idReserva: 41602, idMetodoPago: 999 });

    // Assert
    expect(component.errorMessage).toContain('No existe un metodo pago con el Id');
  });

  it('debe mostrar error por tarifa inexistente', () => {
    // Arrange
    pagosService.create.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'tarifa' } }))
    );

    // Act
    (component as any).procesarPago({ idReserva: 41602, idMetodoPago: 1 });

    // Assert
    expect(component.errorMessage).toContain('No existe una tarifa');
  });

  it('debe mostrar error generico al procesar pago', () => {
    // Arrange
    pagosService.create.and.returnValue(throwError(() => ({ status: 500 })));

    // Act
    (component as any).procesarPago({ idReserva: 41602, idMetodoPago: 1 });

    // Assert
    expect(component.errorMessage).toContain('Error no pudo procesar el pago');
  });

  it('debe retornar color azul para reserva ABIERTA', () => {
    // Act
    const color = component.getEstadoColor('ABIERTA');

    // Assert
    expect(color).toBe('#2196f3');
  });

  it('debe retornar color verde para reserva no ABIERTA', () => {
    // Act
    const color = component.getEstadoColor('CERRADA');

    // Assert
    expect(color).toBe('#4caf50');
  });
});