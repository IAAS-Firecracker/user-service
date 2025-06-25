FROM node:22.10.0

RUN mkdir /app
WORKDIR /app

VOLUME /tmp

# Install dependencies first to leverage Docker layer caching
COPY package*.json ./

RUN npm ci

# Install nodemon locally instead of globally to optimize build time
RUN npm install nodemon --save-dev

COPY . .

CMD ["npm", "run", "dev"]
