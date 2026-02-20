FROM webdevops/php-nginx:8.3-alpine

ENV WEB_DOCUMENT_ROOT=/app/public
ENV PHP_DISMOD=ioncube

WORKDIR /app

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --no-dev

COPY . .
RUN composer dump-autoload --optimize --no-dev

RUN chown -R application:application /app \
    && chmod -R 775 storage bootstrap/cache

# Laravel scheduler cron
RUN echo "* * * * * cd /app && php artisan schedule:run >> /dev/null 2>&1" | crontab -u application -

EXPOSE 80
