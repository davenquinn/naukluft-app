FROM node:14
RUN npm install -g npm@7 lerna

# Prepare for installation
WORKDIR /app

COPY ./frontend/packages/naukluft-data-backend/package.json frontend/packages/naukluft-data-backend/
COPY ./frontend/packages/vector-tile-server/package.json frontend/packages/vector-tile-server/
COPY ./package.json ./lerna.json /app/
COPY ./api ./api/

RUN lerna bootstrap --hoist --include-dependents --include-dependencies --scope=naukluft-data-backend -- --production
RUN npm install --prefix api --production

COPY ./frontend/tsconfig.json frontend/tsconfig.json
COPY ./frontend/packages/naukluft-data-backend frontend/packages/naukluft-data-backend
COPY ./frontend/packages/vector-tile-server frontend/packages/vector-tile-server

WORKDIR /app/api

EXPOSE 5555

CMD npm run start
