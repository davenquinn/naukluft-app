FROM node:14
RUN npm install -g npm@7 lerna

# Prepare for installation
WORKDIR /app/
COPY ./packages/naukluft-data-backend/package.json packages/naukluft-data-backend/
COPY ./packages/vector-tile-server/package.json packages/vector-tile-server/
COPY ./package.json ./tsconfig.json ./lerna.json ./.npmrc ./
RUN lerna bootstrap --scope naukluft-data-backend --include-dependencies
RUN npm install

COPY ./packages/naukluft-data-backend/ packages/naukluft-data-backend/
COPY ./packages/vector-tile-server/ packages/vector-tile-server/

EXPOSE 5555

CMD npx ts-node packages/naukluft-data-backend/src/api.ts
