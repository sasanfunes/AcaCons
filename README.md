# Academia del Constructor (AcaCons)

Portal de formación online sobre **materiales de construcción y sus aplicaciones** para Honduras y Centroamérica:
registro de usuarios, cursos con videos, evaluaciones, certificados verificables, inscripción a eventos presenciales
y perfiles de marcas con fichas técnicas. Todo el contenido es gratuito (patrocinado por fabricantes).

## Funcionalidades

**Sitio público y alumnos**
- Registro con perfil profesional (profesión, empresa, país, departamento y ciudad), verificación de correo y recuperación de contraseña.
- Catálogo de cursos con filtros por categoría, marca, nivel y búsqueda.
- Cursos → módulos → lecciones con video embebido de **YouTube** (dominio de privacidad `youtube-nocookie.com`) o **Vimeo** (incluye videos privados con hash). Lecciones de muestra visibles sin inscribirse.
- Progreso por lección, evaluaciones de opción múltiple (de repaso por módulo y final), calificadas en el servidor.
- **Certificado PDF** con código QR al completar el curso, y página pública de verificación por código.
- **Eventos presenciales** con cupo, lista de espera y promoción automática cuando alguien cancela, entrada con código QR y correos de confirmación.
- Marcas/fabricantes con sus cursos, eventos y **fichas técnicas** PDF descargables.
- Área "Mi cuenta": cursos en progreso, certificados, eventos y perfil.

**Panel de administración (`/admin`)**
- Resumen con métricas (usuarios, inscripciones, finalización, certificados, próximos eventos).
- Cursos: datos, portada, patrocinadores, fichas recomendadas, módulos y lecciones (reordenar, vista previa del video), evaluaciones con editor de preguntas.
- Eventos: alta y edición con zona horaria, inscritos por estado, check-in por código de entrada, exportación a CSV (compatible con Excel).
- Marcas y fichas técnicas (subida de PDF), categorías, instructores y usuarios (asignar rol de administrador).

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, TypeScript) + Tailwind CSS 4
- PostgreSQL 16 + [Prisma 7](https://www.prisma.io) (driver adapter `@prisma/adapter-pg`)
- [better-auth](https://www.better-auth.com) (email y contraseña)
- `@react-pdf/renderer` + `qrcode` para certificados
- Correo: consola en desarrollo, [Resend](https://resend.com) en producción
- Archivos: disco local en desarrollo, S3 compatible (p. ej. Cloudflare R2) en producción
- Tests: Vitest (unitarios e integración) y Playwright (end-to-end)

## Puesta en marcha (desarrollo)

Requisitos: Node 22+, PostgreSQL 16 (local o con Docker).

```bash
cp .env.example .env          # y ajuste BETTER_AUTH_SECRET
docker compose up -d db       # o use un PostgreSQL local con las bases acacons, acacons_test y acacons_e2e
npm install
npx prisma migrate dev
npm run db:seed               # contenido de ejemplo + usuario admin
npm run dev
```

Abra http://localhost:3000.

| Usuario | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `ADMIN_EMAIL` (por defecto `admin@acacons.local`) | `ADMIN_PASSWORD` (por defecto `Admin12345!`) |
| Alumno de ejemplo (solo fuera de producción) | `estudiante@acacons.local` | `Estudiante123!` |

En desarrollo los correos (verificación, recuperación, eventos) se imprimen en la consola del servidor.

> El seed usa **marcas ficticias** y un video de muestra para todas las lecciones. Reemplace los videos desde
> **Admin → Cursos → Módulos y lecciones** pegando la URL de YouTube o Vimeo de cada lección.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run lint` / `npm run typecheck` | ESLint y TypeScript |
| `npm test` | Tests unitarios + integración (usa `TEST_DATABASE_URL`) |
| `npm run build && npm run test:e2e` | Tests end-to-end con Playwright (usa `E2E_DATABASE_URL`, que se vacía y se vuelve a sembrar) |
| `npm run db:migrate` / `npm run db:deploy` | Migraciones (desarrollo / producción) |
| `npm run db:seed` | Datos de ejemplo (idempotente) |

Si ya tiene Chromium instalado, puede evitar `npx playwright install` con
`PLAYWRIGHT_CHROMIUM_PATH=/ruta/a/chrome npm run test:e2e`.

## Estructura

```
prisma/                 esquema, migraciones y seed (contenido de ejemplo en prisma/seed/)
src/app/(site)/         sitio público, autenticación y "Mi cuenta"
src/app/admin/          panel de administración
src/app/api/            auth, archivos, PDF de certificados
src/lib/domain/         lógica pura (videos, progreso, evaluaciones, cupos, códigos) con tests
src/server/services/    lógica transaccional (inscripción, certificados, eventos con bloqueo de fila)
src/server/actions/     server actions (validación con zod + control de acceso)
src/server/queries/     consultas de lectura
src/proxy.ts            redirección rápida a /ingresar si no hay sesión (la autorización real se hace en el servidor)
e2e/, tests/            Playwright y Vitest
```

## Publicar en Vercel (recomendado)

El proyecto está preparado para Vercel + Neon sin correr comandos en su computadora: en cada deploy el script
`vercel-build` aplica las migraciones, siembra los datos de ejemplo (sin duplicarlos) y compila la app. Los archivos
(portadas, logos, fichas) se guardan en la propia base con `STORAGE_DRIVER=db`.

1. En [vercel.com](https://vercel.com), ingrese con GitHub → **Add New → Project** → importe este repositorio (rama `main`).
2. En **Environment Variables** agregue:
   - `BETTER_AUTH_SECRET`: texto aleatorio de 32 caracteres o más.
   - `STORAGE_DRIVER`: `db`
   - `ADMIN_EMAIL` y `ADMIN_PASSWORD`: su usuario administrador.
   - `SEED_DEMO_USER`: `true` si quiere el alumno de ejemplo.
3. Pestaña **Storage → Create Database → Neon** y conéctela al proyecto (crea `DATABASE_URL` y `DATABASE_URL_UNPOOLED`).
4. **Deploy** (o **Redeploy** si el primer intento fue antes de crear la base).

Vercel publica el sitio con HTTPS (certificado automático, también para dominios propios) y redirige HTTP a HTTPS.
El portal agrega además el header HSTS y `upgrade-insecure-requests`, y solo acepta enlaces `https://` en el admin.

`APP_URL` es opcional en Vercel: si no se define, se usa el dominio de producción del proyecto. Si conecta un dominio
propio, defina `APP_URL` con él. Sin Resend los correos solo quedan en los registros, así que deje
`REQUIRE_EMAIL_VERIFICATION` en `false` hasta configurarlo.

## Producción (otros hostings)

1. Base PostgreSQL administrada (Neon, Supabase, RDS…) → `DATABASE_URL`.
2. `BETTER_AUTH_SECRET` aleatorio (`openssl rand -base64 32`), `APP_URL` y `BETTER_AUTH_URL` con el dominio público.
3. `REQUIRE_EMAIL_VERIFICATION="true"`, `EMAIL_DRIVER="resend"`, `RESEND_API_KEY` y `EMAIL_FROM` con un dominio verificado.
4. `STORAGE_DRIVER="s3"` y las variables `S3_*` (Cloudflare R2: `S3_ENDPOINT=https://<cuenta>.r2.cloudflarestorage.com`, `S3_REGION=auto`).
5. `npm run db:deploy` y, la primera vez, `npm run db:seed` (con `NODE_ENV=production` no crea el alumno de ejemplo).
6. Para Vimeo privado, habilite el dominio del portal en la configuración de privacidad de cada video.

## Próximos pasos sugeridos

- Pagos (pasarela local o tarjeta) para cursos o eventos premium: `Enrollment` y `EventRegistration` ya son entidades propias, así que se les puede asociar una orden de compra.
- Marcar lecciones automáticamente al terminar el video (API de YouTube IFrame / Vimeo Player).
- Recordatorios por correo antes de cada evento y encuestas de satisfacción.
