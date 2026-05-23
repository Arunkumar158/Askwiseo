# Dockerfile for Next.js Frontend (Askwiseo)
# -------------------------------------------------
# Multi‑stage build to keep the final image lightweight.
# Builder stage installs dependencies and builds the app.
# Runtime stage serves the built app with a minimal node image.

# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install only production‑ready packages for speed.
COPY package.json package-lock.json* .
RUN npm ci --foreground-scripts --ignore-scripts

# Copy the rest of the source code.
COPY . .

# Build the Next.js application.
RUN npm run build

# ---- Runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy only the built output and necessary files.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Install only production dependencies (no dev deps).
RUN npm ci --omit=dev --foreground-scripts --ignore-scripts

# Expose the default Next.js port.
EXPOSE 3000

# Environment variables (can be overridden at run time).
ENV NODE_ENV=production

# Start the server.
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
