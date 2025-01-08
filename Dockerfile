FROM node:20-bullseye

RUN apt-get update && apt-get install -y \
  libimage-exiftool-perl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm i

COPY . /app

RUN npm run build

RUN npm prune --production

EXPOSE 3000

CMD ["npm", "run", "start"]