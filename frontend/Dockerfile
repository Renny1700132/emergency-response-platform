FROM node:24-alpine AS build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
COPY docs/work/B_TECH/openapi_v1.yaml /app/docs/work/B_TECH/openapi_v1.yaml
ARG VITE_API_BASE_URL=
ARG VITE_REQUEST_TIMEOUT_MS=10000
ARG VITE_APP_TITLE=博物馆智能运营中心
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_REQUEST_TIMEOUT_MS=${VITE_REQUEST_TIMEOUT_MS} \
    VITE_APP_TITLE=${VITE_APP_TITLE}
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY frontend/runtime-server.mjs ./runtime-server.mjs
COPY --from=build /app/frontend/dist ./dist
USER node
EXPOSE 80
HEALTHCHECK --interval=5s --timeout=3s --retries=20 CMD node -e "fetch('http://127.0.0.1/').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "runtime-server.mjs"]
