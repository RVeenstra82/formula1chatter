# Development Guide

## Build & Run Commands

### Full Stack (from root)

```bash
npm run dev          # starts backend + frontend concurrently
```

### Backend (from `backend/`)

```bash
./gradlew bootRun                    # run with dev profile (H2 in-memory DB)
./gradlew bootRun --args='--spring.profiles.active=postgres'  # run with PostgreSQL
./gradlew build                      # compile + run all tests
./gradlew test                       # run tests only
./gradlew test --tests "*.PredictionServiceTest"  # run a single test class
./gradlew compileKotlin              # quick compilation check
./gradlew jacocoTestReport           # test coverage → build/reports/jacoco/
```

### Frontend (from `frontend/`)

```bash
npm run dev              # Vite dev server on :5173 (proxies /api → :8090)
npm run build            # tsc + vite build
npm run lint             # ESLint
npx playwright test      # run all E2E tests
npx playwright test --headed                         # run with browser visible
```

### Database

```bash
docker compose up -d     # PostgreSQL on :5433, pgAdmin on :5050
```

## Spring Profiles

| Profile    | Database         | Use case                          |
|------------|------------------|-----------------------------------|
| `dev`      | H2 in-memory     | Quick local dev without Docker    |
| `postgres` | PostgreSQL :5433 | Local dev with persistent data    |
| `render`   | Render PostgreSQL| Production                        |

## API Rate Limiting Configuration

The application uses external APIs (OpenF1 and Jolpica) for F1 data. To prevent rate limiting issues, the following configuration options are available in `application.yml`:

```yaml
openf1:
  api:
    rate-limit:
      delay-between-drivers-ms: 500    # Delay between processing different drivers
      delay-between-calls-ms: 200      # Delay between API calls for the same driver
      max-errors-before-stop: 5        # Stop after this many errors
    startup:
      update-profile-pictures: false   # Disable profile picture updates during startup
```

Set `UPDATE_PROFILE_PICTURES_ON_STARTUP=true` to enable profile picture updates during application startup (default: `false`).

## Background Jobs

The backend uses Spring `@Scheduled` jobs to keep data fresh. All times are in server time.

| Job | Schedule | What it does |
|-----|----------|-------------|
| Races sync | Sunday 00:00 | Downloads current season races |
| Drivers & constructors sync | Sunday 01:00 | Fetches drivers/constructors if missing |
| Driver profile pictures | Sunday 02:00 | Refreshes headshots from OpenF1 |
| New season check | Daily 06:00 | Triggers race sync if new season has no data |
| Completed races | Hourly on Sundays | Updates results and recalculates scores |

### Manual admin trigger

Refresh driver photos immediately via the admin endpoint:

```bash
curl -X POST "https://<your-backend-domain>/api/admin/update-driver-photos"
```

## Testing

- Backend tests use **H2 in-memory database** with JUnit 5 + MockK
- Frontend E2E tests use **Playwright** against `localhost:5173`
- Backend runs on port **8090** with context path `/api`
- Vite proxies `/api` requests to `localhost:8090`
