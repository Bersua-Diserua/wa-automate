FROM node:alpine3.16 as base

WORKDIR /app

RUN apk add git
RUN apk --update --no-cache add curl

FROM base as builder

COPY . .

RUN yarn install

RUN yarn build

RUN npm prune --omit=dev -f

FROM base

COPY --from=builder /app/ /app/

EXPOSE 3000:3000

CMD ["node", "dist"]
