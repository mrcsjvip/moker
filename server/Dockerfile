
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS server
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/bootstrap.js ./bootstrap.js
COPY --from=build /app/public ./public
COPY --from=build /app/typings ./typings
EXPOSE 8001
CMD ["node", "./bootstrap.js"]