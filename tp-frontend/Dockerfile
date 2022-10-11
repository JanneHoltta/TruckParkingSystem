FROM node:16 as builder

ARG APP
ARG NPM_REPO

WORKDIR /vue-app

ARG TZ=Europe/Helsinki
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

COPY . ./

RUN env echo -e "$NPM_REPO" > ~/.npmrc
RUN npm install && npm run build:"$APP"

COPY ./src/"$APP"/assets/favicon* ./dist/

# ==================================================

FROM gitlab.yobitti.fi:5001/yobitti/apache-php

ARG TZ=Europe/Helsinki
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

COPY --from=builder /vue-app/dist/ /var/www/html
