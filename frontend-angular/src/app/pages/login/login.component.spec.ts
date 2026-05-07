import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/autenticacion.service';
import { RolUsuario } from '../../models/shared.model';
import { expectLoginFlow } from '../../testing/fluent-assertions';

const validEmail = 'ema1001cano@gmail.com';
const validSecret = 'abcDEF123';
const invalidEmail = 'ema1010@gmail.com';
const invalidSecret = 'xyzABC987';

describe('LoginComponent - caja negra', () => {
	let component: LoginComponent;
	let authService: jasmine.SpyObj<AuthService>;
	let router: Router;
	let fixture: any;

	beforeEach(async () => {
		const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
			'login',
			'getUsuarioActual',
		]);

		await TestBed.configureTestingModule({
			imports: [LoginComponent],
			providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }],
		}).compileComponents();

		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
		router = TestBed.inject(Router);
		spyOn(router, 'navigate');
		fixture.detectChanges();
	});

	it('debe permitir acceso con credenciales validas', () => {
		// Arrange
		authService.login.and.returnValue(of({ access_token: 'token' }));
		authService.getUsuarioActual.and.returnValue({
			id: 1,
			nombre: '',
			correo: validEmail,
			rol: RolUsuario.ADMINISTRADOR,
			idEmpresa: 1,
		});

		component.loginForm.setValue({
			correo: validEmail,
			contrasena: validSecret,
		});

		// Act
		component.onSubmit();

		// Assert
		expectLoginFlow({
			loginSpy: authService.login as unknown as jasmine.Spy,
			navigateSpy: router.navigate as unknown as jasmine.Spy,
			errorMessage: component.errorMessage,
		})
			.toAttemptWith({
				correo: validEmail,
				contrasena: validSecret,
			})
			.toRedirectTo('/dashboard');
	});

	it('debe redirigir al panel de operador cuando el rol es operador', () => {
		// Arrange
		authService.login.and.returnValue(of({ access_token: 'token' }));
		authService.getUsuarioActual.and.returnValue({
			id: 2,
			nombre: '',
			correo: validEmail,
			rol: RolUsuario.OPERADOR,
			idEmpresa: 1,
		});

		component.loginForm.setValue({
			correo: validEmail,
			contrasena: validSecret,
		});

		// Act
		component.onSubmit();

		// Assert
		expect(router.navigate).toHaveBeenCalledWith(['/operador-dashboard']);
	});

	it('debe redirigir a login cuando no hay rol de usuario', () => {
		// Arrange
		authService.login.and.returnValue(of({ access_token: 'token' }));
		authService.getUsuarioActual.and.returnValue(null as any);

		component.loginForm.setValue({
			correo: validEmail,
			contrasena: validSecret,
		});

		// Act
		component.onSubmit();

		// Assert
		expect(router.navigate).toHaveBeenCalledWith(['/login']);
	});

	it('debe rechazar cuando el correo es invalido', () => {
		// Arrange
		authService.login.and.returnValue(
			throwError(() => new HttpErrorResponse({ status: 401 }))
		);

		component.loginForm.setValue({
			correo: invalidEmail,
			contrasena: validSecret,
		});

		// Act
		component.onSubmit();

		// Assert
		expectLoginFlow({
			loginSpy: authService.login as unknown as jasmine.Spy,
			navigateSpy: router.navigate as unknown as jasmine.Spy,
			errorMessage: component.errorMessage,
		})
			.toAttemptWith({
				correo: invalidEmail,
				contrasena: validSecret,
			})
			.toShowRejectedAccess();
	});

	it('debe limpiar el mensaje de rechazo luego del timeout', fakeAsync(() => {
		// Arrange
		authService.login.and.returnValue(
			throwError(() => new HttpErrorResponse({ status: 401 }))
		);

		component.loginForm.setValue({
			correo: validEmail,
			contrasena: invalidSecret,
		});

		// Act
		component.onSubmit();
		tick(5000);

		// Assert
		expect(component.errorMessage).toBe('');
	}));

	it('debe mostrar error de conexion cuando no hay respuesta del servidor', () => {
		// Arrange
		authService.login.and.returnValue(
			throwError(() => new HttpErrorResponse({ status: 0 }))
		);

		component.loginForm.setValue({
			correo: validEmail,
			contrasena: validSecret,
		});

		// Act
		component.onSubmit();

		// Assert
		expect(component.errorMessage).toContain('Error de conexion');
	});

	it('debe mostrar error de datos invalidos para status 400', () => {
		// Arrange
		authService.login.and.returnValue(
			throwError(() => new HttpErrorResponse({ status: 400 }))
		);
		component.loginForm.setValue({ correo: validEmail, contrasena: validSecret });

		// Act
		component.onSubmit();

		// Assert
		expect(component.errorMessage).toContain('Datos invalidos');
	});

	it('debe mostrar error de servidor para status 500', () => {
		// Arrange
		authService.login.and.returnValue(
			throwError(() => new HttpErrorResponse({ status: 500 }))
		);
		component.loginForm.setValue({ correo: validEmail, contrasena: validSecret });

		// Act
		component.onSubmit();

		// Assert
		expect(component.errorMessage).toContain('Error del servidor');
	});

	it('debe validar campos vacios', () => {
		// Arrange
		component.loginForm.setValue({
			correo: '',
			contrasena: '',
		});

		// Act
		component.onSubmit();

		// Assert
		expect(authService.login).not.toHaveBeenCalled();
	});
});