FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle settings.gradle ./
RUN chmod +x ./gradlew

COPY src ./src

RUN ./gradlew --no-daemon bootJar

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

ENV PORT=10000

COPY --from=build /app/build/libs/*.jar /app/app.jar

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar /app/app.jar"]
