
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile;       elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile;       else npm install; fi
COPY . .
EXPOSE 3000
CMD ["npm","run","dev"]
