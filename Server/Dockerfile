FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

ENV PORT=5000
ENV MONGO_URI=mongodb://mongodb:27017/electricpulse

CMD ["node", "server.js"]