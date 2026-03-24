FROM node:20-alpine
WORKDIR /app
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["sh", "-c", "npx drizzle-kit migrate && npm run build && npm start"]
