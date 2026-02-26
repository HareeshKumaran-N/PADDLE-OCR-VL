FROM node:20-slim

RUN apt-get update && apt-get install -y poppler-utils

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/index.js"]