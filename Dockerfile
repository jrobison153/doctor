FROM node:boron

WORKDIR /usr/src/app

COPY . .

ENTRYPOINT ["npm", "start"]