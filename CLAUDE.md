# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Formula 1 Chatter is an F1 prediction platform where users predict race podiums, fastest laps, and driver of the day, then compete on a season-long leaderboard. It supports both main races and sprint races.

## Tech Stack

- **Backend:** Kotlin + Spring Boot 3 (JVM 17), JPA/Hibernate, PostgreSQL
- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS + MUI, React Query
- **Auth:** Facebook OAuth2 → JWT tokens stored in localStorage
- **External APIs:** Jolpica (F1 race data), OpenF1 (driver photos)
- **Deployment:** Backend on Render, frontend on Vercel
- Always check for TypeScript strict-mode/null-safety issues after frontend edits. Always verify correct data path expressions by reading the actual data model files first.

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
./gradlew test --tests "*.PredictionServiceTest.testMethodName"  # single test method
./gradlew compileKotlin              # quick compilation check
./gradlew jacocoTestReport           # test coverage → build/reports/jacoco/
```

### Frontend (from `frontend/`)
```bash
npm run dev              # Vite dev server on :5173 (proxies /api → :8090)
npm run build            # tsc + vite build
npm run lint             # ESLint
npx playwright test      # run all E2E tests
npx playwright test tests/auth.spec.ts              # single test file
npx playwright test --headed                         # run with browser visible
npx playwright test --project=chromium               # single browser
```

### Database
```bash
docker compose up -d     # PostgreSQL on :5433, pgAdmin on :5050
```

## Architecture

### Request Flow
Frontend (React SPA) → Axios client with JWT interceptor → Spring Boot REST API (`/api/**` context path) → Service layer → JPA Repositories → PostgreSQL

### Backend Layers (`backend/src/main/kotlin/com/f1chatter/backend/`)
- **controller/** — REST endpoints. Return `ResponseEntity<T>`. No business logic here.
- **service/** — Business logic, scoring, external API integration, scheduled data sync jobs.
- **repository/** — Spring Data JPA interfaces with custom query methods.
- **model/** — JPA entities: `User`, `Race`, `Prediction`, `Driver`, `Constructor`, `SprintRace`, `SprintPrediction`, `ApiCache`.
- **dto/** — Data transfer objects (e.g., `UserDto` with `isAdmin` flag). Always use DTOs in controller responses, never expose entities directly.
- **config/** — `SecurityConfig` (CORS, endpoint auth rules, OAuth2), `JwtAuthenticationFilter`, `JwtService`.

### Frontend Layers (`frontend/src/`)
- **api/client.ts** — Axios instance, all API functions, and TypeScript interfaces for API types. This is the single source of truth for API communication.
- **contexts/** — `AuthContext` (user state, login/logout), `LanguageContext` (i18n).
- **pages/** — Route-level components. Routing is defined in `App.tsx`.
- **components/** — Reusable UI split into `common/`, `prediction/`, `race/`, `onboarding/`.

### Spring Profiles
| Profile | Database | Use case |
|---------|----------|----------|
| `dev` (default) | H2 in-memory | Quick local dev without Docker |
| `postgres` | PostgreSQL :5433 | Local dev with persistent data |
| `render` | Render PostgreSQL | Production |

### Auth Flow
1. Frontend redirects to `/api/oauth2/authorization/facebook`
2. Spring OAuth2 handles Facebook handshake
3. `AuthController.oauthCallback()` creates/updates user, generates JWT
4. Redirects to frontend with `?token=...&user=...` query params
5. `AuthContext` stores token in localStorage, cleans URL
6. Axios interceptor attaches `Authorization: Bearer {token}` to all requests
7. `JwtAuthenticationFilter` validates JWT on each backend request

### Admin Authorization
Admin status is determined by checking the user's email/Facebook ID in `UserService`. The `isAdmin` flag is included in the `UserDto` and JWT-derived user object. Admin endpoints are at `/api/admin/**`.

### Scoring System
- 5 pts: correct 1st place
- 3 pts: correct 2nd place
- 1 pt: correct 3rd place
- 1 pt: correct fastest lap
- 1 pt: correct driver of the day
- Sprint predictions: 1st/2nd/3rd only (no fastest lap or DOTD)

### Background Jobs (DataSyncService)
Scheduled with `@Scheduled` cron expressions. Syncs races weekly, drivers weekly, processes completed races hourly on Sundays, checks for new season daily.

### External API Rate Limiting
Jolpica API: 3 req/sec with retries. OpenF1 API: 500ms delay between drivers, stops after 2 consecutive errors. Responses are cached in `ApiCache` table.

## Workflow

- Before starting implementation, ask clarifying questions about the user's preferred approach rather than diving into lengthy analysis/planning. If the user suggests a specific approach, follow it.
- When making git operations, NEVER use `git reset --hard` without explicitly warning about uncommitted changes first. Always run `git stash` before any destructive git operation.

## Git Workflow

- **Never commit directly to `main`.** Always create a feature branch first.
- Branch naming: `feature/<short-description>`, `fix/<short-description>`, or `chore/<short-description>`
- Use `/branch` skill to create and switch to a new branch.
- When work is done, commit on the feature branch and create a PR to `main`.
- Load `.env` before starting dev: `export $(cat .env | xargs) && npm run dev`
- **After creating a PR**, suggest reviewing the PR with `/review-pr` — do NOT suggest merging directly.

## Testing

- Always ensure ALL tests pass before considering a task complete, including pre-existing test failures. Run the full test suite and fix any failures, not just tests related to the current change.
- When fixing tests, do NOT create new test classes if existing test classes already cover the same service/component. Add tests to the existing class and follow its patterns.

## UI & Styling

- When working on UI/styling tasks, implement the change, then describe what it looks like and ask for user feedback before committing. Expect 2-3 iteration rounds for visual work.

## Key Conventions

- Backend server runs on port **8090** with context path `/api` (so endpoints are like `localhost:8090/api/races`)
- Vite dev server proxies `/api` requests to `localhost:8090` — frontend code uses relative paths like `/races/next`
- Use `Map<String, Any>` for mixed-type JSON response maps in Kotlin; convert numbers with `.toString()` when mixing with strings
- Backend tests use H2 in-memory database with JUnit 5 + MockK/Mockito
- Frontend E2E tests use Playwright against `localhost:5173`
