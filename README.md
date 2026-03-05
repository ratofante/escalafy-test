# Entrega ESCALAFY - TEST

Rodrigo González Wilkens
[LinkedIn](https://www.linkedin.com/in/rodrigo-g-wilkens/) · [GitHub](https://github.com/ratofante)

## 1. Database Setup

### Conectar y crear la base de datos

```bash
psql -U postgres -c "CREATE DATABASE escalafy;"
```

### Alimentar la DB con los datos provistos en database/seed.sql

```bash
psql -U postgres -d escalafy -f database/seed.sql
```

### Crear .env.local

Crear archivo `.env.local` en la root del proyecto.

```bash
DATABASE_URL=postgres://<user>:<password>@localhost:5432/escalafy
```

### Instalar dependencias

```bash
npm install
```

### Correr el proyecto

```bash
npm run dev
```

---

## 2. Arquitectura y decisiones clave

### Función de reporting reutilizable

El núcleo de la aplicación es `lib/reporting.ts`, que expone `getReport()` como una función TypeScript pura, desacoplada de cualquier mecanismo de transporte HTTP. Esto permite que sea consumida de dos formas:

- **Server Component** (`app/dashboard/[orgId]/page.tsx`): la llama directamente en el servidor para renderizar los datos iniciales sin ningún request HTTP adicional desde el cliente.
- **API REST** (`app/api/reporting/route.ts`): la misma función es envuelta en un endpoint `GET /api/reporting`, que parsea y valida los query params antes de delegarle la ejecución. El `Dashboard` client component la consume aquí al interactuar con los controles.

### Estructura de rutas

Se adoptó una arquitectura multi-página: `/` lista las organizaciones y `/dashboard/[orgId]` muestra el reporte de cada una. Esto mantiene el `orgId` en la URL, hace las vistas compartibles y separa la responsabilidad de selección de org del dashboard en sí.

### Base de datos

Se utiliza el paquete `postgres` (sin ORM) con una query SQL que agrega datos de las tres fuentes (`meta_ads_data`, `google_ads_data`, `store_data`) mediante CTEs y un full outer join sobre una spine de fechas. Las métricas derivadas (`profit`, `roas`, etc.) se calculan en JS sobre los totales ya agregados, evitando la distorsión que produciría sumar valores diarios ya derivados.

### Utilidades compartidas

`lib/metrics.ts` centraliza las etiquetas, el formateo de valores y el listado de métricas disponibles, evitando duplicación entre los componentes de UI. `lib/organizations.ts` y `lib/reporting.ts` mantienen separadas las consultas de negocio.

---

## 3. Próximos pasos

### Caché de requests con TanStack Query

Actualmente cada cambio en los controles dispara un `fetch` directo al endpoint. Integrar **TanStack Query** (`@tanstack/react-query`) permitiría cachear los resultados por combinación de parámetros, evitar refetches innecesarios cuando el usuario vuelve a una selección anterior, y manejar los estados de carga y error de forma más declarativa y consistente.

### Estado global con Zustand

El estado de los filtros (fecha, métricas seleccionadas, org activa) hoy vive localmente en `Dashboard.tsx`. A medida que la aplicación crezca — más vistas, filtros persistentes, comparaciones entre orgs — moverlo a un store de **Zustand** daría control centralizado sobre el estado sincrónico y asincrónimo de la app, facilitando la escalabilidad sin el overhead de soluciones más pesadas como Redux.
