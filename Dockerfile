FROM node:22.10.0

RUN mkdir /app
WORKDIR /app

VOLUME /tmp

RUN npm install -g nodemon

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["npm", "run", "dev"]
