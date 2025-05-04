# Use a multi-stage build for smaller image size
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and ecosystem.config.js
COPY package*.json ./
COPY ecosystem.config.js ./

# Install dependencies (only production)
RUN npm install --omit=dev

# Copy application code
COPY src/ src/

# Final stage
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app /app

# Install PM2 globally in the final image
RUN npm install -g pm2

# Create uploads directory and set permissions
RUN mkdir -p /app/src/public/uploads \
    && chown -R node:node /app/src/public \
    && chmod -R 775 /app/src/public

# Run as non-root user
USER node

# Expose port
EXPOSE 8000

# Start the application with PM2
CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]

# Optional: Add health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1