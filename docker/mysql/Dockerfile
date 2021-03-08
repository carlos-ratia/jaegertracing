FROM mysql:5.7

COPY /docker/mysql/mysql.cnf /etc/mysql/conf.d/
COPY /docker/mysql/setup.sql /docker-entrypoint-initdb.d/
