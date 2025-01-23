FROM node:20-alpine as build
WORKDIR /app
COPY . .

RUN npm i ; \
  npm run build

FROM nginx:1.27-alpine-slim as app
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/

RUN apk add --no-cache npm
RUN npm install -g NeteaseCloudMusicApi

EXPOSE 80 3000

CMD nginx ; exec npx NeteaseCloudMusicApi