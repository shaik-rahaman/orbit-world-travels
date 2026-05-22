# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Build arguments for environment configuration
# Local: http://localhost:3008/api/orbit-world
# Production (Azure): https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3008/api/orbit-world
ARG NEXT_PUBLIC_ENVIRONMENT=development

# Set environment variables for build
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY tailwind.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code
COPY public ./public
COPY app ./app
COPY components ./components
COPY config ./config
COPY constants ./constants
COPY hooks ./hooks
COPY services ./services
COPY store ./store
COPY types ./types
COPY utils ./utils

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Build arguments to pass runtime environment
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3008/api/orbit-world
ARG NEXT_PUBLIC_ENVIRONMENT=production

# Set environment variables for runtime
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY next.config.ts ./

# Expose port
EXPOSE 8008

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8008', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["npm", "start"]
