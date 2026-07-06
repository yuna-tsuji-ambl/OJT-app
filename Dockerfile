# ---- ビルド ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci

COPY packages/shared packages/shared
COPY apps/api apps/api
COPY apps/web apps/web

RUN npm run build -w @ojt-app/shared
RUN npm run build -w @ojt-app/api
RUN npm run build -w @ojt-app/web

# ---- 本番イメージ ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --omit=dev

COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/web/dist ./public

EXPOSE 8080
CMD ["node", "dist/server.js"]
