FROM node:latest

RUN apt update -y
RUN apt install openjdk-8-jdk -y
COPY . .

RUN npm i
RUN npm run build
CMD npm run start