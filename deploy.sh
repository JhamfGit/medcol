#!/bin/bash
# Script para aplicar todos los cambios y reiniciar los servicios

# Colores para mejor legibilidad
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Aplicando solución para certificados SSL ===${NC}"

# 1. Verificar que todos los directorios necesarios existen
echo -e "\n${YELLOW}Verificando directorios...${NC}"
mkdir -p ./acme
mkdir -p ./vhost.d
mkdir -p ./html
mkdir -p ./certs

# 2. Asegurarnos que los archivos tienen los permisos correctos
echo -e "\n${YELLOW}Configurando permisos...${NC}"
chmod 755 ./acme
chmod 755 ./vhost.d
chmod 755 ./html
chmod 755 ./certs

# 3. Crear o verificar el archivo vhost.d
echo -e "\n${YELLOW}Configurando vhost.d/docs.saludmedcol.com...${NC}"
cat > ./vhost.d/docs.saludmedcol.com << 'EOL'
location ^~ /.well-known/acme-challenge/ {
    auth_basic off;
    allow all;
    root /usr/share/nginx/html;
    try_files $uri =404;
    break;
}

location / {
    proxy_pass http://next-frontend:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /api/ {
    proxy_pass http://nest-backend:4000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOL

# 4. Limpiar certificados antiguos para forzar renovación
echo -e "\n${YELLOW}Limpiando certificados antiguos...${NC}"
rm -rf ./certs/docs.saludmedcol.com*
rm -rf ./acme/tu-email*

# 5. Actualizar el docker-compose.yml (asumiendo que ya está modificado)
echo -e "\n${YELLOW}Asegúrate de actualizar tu docker-compose.yml según las instrucciones proporcionadas${NC}"
echo -e "Presiona Enter para continuar..."
read

# 6. Detener los contenedores actuales
echo -e "\n${YELLOW}Deteniendo contenedores...${NC}"
docker compose down

# 7. Limpiar los archivos de configuración generados automáticamente
echo -e "\n${YELLOW}Limpiando configuraciones antiguas...${NC}"
rm -f ./vhost.d/default*

# 8. Reiniciar los contenedores
echo -e "\n${YELLOW}Iniciando contenedores con la nueva configuración...${NC}"
docker compose up -d

# 9. Esperar un momento para que los servicios se inicien
echo -e "\n${YELLOW}Esperando 10 segundos para que los servicios se inicien...${NC}"
sleep 10

# 10. Verificar el estado de los contenedores
echo -e "\n${YELLOW}Verificando estado de los contenedores...${NC}"
docker compose ps

# 11. Ver los logs del servicio Let's Encrypt
echo -e "\n${YELLOW}Mostrando logs de nginx-letsencrypt...${NC}"
docker compose logs nginx-letsencrypt

echo -e "\n${GREEN}Cambios aplicados. Utiliza 'docker compose logs -f nginx-letsencrypt' para monitorear el proceso de certificación.${NC}"
echo -e "${YELLOW}Si el problema persiste, considera forzar la renovación con: docker compose exec nginx-letsencrypt /app/force_renew${NC}"
