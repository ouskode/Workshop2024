FROM node:lts-slim

WORKDIR /server

COPY . .

RUN npm i

EXPOSE 3000

CMD ["node", "app.js"]