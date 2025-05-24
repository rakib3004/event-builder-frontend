# Build stage
FROM node:16 as builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Runtime stage
FROM nginx:alpine

COPY --from=builder /app/dist/event-builder /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80