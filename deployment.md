Server Deployment Documentation: GodspeedGrader API
1. Environment Overview
Server: Ubuntu 22.04 LTS (DigitalOcean Droplet)

Web Server: Nginx (Reverse Proxy)

Runtime: Node.js + TypeScript

Process Manager: PM2

SSL/TLS: Let's Encrypt (Certbot)

DNS: Cloudflare (Proxied)

2. Server Configuration Commands
A. Memory Management (Swap File)
Required to prevent "Out of Memory" (OOM) kills during TypeScript compilation on 512MB RAM instances.

Bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
B. Nginx Reverse Proxy Setup
Create Configuration File: sudo nano /etc/nginx/sites-available/godspeedgrader-api.com

Nginx
server {
    listen 80;
    server_name godspeedgrader-api.com www.godspeedgrader-api.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
Enable and Reload:

Bash
sudo ln -s /etc/nginx/sites-available/godspeedgrader-api.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
C. Backend Deployment
Global Dependencies:

Bash
sudo npm install -g pm2 typescript ts-node
Production Build:

Bash
NODE_OPTIONS="--max-old-space-size=400" npm run build
Start with PM2:

Bash
pm2 start dist/index.js --name "nabix-api"
pm2 save
D. SSL/TLS (HTTPS)
Requires DNS A records to be pointed to 165.22.108.209 in Cloudflare.

Bash
sudo certbot --nginx -d godspeedgrader-api.com -d www.godspeedgrader-api.com
3. Maintenance Protocols
View Logs: pm2 logs nabix-api

Restart API: pm2 restart nabix-api

Check Status: sudo systemctl status nginx

Monitor System: htop