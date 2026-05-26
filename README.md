# TrackHire — Job Application Tracker

> Fullstack application to manage job applications, track recruitment stages and analyse your job search progression.

![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=flat-square&logo=springboot)
![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=flat-square&logo=angular)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

---

## Features

- **Application tracking** — create, update and delete job applications with full details (company, position, salary, location, job URL, notes)
- **Recruitment workflow** — 7-stage status pipeline: `SAVED → APPLIED → HR_INTERVIEW → TECH_INTERVIEW → FINAL_INTERVIEW → OFFER / REJECTED`
- **Search & filters** — filter by keyword, company, status with server-side pagination and column sorting
- **Dashboard** — KPI cards, status breakdown with progress bars, response rate and success rate
- **Authentication** — JWT-based stateless auth with register/login, route guards and HTTP interceptor
- **Dockerised** — one command to run the entire stack locally

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Java 21 |
| Framework | Spring Boot 3.3 |
| Security | Spring Security 7 + JWT (jjwt 0.12) |
| Persistence | Spring Data JPA / Hibernate |
| Mapping | MapStruct 1.5 |
| Validation | Jakarta Validation |
| Database | PostgreSQL 16 |
| Build | Maven 3.9 |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Angular 17+ (standalone components) |
| State | Signals + RxJS |
| Forms | Reactive Forms |
| HTTP | HttpClient + functional interceptor |
| Routing | Lazy-loaded routes + Auth Guard |
| Style | Custom CSS (no UI framework) |

### DevOps
| Tool | Usage |
|---|---|
| Docker | Multi-stage builds (JRE alpine + nginx alpine) |
| Docker Compose | Orchestration (postgres + backend + frontend) |
| nginx | Reverse proxy + SPA routing |
| Profiles | `dev` (update DDL) / `prod` (validate DDL) |

---

## Architecture

```
job-tracker/
├── job-tracker-backend/
│   └── src/main/java/com/jobtracker/
│       ├── controller/      # REST endpoints — no business logic
│       ├── service/         # Business logic + @Transactional
│       ├── repository/      # JpaRepository + Specifications
│       ├── entity/          # JPA entities + enums
│       ├── dto/
│       │   ├── request/     # Incoming payloads (Jakarta Validation)
│       │   └── response/    # Outgoing payloads (never expose entities)
│       ├── mapper/          # MapStruct interfaces
│       ├── security/        # JwtService, JwtAuthFilter, SecurityConfig
│       ├── exception/       # GlobalExceptionHandler (RFC 9457 ProblemDetail)
│       └── config/          # CORS, beans
│
└── job-tracker-frontend/
    └── src/app/
        ├── core/
        │   ├── layout/      # MainLayoutComponent (sidebar + router-outlet)
        │   ├── services/    # ApplicationService, AuthService, DashboardService
        │   ├── guards/      # authGuard
        │   ├── interceptors/# jwtInterceptor
        │   └── models/      # TypeScript interfaces
        └── features/
            ├── applications/ # list / create / detail
            ├── dashboard/    # stats + charts
            └── auth/         # login / register
```

### Request flow

```
Angular (HTTP) → jwtInterceptor (adds Bearer)
  → nginx (/api proxy) → JwtAuthFilter (validates token)
    → Controller (validates DTO) → Service (@Transactional)
      → Repository (JPA Specification) → PostgreSQL
        → MapStruct → DTO → JSON response
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Create account |
| `POST` | `/api/v1/auth/login` | Login, returns JWT |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/applications/search` | Paginated search with filters |
| `GET` | `/api/v1/applications/{id}` | Get by id |
| `POST` | `/api/v1/applications` | Create application |
| `PUT` | `/api/v1/applications/{id}` | Update application |
| `DELETE` | `/api/v1/applications/{id}` | Delete application |

**Search query params:** `keyword`, `company`, `status`, `page`, `size`, `sortBy`, `sortDir`

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard/stats` | KPIs and status breakdown |

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- Git

### 1 — Clone the repository

```bash
git clone https://github.com/your-username/job-tracker.git
cd job-tracker
```

### 2 — Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```bash
# .env
POSTGRES_DB=jobtracker
POSTGRES_USER=jobtracker
POSTGRES_PASSWORD=your_secure_password

DB_USERNAME=jobtracker
DB_PASSWORD=your_secure_password

# Generate with: openssl rand -hex 32
JWT_SECRET=your_64_char_hex_secret
JWT_EXPIRATION=86400000

BACKEND_PORT=8080
FRONTEND_PORT=4200
```

> **Generate a secure JWT secret:**
> ```bash
> openssl rand -hex 32
> ```

### 3 — Build and run

```bash
docker compose up --build
```

First run takes ~3–5 minutes (Maven downloads dependencies, npm installs packages, images are built).

### 4 — Open the app

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8080/api/v1 |

Create an account on the register page and start tracking.

---

## Development Setup (without Docker)

### Backend

**Prerequisites:** JDK 21, Maven 3.9, PostgreSQL 16 running locally.

```bash
cd job-tracker-backend

# Start PostgreSQL only via Docker
docker compose up -d postgres

# Run backend in dev mode
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend starts on `http://localhost:8080`.

### Frontend

**Prerequisites:** Node 20+, Angular CLI 17+.

```bash
cd job-tracker-frontend
npm install

# Start with API proxy (avoids CORS in dev)
ng serve --proxy-config proxy.conf.json
```

Frontend starts on `http://localhost:4200`.

---

## Useful Docker Commands

```bash
# Start all services (detached)
docker compose up -d

# View backend logs
docker compose logs -f backend

# Rebuild after code changes
docker compose up --build

# Stop all services (keep data)
docker compose down

# Stop and delete all data
docker compose down -v

# Open a shell in the backend container
docker exec -it jobtracker-backend sh

# Connect to PostgreSQL
docker exec -it jobtracker-db psql -U jobtracker -d jobtracker
```

---

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_DB` | Database name | `jobtracker` |
| `POSTGRES_USER` | DB user | `jobtracker` |
| `POSTGRES_PASSWORD` | DB password | — |
| `DB_USERNAME` | Spring datasource user | — |
| `DB_PASSWORD` | Spring datasource password | — |
| `JWT_SECRET` | HS256 signing key (min 64 hex chars) | — |
| `JWT_EXPIRATION` | Token validity in ms | `86400000` (24h) |
| `BACKEND_PORT` | Host port for backend | `8080` |
| `FRONTEND_PORT` | Host port for frontend | `4200` |

---

## Project Roadmap

- [x] Phase 0 — Project scaffold and architecture
- [x] Phase 1 — Applications CRUD (entity, DTO, MapStruct, REST)
- [x] Phase 2 — Angular frontend connected to API
- [x] Phase 3 — Search, filters and pagination
- [x] Phase 4 — JWT authentication (Spring Security 7)
- [x] Phase 5 — Docker Compose (multi-stage builds)
- [x] Phase 6 — Dashboard with KPIs and charts
- [x] Phase 7 — Documentation
- [ ] Refresh token (v2)
- [ ] Email notifications
- [ ] Export to CSV
- [ ] CI/CD pipeline (GitHub Actions)

---

## Author

**Grimm05**
[LinkedIn](https://linkedin.com) · [GitHub](https://github.com/Grimm05)