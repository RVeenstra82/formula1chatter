# Formula 1 Chatter Championship Project Summary

## Project Overview
This application allows users to predict Formula 1 race outcomes and compete against friends. Users can predict race winners, podium finishers, fastest lap, and driver of the day for each race in the F1 season.

## Architecture

### Backend
- **Spring Boot with Kotlin**: REST API for all data operations
- **PostgreSQL**: Relational database for storing predictions, race results, and user data
- **OAuth2**: Authentication with Facebook
- **Jolpica API**: Integration with Formula 1 data source

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