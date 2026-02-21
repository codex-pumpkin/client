#
# Dockerfile configuration inspired by Dany Paredes on www.telerik.com
#

# Phase 1 builds the web-distribution to /app/dist/
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Phase 2 configures nginx to serve the disttribution
FROM nginx:alpine
COPY --from=builder /app/dist/codex-client/browser /usr/share/nginx/html

# Replace default nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Configuring the environment variables.

# Moving the template file to the assets
COPY env.template.json /usr/share/nginx/html/assets/env.template.json
# Setting up the entrypoint file and making it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# The startup happens in our own entrypoint which replaces the environment variables
ENTRYPOINT ["/entrypoint.sh"]
