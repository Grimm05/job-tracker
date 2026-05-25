# job-tracker-frontend/Dockerfile

# ── Stage 1 : build Angular ───────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --quiet

COPY . .
RUN npm run build -- --configuration production

# ── Stage 2 : nginx ───────────────────────────────────────────
FROM nginx:alpine

# Supprimer la config nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copier le build Angular dans nginx
COPY --from=builder /app/dist/job-tracker-frontend/browser /usr/share/nginx/html

EXPOSE 80