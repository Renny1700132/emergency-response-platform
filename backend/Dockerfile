FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY backend ./backend
EXPOSE 3000
CMD ["node", "backend/src/main.mjs"]
