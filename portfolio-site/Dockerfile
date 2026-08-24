# Build the Vite frontend from the portfolio-site subdirectory.
FROM node:20-alpine AS build

WORKDIR /app/portfolio-site

# Install dependencies using the lockfile for reproducible builds.
COPY portfolio-site/package.json portfolio-site/package-lock.json ./
RUN npm ci

# Copy the application source, including .openai/hosting.json required by the build script.
COPY portfolio-site/ ./
RUN npm run build

# Serve the generated static site with Nginx.
FROM nginx:alpine

COPY --from=build /app/portfolio-site/dist/client /usr/share/nginx/html

EXPOSE 80

# Keep Nginx in the foreground so the container remains healthy.
CMD ["nginx", "-g", "daemon off;"]
