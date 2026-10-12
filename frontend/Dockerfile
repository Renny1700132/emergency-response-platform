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

FROM nginx:1.27-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=5s --timeout=3s --retries=20 CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
