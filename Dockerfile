FROM node:8.15.0 AS build-env
ADD . /app
WORKDIR /app
RUN npm install

FROM gcr.io/distroless/nodejs
COPY --from=build-env /app /app
WORKDIR /app
CMD ["main.js"]
