# uploaditin_v2/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Salin package files
COPY package*.json ./

# Tambahkan ARG untuk build time environment variables
ARG BACKEND_URL=http://backend:5000
ENV BACKEND_URL=$BACKEND_URL
ARG NEXT_PUBLIC_BACKEND_URL=http://backend:5000
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Install dependencies
RUN npm ci

# Salin semua kode
COPY . .

# Build aplikasi Next.js
RUN npm run build

# Port default Next.js
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]
