# Multi-stage Dockerfile to build backend (Maven), three frontends (Node), and AI agent (Python)
# Final image runs nginx (serves frontends), backend (java), and ai-agent (python) under supervisord

# ----------------
# Backend build
# ----------------
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /backend
COPY staylio-backend/pom.xml ./
RUN mvn dependency:go-offline -B
COPY staylio-backend/src ./src
RUN mvn package -DskipTests -B -e

# ----------------
# Frontend - user
# ----------------
FROM node:20-alpine AS frontend-user-build
WORKDIR /frontend-user
COPY staylio/package*.json ./
RUN npm ci --silent
COPY staylio ./
RUN npm run build --silent

# ----------------
# Frontend - admin
# ----------------
FROM node:20-alpine AS frontend-admin-build
WORKDIR /frontend-admin
COPY staylio-admin-dashboard/package*.json ./
RUN npm ci --silent
COPY staylio-admin-dashboard ./
RUN npm run build --silent

# ----------------
# Frontend - host
# ----------------
FROM node:20-alpine AS frontend-host-build
WORKDIR /frontend-host
COPY staylio-host-dashboard/package*.json ./
RUN npm ci --silent
COPY staylio-host-dashboard ./
RUN npm run build --silent

# ----------------
# AI agent build (copy only)
# ----------------
FROM python:3.10-slim AS ai-build
WORKDIR /ai
COPY staylio-ai-agent/requirements.txt ./
COPY staylio-ai-agent ./
# We'll install requirements in final image to avoid duplicating system packages

# ----------------
# Final runtime image
# ----------------
FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends openjdk-17-jre-headless python3 python3-pip nginx supervisor ca-certificates \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend jar
COPY --from=backend-build /backend/target/*.jar /app/backend/app.jar

# Copy AI agent source and install Python deps
COPY --from=ai-build /ai /app/ai
RUN pip3 install --no-cache-dir -r /app/ai/requirements.txt || true

# Copy frontend builds into nginx html
RUN rm -rf /usr/share/nginx/html/*
COPY --from=frontend-user-build /frontend-user/dist /usr/share/nginx/html/
COPY --from=frontend-admin-build /frontend-admin/dist /usr/share/nginx/html/admin/
COPY --from=frontend-host-build /frontend-host/dist /usr/share/nginx/html/host/

# Copy nginx config and supervisord
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisor/supervisord.conf

# Create log dir
RUN mkdir -p /var/log/supervisor /var/log/nginx /var/log/app

# Expose ports: nginx (80), backend (8080), ai-agent (5000)
EXPOSE 80 8080 5000

# Healthcheck (simple TCP check on nginx)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD curl -f http://localhost/ || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
