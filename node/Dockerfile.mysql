# Use an official MySQL runtime as a parent image
FROM mysql/mysql-server:latest

# Set the root password for MySQL
ENV MYSQL_ROOT_PASSWORD password

# Set up another MySQL user
ENV MYSQL_USER john
ENV MYSQL_PASSWORD password

# Set up a databse called csc468
ENV MYSQL_DATABASE FusionBank

#grant necessary privileges to user
RUN echo "GRANT ALL PRIVILEGES ON csc468.* TO 'john'@'%' WITH GRANT OPTION;" > /docker-entrypoint-initdb.d/grant_permissions.sql

# Copy the SQL initialization script to the container
COPY init.sql /docker-entrypoint-initdb.d/

#Expose port 3306
EXPOSE 3306
