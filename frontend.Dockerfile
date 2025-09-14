# Dockerfile per il web server Nginx

# 1. Start from the official Nginx image (lightweight version)
FROM nginx:stable-alpine

# 2. Copy the static files into the Nginx HTML directory
# First copy the 'dati' folder to ensure it's available in the image
COPY dati/ /usr/share/nginx/html/dati/
# Then copy the static files (HTML, CSS, JS)
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY graph.js /usr/share/nginx/html/

# 3. Expose the port 80 that Nginx will listen on
EXPOSE 80