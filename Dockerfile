# Install dependencies only when needed
FROM node:18-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn --immutable;

# Rebuild the source code only when needed
FROM node:18-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
#COPY --from=deps /app/.yarn ./.yarn
#COPY --from=deps /app/.yarnrc.yml ./
#COPY --from=deps /app/yarn.lock ./
COPY .env public src next.config.js package.json tsconfig.json .eslintrc.js .prettierrc.json node-env.d.ts ./

ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner

RUN apk add tzdata
RUN cp /usr/share/zoneinfo/Europe/Helsinki /etc/localtime
RUN echo "Europe/Helsinki" > /etc/timezone
ENV TZ Europe/Helsinki

RUN addgroup -S -g 998 kosmos
RUN adduser --system --uid 998 -gid 998 kosmos
USER 998:998

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY public ./public
COPY migrations ./migrations

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV PORT 3000
EXPOSE $PORT

CMD ["node", "server.js"]
