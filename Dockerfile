FROM node:22.10.0

# RUN mkdir /app
# WORKDIR /app

VOLUME /tmp

COPY package*.json ./

RUN npm ci

COPY . .

# RUN npm run build

CMD ["npm", "start"]
