FROM node:lts-alpine

WORKDIR /puraisu
COPY package.json yarn.lock ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN yarn

COPY frontend ./frontend/
RUN yarn build-front

COPY backend ./backend/

EXPOSE 5000

RUN addgroup -g 998 kosmos && adduser --uid 998 -D -G kosmos kosmos
USER kosmos:kosmos

CMD ["node", "backend/index.js"]
