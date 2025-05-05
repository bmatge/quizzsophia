FROM php:8.2-apache

# Copie du code
COPY . /var/www/html/

# Activation de mod_rewrite si besoin
RUN a2enmod rewrite

# ⚠️ Recrée le dossier après la copie pour s'assurer des droits
RUN rm -rf /var/www/html/data && \
    mkdir /var/www/html/data && \
    chmod 777 /var/www/html/data
