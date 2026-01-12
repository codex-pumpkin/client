#!/bin/sh

# Set environment variables
envsubst < /usr/share/nginx/html/assets/env.template.json > /usr/share/nginx/html/assets/env.json

# Start nginx
nginx -g 'daemon off;'
