FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

EXPOSE 5173

CMD ["npx", "vite", "--host"]