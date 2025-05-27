# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY . .
RUN npm install && npm run build --base-href=/ --omit=dev

# Verification
RUN find /app/dist -type f

# Runtime stage
FROM nginx:alpine

# Clear default content
RUN rm -rf /usr/share/nginx/html/*

# Copy ALL dist contents (adjust if your files are nested differently)
COPY --from=builder /app/dist/event-builder-frontend/* /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80