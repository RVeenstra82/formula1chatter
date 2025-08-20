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
