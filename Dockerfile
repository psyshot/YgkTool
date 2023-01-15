# Naively Simple Node Dockerfile

FROM node:18-alpine

RUN mkdir -p /home/app/ && chown -R node:node /home/app
WORKDIR /home/app
COPY --chown=node:node . .

USER node

RUN yarn install --frozen-lockfile
RUN yarn build

EXPOSE 8964
CMD [ "yarn", "start" ]
