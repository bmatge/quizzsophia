FROM php:8.2-apache

# Copie des fichiers dans le container
COPY . /var/www/html/

# Activation de mod_rewrite si besoin
RUN a2enmod rewrite

# Configuration par défaut
EXPOSE 80
