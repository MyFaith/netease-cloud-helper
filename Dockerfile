FROM node as node

WORKDIR /app
COPY . .

RUN npm i && \
  npm build

FROM nginx as nginx

COPY --from=node /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80