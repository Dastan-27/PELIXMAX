# Usar una imagen ligera de Alpine para un menor tamaño
FROM node:22-alpine AS base

# Habilitar corepack para usar pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Etapa de dependencias: Instalar todas las dependencias (incluidas las de desarrollo)
FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile

# Etapa de compilación: Compilar la aplicación
FROM base AS build
WORKDIR /app
# Copiar archivos del paquete
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
# Copiar node_modules desde la etapa de dependencias
COPY --from=dependencies /app/node_modules ./node_modules
# copiar todos los archivos del proyecto (.dockerignore filtrará los archivos innecesarios)
COPY . .

# Ejecutar pruebas y verificación de tipos antes de compilar para garantizar la calidad del código
# Establecer CI=true fuerza a vitest a ejecutarse en modo CI (ejecuta una vez en lugar del modo de vigilancia)
RUN pnpm run typecheck
RUN CI=true pnpm run test

RUN pnpm run build

# Etapa de dependencias de producción: Instalar solo dependencias de producción
FROM base AS production-dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install --prod --frozen-lockfile

# Etapa del corredor: Imagen ligera final para producción
FROM base AS runner
WORKDIR /app

# Establecer variables de entorno
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# SEGURIDAD: Ejecutar la aplicación como usuario no root
# Usamos el usuario 'node' incorporado proporcionado por la imagen node:20-alpine
RUN chown -R node:node /app
USER node

# Copiar solo los archivos necesarios para la producción con la propiedad adecuada
# Changed '--from=builder' back to '--from=production-dependencies' for node_modules to avoid bringing devDependencies into production
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/build ./build
COPY --chown=node:node package.json ./

EXPOSE 3000

# Iniciar la aplicación usando pnpm según lo solicitado, o llamar directamente al bin correcto
# Se corrigieron errores tipográficos: react-router-server -> react-router-serve, y .build -> build
CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
