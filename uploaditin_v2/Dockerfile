# uploaditin_v2/Dockerfile

# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Set backend URL for Next.js rewrites (runtime env, not baked in)
ARG BACKEND_URL=http://backend:5000
ENV BACKEND_URL=$BACKEND_URL

# Supabase public keys must be available at build time so Next.js can
# embed them in the client-side bundle during `next build`.
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_KEY
ENV NEXT_PUBLIC_SUPABASE_KEY=$NEXT_PUBLIC_SUPABASE_KEY

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy all source code
COPY . .

# Build the Next.js application
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS runner

WORKDIR /app

# Only install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public 2>/dev/null || true

# Run as non-root user for security
RUN adduser -D appuser
USER appuser

# Port default Next.js
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
