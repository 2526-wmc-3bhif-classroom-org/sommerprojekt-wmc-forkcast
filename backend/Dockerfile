FROM node:22-slim

WORKDIR /app

# Link the package to your GitHub repository
LABEL org.opencontainers.image.source=https://github.com/2526-wmc-3bhif-classroom-org/sommerprojekt-wmc-forkcast

# Install build dependencies for better-sqlite3 in case prebuilds fail
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
