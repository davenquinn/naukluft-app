FROM node:14
RUN npm install -g npm@7 lerna

# Prepare for installation
WORKDIR /app/
COPY ./packages/naukluft-data-backend/package.json packages/naukluft-data-backend/
COPY ./packages/vector-tile-server/package.json packages/vector-tile-server/
COPY ./package.json ./tsconfig.json ./lerna.json ./.npmrc ./
<<<<<<< HEAD

RUN lerna bootstrap --include-dependents --include-dependencies --scope=naukluft-data-backend --hoist
RUN lerna bootstrap --include-dependents --include-dependencies --scope=@macrostrat/vector-tile-server --hoist
=======
RUN npm install
>>>>>>> origin/prep-deployment

COPY ./packages/naukluft-data-backend/ packages/naukluft-data-backend/
COPY ./packages/vector-tile-server/ packages/vector-tile-server/

EXPOSE 5555

CMD npx ts-node packages/naukluft-data-backend/src/api.ts
