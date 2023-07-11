FROM node:18

# Prepare for installation
WORKDIR /app

COPY ./frontend/packages/naukluft-data-backend /app/frontend/packages/naukluft-data-backend/
COPY ./frontend/packages/vector-tile-server /app/frontend/packages/vector-tile-server/
COPY ./api /app/api/

WORKDIR /app/api

RUN yarn install

EXPOSE 5555

CMD yarn run start
