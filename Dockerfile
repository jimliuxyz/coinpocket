FROM node:10.0.0

# RUN mkdir -p /usr/src/app
WORKDIR /app
RUN npm install -g truffle

COPY package.json .
RUN npm install

# COPY server ./server
COPY . /app
EXPOSE 8081

# CMD ["node", "server/server.js"]
CMD ["sleep","99999999"]
