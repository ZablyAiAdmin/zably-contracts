# Multi-stage build for zably-contracts
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8.15.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build all packages
RUN pnpm -w build

# Production stage
FROM node:18-alpine AS runtime

# Install pnpm
RUN npm install -g pnpm@8.15.0

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S zably -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/*/

# Install production dependencies only
RUN pnpm install --prod --no-frozen-lockfile

# Copy built artifacts
COPY --from=builder /app/packages/*/dist ./packages/*/dist/
COPY --from=builder /app/dist ./dist/

# Copy other necessary files
COPY README.md HOWTO.md ./

# Change ownership
RUN chown -R zably:nodejs /app
USER zably

# Health check endpoint (if needed)
EXPOSE 8080

# Default command
CMD ["node", "-e", "console.log('Zably Contracts package ready'); process.exit(0)"]