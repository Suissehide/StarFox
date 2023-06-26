FROM mariadb:11.0.2-jammy

LABEL version="1.0"
LABEL description="MariaDB Server"

HEALTHCHECK --start-period=5m \
  CMD mariadb -uroot -p'${MARIADB_ROOT_PASSWORD}' -e 'SELECT @@datadir;' || exit 1

# Expose ports.
EXPOSE 3306