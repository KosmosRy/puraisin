FROM node:lts-alpine

ENV PORT=5000
ENV NODE_ENV=production

EXPOSE $PORT

RUN addgroup -g 998 kosmos && adduser --uid 998 -D -G kosmos kosmos

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
