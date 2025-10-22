# =========================
# Etapa 1: Build do frontend
# =========================
FROM public.ecr.aws/docker/library/node:18-alpine AS build
WORKDIR /app

# Permite sobrescrever a base da API no build (padrão: proxy do nginx)
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Instala dependências (usa cache de camadas)
COPY package*.json ./
# tenta npm ci (com package-lock); se não houver lock, cai para npm i
RUN npm ci || npm i

# Copia o código e faz o build
COPY . .
RUN npm run build

# =========================
# Etapa 2: Servir com Nginx
# =========================
FROM public.ecr.aws/docker/library/nginx:stable-alpine

# Config do Nginx (SPA + proxy se você configurou no nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os artefatos gerados pelo build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
