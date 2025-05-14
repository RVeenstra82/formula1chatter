# Formula 1 Chatter Championship

A web application for Formula 1 fans to predict race outcomes and compete with friends.

## Features

- Facebook login integration
- Display upcoming F1 races
- Predict race results (top 3 finishers, fastest lap, driver of the day)
- Point system (5/3/1/1/1) for correct predictions
- Leaderboard to track season standings
- Race data from Jolpica API

## Tech Stack

- **Frontend**: React, TypeScript, Vite, React Query, React Router, Tailwind CSS
- **Backend**: Spring Boot, Kotlin, Gradle
- **Database**: PostgreSQL
- **Testing**: JUnit, MockK, Playwright

## Running the Application

### Option 1: Using Docker Compose (Recommended)

The easiest way to run the application is using the provided start script, which will:
1. Start PostgreSQL database using Docker Compose
2. Run the backend with the PostgreSQL profile
3. Run the frontend development server

```bash
./start.sh
```

This will start:
- PostgreSQL database at `localhost:5432`
- PgAdmin at `http://localhost:5050` (email: admin@f1chatter.com, password: admin)
- Backend API at `http://localhost:8080/api`
- Frontend at `http://localhost:5173`

Press `Ctrl+C` to stop all services.

### Option 2: Running Components Individually

#### Database
You can run PostgreSQL using Docker Compose:

```bash
docker-compose up -d postgres
```

#### Backend

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=postgres'
```

For in-memory database (H2) instead of PostgreSQL:

```bash
cd backend
./gradlew bootRun
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Testing

### Backend Tests

To run the backend tests:

```bash
cd backend
./gradlew test
```

This will run all the JUnit tests for services, repositories, and controllers.

### Frontend Tests

To run the frontend Playwright tests:

```bash
cd frontend
npm test
```

To run the tests in headed mode (with visible browser):

```bash
cd frontend
npm run test:headed
```

To run the tests with the Playwright UI:

```bash
cd frontend
npm run test:ui
```

## Test Coverage

### Backend Tests

- **UserService**: Tests for user creation, retrieval, and OAuth login flow
- **RaceService**: Tests for retrieving races, handling race data
- **PredictionService**: Tests for creating/updating predictions, calculating scores

### Frontend Tests

- **Home Page**: Tests for page rendering, navigation, and next race display
- **Prediction Form**: Tests for form validation, driver selection, and API interactions
- **Leaderboard**: Tests for displaying rankings, podium positions, and error handling

## Development

The project is structured as a multi-module application:

- `backend/`: Spring Boot backend with REST API
- `frontend/`: React frontend application

## Database Setup

The application uses PostgreSQL. Make sure to have PostgreSQL installed and running.
Configure the database connection in `backend/src/main/resources/application.yml`.

## API Documentation
Once the backend is running, Swagger documentation will be available at:
http://localhost:8080/api/swagger-ui.html 