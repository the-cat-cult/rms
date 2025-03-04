# RMS: Reverse Proxy Setup for Node.js with Nginx

## Overview
This guide explains how to set up a reverse proxy for a **Node.js** application running on **port 3000** using **Nginx**. It also covers SSL setup with **Let's Encrypt** and alternative reverse proxies like **OpenLiteSpeed, Caddy, HAProxy, Traefik, and Envoy**.

---
## 1️⃣ Setting Up Nginx as a Reverse Proxy

### Install Nginx
```bash
sudo apt update
sudo apt install nginx -y
```

### Configure Nginx as a Reverse Proxy
Edit the Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/default
```

Replace the contents with:
```nginx
server {
    listen 80;
    server_name stn-cok-mac-hor.in;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name stn-cok-mac-hor.in;

    ssl_certificate /etc/letsencrypt/live/stn-cok-mac-hor.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stn-cok-mac-hor.in/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
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

```

Save and restart Nginx:
```bash
sudo systemctl restart nginx
```

---
## 2️⃣ Setting Up SSL with Let's Encrypt

### Install Certbot (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obtain an SSL Certificate
```bash
sudo certbot --nginx -d stn-cok-mac-hor.in -d www.stn-cok-mac-hor.in
```

### Set Up Auto-Renewal
Certbot installs an automatic renewal cron job, but you can manually verify it:
```bash
sudo certbot renew --dry-run
```

---
## 3️⃣ Managing the Node.js Server with PM2

### Clone repository from  https://github.com/the-cat-cult/rms.git
```bash
git clone  https://github.com/the-cat-cult/rms.git
```

### Copy .env file
```bash
Copy data from local .env file to .env file in the server
```

### Install packages
```bash
npm install
```

### Install PM2
```bash
npm install -g pm2
```

### Start Your Node.js App with PM2
```bash
pm start
pm2 start app.js --name app
```

### Restart Your App
```bash
pm2 restart app
```

### Check Running Apps
```bash
pm2 list
```

### Auto-Start PM2 on Server Reboot
```bash
pm2 startup
pm2 save
```

---
## 4️⃣ Alternative Reverse Proxy Options

| Proxy      | Pros | Cons |
|------------|------|------|
| **Nginx** | Most popular, great for static & dynamic content, easy SSL setup | Requires manual config |
| **Apache** | Supports `.htaccess`, works well with PHP apps | Slower for high concurrency |
| **OpenLiteSpeed** | Built-in caching, supports `.htaccess` | Harder SSL setup, less community support |
| **Caddy** | Simple config, auto SSL | Less customizable |
| **HAProxy** | Best for load balancing, high-performance | Complex config |
| **Traefik** | Great for Docker/K8s | Overkill for simple apps |
| **Envoy** | Best for microservices | Steep learning curve |

For **Node.js reverse proxy**, **Nginx** is the best choice. 🚀

---
## 5️⃣ Troubleshooting

### Check If Nginx Is Running
```bash
sudo systemctl status nginx
```

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### Verify Port 3000 Is Open
```bash
netstat -tulnp | grep 3000
```

---
## 🎯 Conclusion
- **Use Nginx** for a simple and effective reverse proxy.
- **Enable HTTPS** with Let's Encrypt for security.
- **Manage Node.js** with PM2 for reliability.
- **Consider alternatives** (Caddy, HAProxy, OpenLiteSpeed) based on needs.

🚀 Now your Node.js app is production-ready!

