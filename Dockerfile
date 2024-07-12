FROM node as node

WORKDIR /app
COPY . .

ENV VITE_API_URL="https://163musicapi.coolxy.cn"

RUN npm i && \
  npm run build

FROM nginx as nginx

COPY --from=node /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80