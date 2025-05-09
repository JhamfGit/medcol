# Usa una imagen base oficial de Nginx
FROM nginx:alpine

# Copia el archivo de configuración de Nginx al contenedor
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copia la carpeta de error_pages para manejar páginas de error personalizadas
COPY ./error_pages /var/www/error_pages
1~i# Usa una imagen base oficial de Nginx
FROM nginx:alpine

# Copia el archivo de configuración de Nginx al contenedor
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copia la carpeta de error_pages para manejar páginas de error personalizadas
COPY ./error_pages /var/www/error_pages
