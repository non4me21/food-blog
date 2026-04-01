FROM node:20-alpine
WORKDIR /app
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
# Build runs at startup (not at image build time) because next build calls generateStaticParams
# which queries the database — the DB is only available at runtime, not during docker build.
CMD ["sh", "-c", "npx drizzle-kit migrate && npm run build && npm start"]
