# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Build argument for base URL
ARG NEXT_PUBLIC_BASE_URL=https://9x.al
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage with distroless
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9430
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 9430

CMD ["server.js"]
