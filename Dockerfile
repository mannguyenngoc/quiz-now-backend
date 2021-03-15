# FROM node:latest

# WORKDIR /

# COPY ["package.json", "package-lock.json*", "./"]

# RUN npm install --production

# COPY . .

# EXPOSE 3000
# CMD [ "node", "index.js" ]

FROM node:latest

RUN mkdir /src


RUN npm install nodemon -g

WORKDIR /src/app

ADD /package.json /src/package.json
# ADD /nodemon.json /src/nodemon.json

RUN npm install

EXPOSE 3000

# CMD ["nodemon", "/src/app/index.js"]
CMD ["npm", "start"]

