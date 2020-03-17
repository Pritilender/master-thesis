FROM node:latest

RUN npm -g config set user root
RUN npm install -g artillery

COPY . /scenarios

WORKDIR /scenarios

ENTRYPOINT ["artillery"]