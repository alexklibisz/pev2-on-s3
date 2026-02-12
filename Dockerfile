FROM node:25-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build:client
RUN npm run build:server

FROM node:25-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./dist/client/dist
COPY examples/plans/ examples/plans/

EXPOSE 3000
CMD ["node", "dist/server/index.js"]
