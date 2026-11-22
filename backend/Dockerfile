# Backend Dockerfile for HackFlow AI
FROM node:20-alpine

# Install curl for container health check
RUN apk add --no-cache curl

WORKDIR /app

# Install dependencies cleanly
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application source
COPY . .

# Set default production environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Container healthcheck against /api/health
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
