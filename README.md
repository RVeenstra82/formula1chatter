# Formula 1 Chatter

[![Kotlin](https://img.shields.io/badge/Kotlin-Spring_Boot_3-7F52FF?logo=kotlin&logoColor=white)](https://kotlinlang.org/)
[![React](https://img.shields.io/badge/React_19-TypeScript-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Deploy](https://img.shields.io/badge/Vercel-Frontend-000?logo=vercel)](https://formula1chatter.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An F1 prediction game where you predict race podiums, fastest laps, and driver of the day — then compete against friends on a season-long leaderboard.

> **[formula1chatter.vercel.app](https://formula1chatter.vercel.app)**

## Features

- **Podium predictions** — Pick P1, P2, and P3 for every Grand Prix and sprint race
- **Fastest lap & Driver of the Day** — Earn bonus points with extra predictions
- **Scoring system** — 5 pts for P1, 3 pts for P2, 1 pt for P3, and 1 pt each for fastest lap and DOTD
- **Season leaderboard** — Track your ranking against other players throughout the season
- **Sprint race support** — Separate predictions for sprint weekends
- **Automatic race data** — Schedules, results, and driver info synced from Jolpica and OpenF1 APIs
- **Multilingual** — Full English and Dutch language support
- **Responsive design** — F1-inspired dark theme, optimized for desktop and mobile
- **Facebook login** — One-click authentication via OAuth2

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Kotlin, Spring Boot 3, Spring Security (OAuth2 + JWT), JPA/Hibernate |
| **Frontend** | React 19, TypeScript, Tailwind CSS, MUI, React Query, Vite |
| **Database** | PostgreSQL (H2 in-memory for local dev) |
| **APIs** | [Jolpica](https://github.com/jolpica/jolpica-f1) (race data), [OpenF1](https://openf1.org/) (driver photos) |
| **Hosting** | Render (backend), Vercel (frontend) |

## Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- Docker (optional, for PostgreSQL)

### Run locally

```bash
# Clone the repository
git clone https://github.com/rickveenstra/formula1chatter.git
cd formula1chatter

# Start everything (backend on :8090, frontend on :5173)
npm run dev
```

This starts the backend with an **H2 in-memory database** — no PostgreSQL needed.

To use PostgreSQL instead:

```bash
# Start PostgreSQL via Docker
docker compose up -d

# Run with postgres profile
cd backend && ./gradlew bootRun --args='--spring.profiles.active=postgres'
```

## Project Structure

```
formula1chatter/
├── backend/          # Kotlin + Spring Boot API
│   └── src/main/kotlin/com/f1chatter/backend/
│       ├── controller/   # REST endpoints
│       ├── service/      # Business logic & scoring
│       ├── model/        # JPA entities
│       ├── dto/          # Data transfer objects
│       └── config/       # Security, JWT, CORS
├── frontend/         # React + TypeScript SPA
│   └── src/
│       ├── api/          # API client & types
│       ├── pages/        # Route-level components
│       ├── components/   # Reusable UI components
│       └── contexts/     # Auth & language providers
└── docker-compose.yml
```

## Deployment

The app runs on **Render** (backend) and **Vercel** (frontend). See [DEPLOYMENT.md](DEPLOYMENT.md) for setup instructions including Facebook OAuth configuration.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development documentation including:

- Build & test commands
- API rate limiting configuration
- Background job schedules
- Admin endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`feature/my-feature`)
3. Commit your changes
4. Open a pull request

## License

This project is licensed under the [MIT License](LICENSE).
