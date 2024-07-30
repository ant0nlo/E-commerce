# Stage 1: Build the React app
FROM node:lts-alpine AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the React app with NGINX
FROM nginx:alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
