FROM node:20 AS builder

ENV NODE_ENV=production

# Prepare for installation
WORKDIR /usr/src/app

COPY .yarn/releases .yarn/releases
COPY .yarnrc.yml yarn.lock package.json ./

# Add submodules
COPY ./packages /app/packages/

RUN yarn install



EXPOSE 5555

CMD yarn run start
