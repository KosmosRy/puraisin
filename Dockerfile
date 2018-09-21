FROM node:10-alpine as frontend

WORKDIR /build
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn
COPY frontend/ ./
RUN yarn build

FROM node:10-alpine
RUN addgroup -g 998 kosmos && adduser --uid 998 -D -G kosmos kosmos
WORKDIR /puraisu
COPY --from=frontend /build/build ./frontend/build
RUN chown -R kosmos:kosmos .
USER kosmos:kosmos

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY ./*.js ./

EXPOSE 5000

CMD ["node", "index.js"]
