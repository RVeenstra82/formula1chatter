# ---- Backend build ----
FROM gradle:8.2.1-jdk17 AS backend-build
WORKDIR /app
COPY backend ./backend
WORKDIR /app/backend
RUN gradle build --no-daemon
RUN ls -la build/libs/

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
RUN ls -la /app/

# Copy frontend build to a static folder
COPY --from=frontend-build /app/frontend/dist /app/public
RUN ls -la /app/public/

ENV PORT=8090
EXPOSE 8090

# Add debugging
ENV JAVA_OPTS="-Dserver.port=8090 -Dlogging.level.root=DEBUG"
CMD ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"] 