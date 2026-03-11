# Instágio 1: Build da aplicação
FROM node:18-alpine as builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração de dependências
COPY package.json package-lock.json ./

# Instala as dependências (preferível npm ci para reprodutibilidade, mas npm install se não houver lock syncado)
RUN npm install

# Copia o resto dos arquivos do projeto
COPY . .

# Faz o build de produção do Vite
RUN npm run build

# Estágio 2: Subir o servidor Nginx otimizado
FROM nginx:alpine

# Remove as configurações padrões do nginx
RUN rm -rf /etc/nginx/conf.d

# Copia nossa configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos gerados no estágio de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80 que o Nginx usará internamente
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
