########## BUILD STAGE ##########
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --progress=false

COPY . .
RUN npm run build

########## RUNTIME STAGE ##########
FROM nginx:1.27-alpine AS runtime

# Copy built assets
COPY --from=build /app/build /usr/share/nginx/html

# Replace default nginx config with optimized one
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]