# Multi-stage build for optimized image
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and pom.xml first for better caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Ensure mvnw is executable
RUN chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Create uploads directory
RUN mkdir -p /app/uploads/resumes /app/uploads/profile-pictures

# Expose port
EXPOSE 8080

# Run with production profile and optimized JVM settings for Railway (512MB RAM)
# Xms=128m (initial heap), Xmx=300m (max heap)
# This leaves ~200MB for non-heap memory (metaspace, threads, native memory)
ENTRYPOINT ["java", \
    "-Xms128m", \
    "-Xmx300m", \
    "-XX:MaxMetaspaceSize=100m", \
    "-XX:+UseG1GC", \
    "-XX:MaxGCPauseMillis=200", \
    "-XX:+UseStringDeduplication", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Dspring.profiles.active=prod", \
    "-jar", \
    "app.jar"]