FROM node:22-bookworm-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS development

ENV NODE_ENV=development \
    PORT=5173 \
    HOSTNAME=0.0.0.0

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "5173"]

FROM dependencies AS build

ARG NEXT_PUBLIC_BACKEND_URL=
ARG BACKEND_INTERNAL_URL=http://backend:3000
ARG NEXT_PUBLIC_TELEGRAM_BOT_ID
ARG NEXT_PUBLIC_TELEGRAM_ORIGIN=http://127.0.0.1:5173

ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL} \
    BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL} \
    NEXT_PUBLIC_TELEGRAM_BOT_ID=${NEXT_PUBLIC_TELEGRAM_BOT_ID} \
    NEXT_PUBLIC_TELEGRAM_ORIGIN=${NEXT_PUBLIC_TELEGRAM_ORIGIN}

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=5173 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 5173

CMD ["node", "server.js"]
