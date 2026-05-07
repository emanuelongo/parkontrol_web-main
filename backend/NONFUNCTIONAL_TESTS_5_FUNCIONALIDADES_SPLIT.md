# Pruebas no funcionales por funcionalidad (Backend)

## Objetivo
Este documento describe las pruebas no funcionales divididas por tipo de testing y por funcionalidad para backend.

Funcionalidades cubiertas:
- Iniciar sesion
- Crear celda
- Finalizar reserva
- Consultar ocupacion por parqueadero
- Generar factura electronica

Tipos de prueba aplicados a cada funcionalidad:
- API Testing
- Regression Testing
- Security Testing
- Performance Testing

## Donde encontrar los tests
Base path:
- src/nonfunctional

Estructura:
- src/nonfunctional/api-testing
- src/nonfunctional/regression-testing
- src/nonfunctional/security-testing
- src/nonfunctional/performance-testing

### API Testing
- src/nonfunctional/api-testing/auth-login.api.spec.ts
  - Verifica que login retorna access_token con credenciales validas.
- src/nonfunctional/api-testing/celdas-crear.api.spec.ts
  - Verifica que crear celda persiste una celda valida.
- src/nonfunctional/api-testing/reservas-finalizar.api.spec.ts
  - Verifica que finalizar reserva cambia estado a CERRADA y libera celda.
- src/nonfunctional/api-testing/vistas-ocupacion.api.spec.ts
  - Verifica transformacion de llaves de salida en ocupacion por parqueadero.
- src/nonfunctional/api-testing/facturacion-crear-factura.api.spec.ts
  - Verifica que crear factura define enviada=N y conserva CUFE.

### Regression Testing
- src/nonfunctional/regression-testing/auth-login.regression.spec.ts
  - Verifica errores historicos esperados: credenciales invalidas (incluye usuario inexistente).
- src/nonfunctional/regression-testing/celdas-crear.regression.spec.ts
  - Verifica que tipo de celda inexistente sigue fallando.
- src/nonfunctional/regression-testing/reservas-finalizar.regression.spec.ts
  - Verifica NotFoundException para reserva inexistente.
- src/nonfunctional/regression-testing/vistas-ocupacion.regression.spec.ts
  - Verifica respuesta null cuando no hay registros.
- src/nonfunctional/regression-testing/facturacion-crear-factura.regression.spec.ts
  - Verifica que enviada sigue siendo N al crear factura.

### Security Testing
- src/nonfunctional/security-testing/auth-login.security.spec.ts
  - Verifica que el payload de JWT no incluye contrasena.
- src/nonfunctional/security-testing/celdas-crear.security.spec.ts
  - Verifica que no se persiste la celda cuando tipo/sensor no existen.
- src/nonfunctional/security-testing/reservas-finalizar.security.spec.ts
  - Verifica que no se actualiza celda ante reserva inexistente.
- src/nonfunctional/security-testing/vistas-ocupacion.security.spec.ts
  - Verifica consulta parametrizada para evitar concatenacion insegura.
- src/nonfunctional/security-testing/facturacion-crear-factura.security.spec.ts
  - Verifica que no se guarda factura sin cliente valido.

### Performance Testing
- src/nonfunctional/performance-testing/auth-login.performance.spec.ts
  - Verifica login dentro de umbral de tiempo mockeado.
- src/nonfunctional/performance-testing/celdas-crear.performance.spec.ts
  - Verifica creacion de celda dentro de umbral de tiempo mockeado.
- src/nonfunctional/performance-testing/reservas-finalizar.performance.spec.ts
  - Verifica finalizacion de reserva dentro de umbral de tiempo mockeado.
- src/nonfunctional/performance-testing/vistas-ocupacion.performance.spec.ts
  - Verifica consulta de ocupacion en tiempo acotado.
- src/nonfunctional/performance-testing/facturacion-crear-factura.performance.spec.ts
  - Verifica generacion de factura dentro de umbral de tiempo mockeado.

## Como ejecutar
Desde la carpeta backend:

Ejecutar todas las pruebas no funcionales nuevas:
```bash
npx jest src/nonfunctional --runInBand
```

Ejecutar por tipo:
```bash
npx jest src/nonfunctional/api-testing --runInBand
npx jest src/nonfunctional/regression-testing --runInBand
npx jest src/nonfunctional/security-testing --runInBand
npx jest src/nonfunctional/performance-testing --runInBand
```

Ejecutar una funcionalidad puntual en los 4 tipos:
```bash
npx jest src/nonfunctional -t "Iniciar sesion" --runInBand
```

## Convencion de nombres
- Patron: <funcionalidad>.<tipo>.spec.ts
- Ejemplo: auth-login.api.spec.ts

Esto permite ubicar rapido cada prueba por dominio y por objetivo no funcional.
