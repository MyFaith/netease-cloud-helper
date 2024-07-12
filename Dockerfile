FROM node as node

WORKDIR /app
COPY . .

ENV VITE_API_URL=http://myfaith.cc:4004

RUN npm i && \
npm run build

FROM nginx as nginx

COPY --from=node /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80