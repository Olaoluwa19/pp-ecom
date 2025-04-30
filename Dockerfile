# Use a multi-stage build for smaller image size
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (only production)
RUN npm install --omit=dev

# Copy application code
COPY src/ src/

# Final stage
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app /app

# Run as non-root user
USER node

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]

# Optional: Add health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1