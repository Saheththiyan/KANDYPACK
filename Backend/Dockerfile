FROM node:18-alpine

WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app sources
COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "index.js"]
