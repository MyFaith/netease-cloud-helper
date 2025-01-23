FROM node

WORKDIR /app
COPY . .

RUN npm i

EXPOSE 80

RUN npx NeteaseCloudMusicApi@latest && npm run dev