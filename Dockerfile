# ---- Backend build ----
FROM gradle:8.2.1-jdk17 AS backend-build
WORKDIR /app
COPY backend ./backend
WORKDIR /app/backend
RUN gradle build --no-daemon

# ---- Frontend build ----
FROM node:20 AS frontend-build
WORKDIR /app
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# ---- Final image ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy backend jar
COPY --from=backend-build /app/backend/build/libs/*.jar /app/app.jar

# Copy frontend build to a static folder (optioneel, als je via Spring wilt serveren)
COPY --from=frontend-build /app/frontend/dist /app/public

ENV PORT=8090
EXPOSE 8090

CMD ["java", "-jar", "/app/app.jar"] 