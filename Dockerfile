FROM node

WORKDIR /app
COPY . .

RUN npm i && \
  npx NeteaseCloudMusicApi@latest && \
  npm run dev 

EXPOSE 80