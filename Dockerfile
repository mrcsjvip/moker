# Build server image:
# docker build -f deploy/Dockerfile --target server -t moker-server .
# Build admin image (static dist only, no nginx):
# docker build -f deploy/Dockerfile --target admin -t moker-admin .

FROM node:20-alpine AS server-build
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci
COPY server ./server
RUN cd server && npm run build

FROM node:20-alpine AS server
WORKDIR /app
ENV NODE_ENV=production
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/bootstrap.js ./bootstrap.js
COPY --from=server-build /app/server/public ./public
COPY --from=server-build /app/server/typings ./typings
EXPOSE 8001
CMD ["node", "./bootstrap.js"]

FROM node:20-alpine AS admin-build
WORKDIR /app
COPY admin/package.json admin/package-lock.json ./admin/
RUN cd admin && npm ci
COPY admin ./admin
RUN cd admin && npm run build

FROM alpine:3.20 AS admin
WORKDIR /app
COPY --from=admin-build /app/admin/dist ./dist
