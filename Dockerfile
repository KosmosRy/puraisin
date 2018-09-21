FROM node:10-alpine as frontend

WORKDIR /build
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn
COPY frontend/ ./
RUN yarn build

FROM node:10-alpine
WORKDIR /puraisu
COPY package.json .
COPY yarn.lock .
RUN yarn

COPY ./*.js ./
COPY --from=frontend /build/build ./frontend/build

EXPOSE 5000

RUN addgroup -g 998 kosmos && adduser --uid 998 -D -G kosmos kosmos
USER kosmos:kosmos

CMD ["node", "index.js"]
