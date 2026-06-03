# Dailygeon — Backend

API REST de **Dailygeon**, una aplicación que convierte tus tareas diarias en una aventura RPG: completas misiones, ganas XP, subes de nivel y derrotas al jefe semanal.

Este repositorio contiene únicamente el **backend** (API). El frontend está en su propio repositorio.

## Tecnologías

- **Node.js** + **Express** (API REST, ESM)
- **MongoDB** + **Mongoose** (base de datos y modelado)
- **JWT** (`jsonwebtoken`) + **bcryptjs** (autenticación y hash de contraseñas)
- **csv-parse** + módulo `fs` (lectura de los datos de semilla)
- **xlsx** (generación del Excel/CSV de datos iniciales)

## Arquitectura

Arquitectura por capas, sin lógica duplicada (cada pieza tiene una única responsabilidad):

```
src/
├── server.js            # Arranque: conecta a Mongo y levanta la app
├── app.js               # Configuración de Express (middlewares, rutas)
├── config/
│   └── db.js            # Conexión a MongoDB
├── models/              # Esquemas Mongoose (5 colecciones relacionadas)
│   ├── User.js  Character.js  Task.js  Boss.js  BossRun.js
├── controllers/         # Lógica de cada recurso (auth, character, task, boss)
├── routes/              # Definición de endpoints por recurso
├── services/            # Reglas de negocio reutilizables (boss.service)
├── middleware/          # auth (JWT), errorHandler, notFound
└── utils/               # asyncHandler, ApiError, token, xp
data/                    # Excel + CSV de datos iniciales
scripts/                 # generate-data (crea el dataset) y seed (lo inserta)
```

Piezas compartidas clave:
- `asyncHandler` envuelve los controladores para no repetir `try/catch`.
- `ApiError` lanza errores con código estable (ej. `INVALID_CREDENTIALS`) que el frontend traduce.
- `errorHandler` centraliza el formato de respuesta de error `{ code, message }`.

## Modelo de datos

Cinco colecciones relacionadas:

- **User** 1—1 **Character** (cada usuario tiene un personaje)
- **User** 1—N **Task** (las misiones del usuario)
- **User** 1—N **BossRun** N—1 **Boss** (la run semanal apunta a un jefe del catálogo)

## Endpoints principales

| Método | Ruta | Descripción | Protegido |
|--------|------|-------------|-----------|
| POST | `/api/auth/register` | Registro (devuelve token) | No |
| POST | `/api/auth/login` | Login (devuelve token) | No |
| GET | `/api/auth/me` | Usuario actual + personaje | Sí |
| POST | `/api/characters` | Crear personaje | Sí |
| GET | `/api/characters/me` | Personaje del usuario | Sí |
| PATCH | `/api/characters/me` | Editar personaje | Sí |
| GET | `/api/tasks` | Listar misiones | Sí |
| POST | `/api/tasks` | Crear misión | Sí |
| PATCH | `/api/tasks/:id` | Editar misión | Sí |
| DELETE | `/api/tasks/:id` | Eliminar misión | Sí |
| POST | `/api/tasks/:id/complete` | Completar (otorga XP y daña al jefe) | Sí |
| GET | `/api/bosses` | Catálogo de jefes | No |
| GET | `/api/bosses/my-run` | Jefe de la semana (se crea solo) | Sí |
| GET | `/api/bosses/history` | Jefes anteriores | Sí |

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el .env a partir del ejemplo
cp .env.example .env   # y rellena MONGO_URI y JWT_SECRET

# 3. Generar el dataset (Excel + CSV en /data)
npm run generate-data

# 4. Sembrar la base de datos a partir de los CSV
npm run seed

# 5. Arrancar en desarrollo
npm run dev
```

Usuario de prueba tras el seed: `aria@dailygeon.com` / `password123`.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (por defecto 4000) |
| `MONGO_URI` | Conexión a MongoDB (local o Atlas) |
| `JWT_SECRET` | Secreto para firmar los tokens |
| `JWT_EXPIRES_IN` | Caducidad del token (ej. `7d`) |
| `CLIENT_URL` | URL del frontend (CORS) |

## Datos iniciales

El comando `generate-data` crea `data/dailygeon-seed.xlsx` con una hoja por colección y exporta cada hoja a CSV. El comando `seed` lee esos CSV con el módulo `fs`, resuelve las relaciones (email → usuario, slug → jefe) e inserta todo en MongoDB. El dataset tiene más de 100 registros repartidos entre las colecciones.

## Despliegue (Render)

El repositorio incluye `render.yaml`. En Render:

1. Crear un **Web Service** desde este repo (o usar el blueprint `render.yaml`).
2. Build command: `npm install` · Start command: `npm start`.
3. Configurar las variables de entorno (`MONGO_URI` de Atlas, `JWT_SECRET`, `CLIENT_URL` con la URL del frontend desplegado).
