# Formula 1 Chatter

A Formula 1 prediction and discussion platform where users can make predictions about race outcomes and compete with others.

## Features

- **Race Predictions**: Make predictions for upcoming F1 races
- **Leaderboard**: Compete with other users and see rankings
- **Real-time Data**: Automatic synchronization with F1 data sources
- **User Authentication**: Secure login with Facebook OAuth
- **Mobile Responsive**: Works great on all devices

## Tech Stack

### Backend
- **Kotlin** with **Spring Boot** and idiomatic nullables
- **PostgreSQL** database
- **JPA/Hibernate** for data persistence
- **Spring Security** for authentication
- **Scheduled tasks** for data synchronization
- **Spring Data Kotlin extensions** for better null-safety

### Frontend
- **React** with **TypeScript**
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **React Router** for navigation

## API Rate Limiting Configuration

The application uses external APIs (OpenF1 and Jolpica) for F1 data. To prevent rate limiting issues, the following configuration options are available:

### OpenF1 API Configuration

Add these settings to your `application.yml` or environment variables:

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

### Environment Variables

- `UPDATE_PROFILE_PICTURES_ON_STARTUP`: Set to `true` to enable profile picture updates during application startup (default: `false`)

### Why These Changes?

The original implementation was making too many API calls to the OpenF1 API during startup, causing 504 Gateway Timeout errors. The improvements include:

1. **Configurable delays** between API calls to respect rate limits
2. **Optional startup updates** to prevent startup delays
3. **Better error handling** to stop when too many errors occur
4. **Increased timeouts** in RestTemplate configuration
5. **Scheduled updates** that run weekly instead of during startup

## Background jobs and scheduling

The backend contains several scheduled jobs (Spring `@Scheduled`) that keep data fresh and compute results. All times below are in server time.

- Races sync: Every Sunday at 00:00
  - Cron: `0 0 0 * * SUN`
  - Method: `DataSyncService.syncCurrentSeasonData()`
  - Behavior: Downloads current season races if not present

- Drivers & constructors sync: Every Sunday at 01:00
  - Cron: `0 0 1 * * SUN`
  - Method: `DataSyncService.syncDriverData()`
  - Behavior: Fetches drivers/constructors if missing

- Driver profile pictures update: Every Sunday at 02:00
  - Cron: `0 0 2 * * SUN`
  - Method: `DataSyncService.updateDriverProfilePictures()` → `OpenF1ApiService.updateDriverProfilePictures()`
  - Behavior: Refreshes driver headshots from OpenF1
  - Startup option: Set `UPDATE_PROFILE_PICTURES_ON_STARTUP=true` to also run once during app startup (default false). See `openf1.api.startup.update-profile-pictures` in `application.yml`.

- New season check: Daily at 06:00
  - Cron: `0 0 6 * * *`
  - Method: `DataSyncService.checkForNewSeason()`
  - Behavior: If the new season has no races in DB yet, triggers a races sync

- Completed races processing: Every hour on Sundays
  - Cron: `0 0 * * * SUN`
  - Method: `DataSyncService.checkForCompletedRaces()`
  - Behavior: Looks for recently finished races, updates results from Jolpica, then recalculates prediction scores

### Manual admin trigger

For immediate refresh of driver photos you can call the admin endpoint (base path `/api`):

```bash
curl -X POST "https://<your-backend-domain>/api/admin/update-driver-photos"
```

This is useful right after a deployment to Render to ensure headshots are up to date without waiting for the weekly job.

## Development Setup

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 13+

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Create a PostgreSQL database
3. Update `application-dev.yml` with your database credentials
4. Run: `./gradlew bootRun`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Deployment

The application is configured for deployment on Render (backend) and Vercel (frontend) with automatic database provisioning and environment variable management. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
