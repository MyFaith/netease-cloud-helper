FROM node as node

WORKDIR /app
COPY . .

ENV VITE_API_URL=http://localhost:3000

RUN npm i ; \
  npm run build

FROM nginx as nginx

COPY --from=node /app/dist /usr/share/nginx/html

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories &&\
  apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.14/main libuv \
  && apk add --no-cache --update-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.14/main nodejs npm \
  && npm i -g $(awk -F \" '{if($2=="NeteaseCloudMusicApi") print $2"@"$4}' /usr/local/lib/package.json) \
  && rm -f /usr/local/lib/package.json

COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80 3000

CMD nginx ; exec npx NeteaseCloudMusicApi@latest