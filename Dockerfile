FROM node:20 AS builder

ENV NODE_ENV=production

# Prepare for installation
WORKDIR /usr/src/app

COPY .yarn/releases .yarn/releases
COPY .yarnrc.yml yarn.lock package.json ./

# Add submodules
COPY ./packages /usr/src/app/packages/

RUN yarn install

# Build the app
COPY . .

RUN yarn run build

EXPOSE 3000

CMD yarn run preview
