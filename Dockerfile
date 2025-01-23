FROM node:16.13.1-alpine as build
ENV VITE_API_URL=http://localhost:3000
WORKDIR /app
COPY . .

RUN npm i ; \
  npm run build

FROM nginx:1.20.2-alpine as app
COPY --from=build /app/dist /usr/share/nginx/html

RUN apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.14/main libuv \
  && apk add --no-cache --update-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.14/main nodejs npm \
  && npm i -g $(awk -F \" '{if($2=="NeteaseCloudMusicApi") print $2"@"$4}' /usr/local/lib/package.json) \
  && rm -f /usr/local/lib/package.json

COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80 3000

CMD nginx ; exec npx NeteaseCloudMusicApi@latest