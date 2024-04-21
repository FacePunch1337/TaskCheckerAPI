FROM node:14

# Установка утилиты telnet
RUN apt-get update && apt-get install -y telnet

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
