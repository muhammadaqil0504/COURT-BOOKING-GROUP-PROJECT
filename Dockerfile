FROM php:8.2-apache

# Install PHP MySQL extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy ONLY the contents of the public folder
COPY public/ /var/www/html/

CMD ["apache2-foreground"]
