#!/bin/bash

echo "============================================================="
echo "               Formula 1 Chatter Championship                "
echo "============================================================="

# Laad omgevingsvariabelen als .env bestaat
if [ -f .env ]; then
  echo "Laden van omgevingsvariabelen uit .env bestand..."
  export $(cat .env | grep -v '#' | sed 's/\r$//' | awk '/=/ {print $1}' | xargs)
fi

# Start PostgreSQL using Docker Compose
echo "Starting PostgreSQL using Docker Compose..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo "============================================================="
echo "                     Starting Application                    "
echo "============================================================="

# Controleer of Facebook OAuth credentials zijn ingesteld
if [ -z "$FACEBOOK_CLIENT_ID" ] || [ -z "$FACEBOOK_CLIENT_SECRET" ]; then
  echo "WAARSCHUWING: Facebook OAuth credentials zijn niet ingesteld!"
  echo "Facebook login functionaliteit zal niet werken."
  echo "Maak een .env bestand aan op basis van env.example of gebruik set-env.sh."
  echo "-------------------------------------------------------------"
fi

# Start the backend with PostgreSQL profile and debug logging
echo "Starting the backend with PostgreSQL profile and debug logging..."
cd backend
./gradlew bootRun --args='--spring.profiles.active=postgres,local --logging.level.com.f1chatter.backend=DEBUG --logging.level.org.springframework.web=DEBUG' &
BACKEND_PID=$!
cd ..

# Start the frontend
echo "Starting the frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# URLs displayed in the backend logs now

echo ""
echo "Press Ctrl+C to stop all services"

# Handle shutdown gracefully
trap "kill $BACKEND_PID $FRONTEND_PID; docker compose down; echo 'Shut down complete'" SIGINT SIGTERM

wait 