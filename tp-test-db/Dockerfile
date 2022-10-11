FROM mariadb:10

ENV MYSQL_RANDOM_ROOT_PASSWORD=yes

# The database stores all times in UTC
ENV TZ=UTC

ENV MYSQL_DATABASE=tp
ENV MYSQL_USER=tp

COPY tp-db.sql /docker-entrypoint-initdb.d/
