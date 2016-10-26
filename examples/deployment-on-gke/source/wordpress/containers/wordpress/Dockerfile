# see https://github.com/docker-library/wordpress/blob/master/apache/Dockerfile
FROM php:apache

RUN a2enmod rewrite expires

# install the PHP extensions we need
RUN apt-get update && apt-get install -y apt-utils \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    unzip git libpng12-dev libjpeg-dev \
  && rm -rf /var/lib/apt/lists/* \
  && docker-php-ext-configure gd --with-png-dir=/usr --with-jpeg-dir=/usr \
  && docker-php-ext-install gd mysqli opcache

# set recommended PHP.ini settings
# see https://secure.php.net/manual/en/opcache.installation.php
RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=4000'; \
    echo 'opcache.revalidate_freq=60'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'opcache.enable_cli=1'; \
  } > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Install WP-CLI
RUN curl https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
  -o /usr/local/bin/wp \
  && chmod +x  /usr/local/bin/wp

#Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

WORKDIR /usr/src/bedrock

RUN git clone https://github.com/roots/bedrock /usr/src/bedrock \
    && git fetch -q --tags \
    && rm -drf /usr/src/bedrock/.git \
    && chown -R www-data:www-data /usr/src/bedrock

#Copy entry point and php config
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod 777 /entrypoint.sh
COPY php.ini /usr/local/etc/php/php.ini

# Fix apache
RUN sed -i 's#DocumentRoot.*#DocumentRoot /var/www/web#' /etc/apache2/apache2.conf \
    && echo 'ServerName localhost' >> /etc/apache2/apache2.conf \
    && mv /var/www/html /var/www/web

VOLUME /var/www
WORKDIR /var/www

# grr, ENTRYPOINT resets CMD now
ENTRYPOINT ["/entrypoint.sh"]
CMD ["apache2-foreground"]
