FROM mysql:8.0

# Copy initialization scripts into the image so the MySQL entrypoint will run them
COPY init.sql /docker-entrypoint-initdb.d/init.sql