FROM node

WORKDIR /app
COPY . .

RUN npm i && \
  npx NeteaseCloudMusicApi@latest &

EXPOSE 80

RUN npm run dev