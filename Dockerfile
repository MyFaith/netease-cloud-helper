FROM node as node

WORKDIR /app
COPY . .

ENV VITE_API_URL=http://localhost:3000

RUN npm i && \
npm run build

FROM nginx as nginx

COPY --from=node /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/

RUN apt update && apt install nodejs npm npx

EXPOSE 80

RUN npx NeteaseCloudMusicApi@latest