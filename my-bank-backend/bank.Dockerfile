FROM node:latest
RUN mkdir -p ~/back
WORKDIR /back
COPY package.json package.json
RUN npm install --no-cache
COPY package-lock.json package-lock.json
EXPOSE 4000
RUN mkdir -p ~/src
CMD ["npm","run","dev"]
