FROM php:8.2-apache

# Copie des fichiers dans le container
COPY . /var/www/html/

# Activation de mod_rewrite si besoin
RUN a2enmod rewrite

# Configuration par défaut
EXPOSE 80

#Autoriser l'écriture du répertoire data
RUN mkdir -p /var/www/html/data && chmod 777 /var/www/html/data
