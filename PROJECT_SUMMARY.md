# Formula 1 Chatter Championship Project Summary

## Project Overview
This application allows users to predict Formula 1 race outcomes and compete against friends. Users can predict race winners, podium finishers, fastest lap, and driver of the day for each race in the F1 season.

## Architecture

### Backend
- **Spring Boot with Kotlin**: REST API for all data operations with idiomatic Kotlin nullables
- **PostgreSQL**: Relational database for storing predictions, race results, and user data
- **OAuth2**: Authentication with Facebook
- **Jolpica API**: Integration with Formula 1 data source
- **Kotlin Extensions**: Spring Data Kotlin extensions for better null-safety and cleaner code

### Frontend
- **React with TypeScript**: Modern component-based architecture
- **Vite**: Fast build tool
- **TailwindCSS**: Utility-first CSS for styling
- **React Query**: Data fetching and state management
- **React Router**: Navigation and routing

## Key Features
1. **User Authentication**: Login with Facebook
2. **Race Calendar**: View upcoming and past races
3. **Race Predictions**: Predict race outcomes before race start
4. **Results Visualization**: See prediction results with a podium display
5. **Leaderboards**: Track season-long performance against other users

## Database Structure
- **User**: Stores user profile data from Facebook
- **Race**: Stores race information and results
- **Prediction**: Stores user predictions for races
- **Driver**: Stores driver information
- **Constructor**: Stores team information

## API Endpoints
- **/auth**: Authentication endpoints
- **/races**: Race data endpoints
- **/drivers**: Driver information endpoints
- **/predictions**: Prediction creation and results endpoints

## Frontend Routes
- **/** - Home page
- **/races** - Race calendar
- **/races/:id** - Race details
- **/races/:id/predict** - Make prediction
- **/races/:id/results** - View prediction results
- **/leaderboard** - Season leaderboard

## Background Jobs (Scheduling)

The backend uses Spring Boot scheduling for periodic tasks:

- Races sync (weekly, Sun 00:00): `DataSyncService.syncCurrentSeasonData()`
- Drivers & constructors sync (weekly, Sun 01:00): `DataSyncService.syncDriverData()`
- Driver profile pictures update (weekly, Sun 02:00): `DataSyncService.updateDriverProfilePictures()` → `OpenF1ApiService.updateDriverProfilePictures()`
- New season check (daily, 06:00): `DataSyncService.checkForNewSeason()`
- Completed races processing (weekly, Sun 03:00): `DataSyncService.checkForCompletedRaces()`

Environment flag:

- `UPDATE_PROFILE_PICTURES_ON_STARTUP=true` to update driver headshots once during app startup (default false)

Manual admin endpoint (base path `/api`):

- `POST /admin/update-driver-photos` → triggers an immediate refresh of driver photos

## Scoring System
- 5 points for correct 1st place prediction
- 3 points for correct 2nd place prediction
- 1 point for correct 3rd place prediction
- 1 point for correct fastest lap prediction
- 1 point for correct driver of the day prediction

## Development Setup
1. Configure Facebook OAuth credentials in application.yml
2. Set up PostgreSQL database
3. Run both frontend and backend:
   ```
   npm install
   npm run dev
   ```

## To-Do / Future Enhancements
1. Add unit and integration tests
2. Implement mobile-responsive design improvements
3. Add email notifications for upcoming races
4. Create private prediction leagues
5. Add additional stats and visualizations 