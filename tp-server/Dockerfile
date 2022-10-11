FROM node:16 as builder

ARG NPM_REPO

WORKDIR /node-app

ARG TZ=Europe/Helsinki
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

COPY . ./

RUN env echo -e "$NPM_REPO" > ~/.npmrc
RUN npm install && npx tsc --sourceMap false

# ==================================================

FROM node:16

ARG NPM_REPO

WORKDIR /node-app

ARG TZ=Europe/Helsinki
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

COPY --from=builder /node-app/dist/ ./dist
COPY package*.json ./

EXPOSE 3000

RUN env echo -e "$NPM_REPO" > ~/.npmrc
RUN npm install --production

ENTRYPOINT [ "node", "dist/index.js" ]
