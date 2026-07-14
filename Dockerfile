FROM php:8.2-apache

# Install required PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy all project files into Apache's document root
COPY . /var/www/html/

# Start Apache
CMD ["apache2-foreground"]
