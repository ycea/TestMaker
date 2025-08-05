FROM php:8.4-fpm
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer
# on line 7 is required dependecies for gd extension for php
# on line 8 is required config to enable font and jpg extension
RUN apt-get update && apt-get install -y \
    zip unzip curl libzip-dev libonig-dev libxml2-dev lsof \
    libpng-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql zip gd


# Установим Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

WORKDIR /var/wwwa