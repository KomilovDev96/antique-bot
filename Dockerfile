FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY app.js ./
COPY src ./src

RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "app.js"]
