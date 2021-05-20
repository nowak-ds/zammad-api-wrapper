FROM node:12

WORKDIR /app

RUN mkdir icons
# Add package file
COPY package*.json ./

ENV PORT=3000
ENV API_BASE_URL=http://77.68.114.90:8080/api/v1

# Install deps
RUN npm i

# Copy source
COPY .env /app
COPY src ./app/src
COPY public ./public
COPY tsconfig.json ./tsconfig.json

# Build dist
RUN npm run build

# Expose port 3000
EXPOSE 3000

CMD npm run start