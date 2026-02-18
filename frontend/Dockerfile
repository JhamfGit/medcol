# Dockerfile para Medcol Docs
# Utiliza multi-stage builds para optimizar el tamaño y la seguridad

# ETAPA 1: Dependencias y build
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias para compilaciones nativas (si son necesarias)
RUN apk add --no-cache libc6-compat

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Argumentos de construcción
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Construir la aplicación
RUN npm run build

# ETAPA 2: Imagen de producción
FROM node:18-alpine AS runner

WORKDIR /app

# Establecer variables de entorno para producción
ENV NODE_ENV production

# Añadir usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde la etapa de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Establecer permisos correctos
RUN chown -R nextjs:nodejs /app

# Cambiar al usuario no-root
USER nextjs

# Exponer el puerto que utilizará la aplicación
EXPOSE 3000

# Definir variable de entorno para el puerto interno
ENV PORT 3000
# Permitir conexiones desde hosts externos
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar la aplicación
CMD ["node", "server.js"]