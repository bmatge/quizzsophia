FROM php:8.2-apache

# Copie du code source
COPY . /var/www/html/

# Activation de mod_rewrite (si vous en avez besoin)
RUN a2enmod rewrite

# Supprimer uniquement history.json (pas les autres quiz)
RUN rm -f /var/www/html/data/history.json && \
    touch /var/www/html/data/history.json && \
    chmod 666 /var/www/html/data/history.json
