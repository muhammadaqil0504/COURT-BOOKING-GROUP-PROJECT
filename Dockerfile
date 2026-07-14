FROM php:8.2-apache

RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy ONLY the website files
COPY public/ /var/www/html/

CMD ["apache2-foreground"]
