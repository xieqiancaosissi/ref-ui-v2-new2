FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY yarn.lock ./
RUN yarn install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules  ./node_modules
COPY . .
ARG BUILD_CRYPTO_KEY
ENV NEXT_PUBLIC_CRYPTO_KEY=${BUILD_CRYPTO_KEY}
RUN npm run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 8080
ENV PORT 8080

CMD ["node", "server.js"]


