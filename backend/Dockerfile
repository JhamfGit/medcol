# Usa la imagen oficial de Node.js
FROM node:20

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY package.json package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia todo el código fuente
COPY . .

# Construir la aplicación (compilar TypeScript)
RUN npm run build

# Expone el puerto en el que correrá NestJS
EXPOSE 4000

# Comando para iniciar la aplicación en producción
CMD ["npm", "run", "start:prod"]
