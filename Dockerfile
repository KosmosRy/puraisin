FROM node:buster-slim

ENV PORT=5000
ENV NODE_ENV=production

EXPOSE $PORT

RUN addgroup --system -gid 998 kosmos && adduser --system --uid 998 -gid 998 kosmos

WORKDIR puraisin
COPY migrations migrations
COPY public public
COPY views views

COPY .yarn .yarn
COPY .pnp* .yarnrc.yml babel.config.json package.json rollup.config.js tsconfig.json yarn.lock ./
COPY src src
RUN yarn && yarn build

USER kosmos:kosmos
CMD ["yarn", "node", "dist-server/server/app.js"]
