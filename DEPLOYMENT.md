# Production Deployment Qo'llanmasi

## Server Talablari

### Minimal
- CPU: 2 core
- RAM: 4GB
- Disk: 20GB SSD
- OS: Ubuntu 20.04+ / CentOS 8+

### Tavsiya etilgan
- CPU: 4 core
- RAM: 8GB
- Disk: 50GB SSD
- OS: Ubuntu 22.04 LTS

## 1. Server Tayyorlash

### Node.js O'rnatish
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### PostgreSQL O'rnatish
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Nginx O'rnatish
```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### PM2 O'rnatish
```bash
sudo npm install -g pm2
```

## 2. Database Sozlash

```bash
sudo -u postgres psql

CREATE DATABASE aziztrades_erp;
CREATE USER aziztrades WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE aziztrades_erp TO aziztrades;
\q
```

## 3. Loyihani Deploy Qilish

### Kod Yuklab Olish
```bash
cd /var/www
sudo git clone <repository-url> aziztrades-erp
cd aziztrades-erp
sudo chown -R $USER:$USER .
```

### Bog'liqliklarni O'rnatish
```bash
npm ci --only=production
```

### Environment Variables
```bash
cp .env.production.example .env
nano .env
```

`.env` faylini to'ldiring:
```env
DATABASE_URL="postgresql://aziztrades:strong_password@localhost:5432/aziztrades_erp"
JWT_SECRET="generate-strong-random-secret-min-32-chars"
NODE_ENV=production
PORT=5000
```

### Database Migratsiya
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### Build
```bash
npm run build
npm run build:server
```

## 4. PM2 bilan Ishga Tushirish

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

PM2 komandalar:
```bash
pm2 status          # Status ko'rish
pm2 logs            # Loglarni ko'rish
pm2 restart all     # Qayta ishga tushirish
pm2 stop all        # To'xtatish
pm2 delete all      # O'chirish
```

## 5. Nginx Sozlash

```bash
sudo cp nginx.conf /etc/nginx/sites-available/aziztrades-erp
sudo ln -s /etc/nginx/sites-available/aziztrades-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. SSL Sertifikat (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 7. Firewall Sozlash

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 8. Backup Strategiyasi

### Database Backup
```bash
# Backup script yaratish
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/aziztrades"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U aziztrades aziztrades_erp | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# 7 kundan eski backuplarni o'chirish
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-db.sh
```

### Cron Job
```bash
sudo crontab -e
```

Qo'shing:
```
0 2 * * * /usr/local/bin/backup-db.sh
```

## 9. Monitoring

### PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### System Monitoring
```bash
# htop o'rnatish
sudo apt install htop

# Disk space tekshirish
df -h

# Memory tekshirish
free -h
```

## 10. Yangilash (Update)

```bash
cd /var/www/aziztrades-erp

# Yangi kodni olish
git pull origin main

# Bog'liqliklarni yangilash
npm ci --only=production

# Database migratsiya (kerak bo'lsa)
npm run db:push

# Build
npm run build
npm run build:server

# Qayta ishga tushirish
pm2 restart all
```

## 11. Troubleshooting

### Loglarni Ko'rish
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Database Connection Xatosi
```bash
# PostgreSQL ishlab turganini tekshiring
sudo systemctl status postgresql

# Connection test
psql -U aziztrades -d aziztrades_erp -h localhost
```

### Port Band
```bash
# Port ishlatilayotganini tekshirish
sudo lsof -i :5000
sudo lsof -i :80
```

## 12. Xavfsizlik

### PostgreSQL
```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Faqat local connectionlarga ruxsat bering.

### Firewall
```bash
sudo ufw status
```

### Regular Updates
```bash
sudo apt update
sudo apt upgrade
```

## 13. Performance Optimization

### PostgreSQL Tuning
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

```conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### Nginx Caching
Nginx konfiguratsiyasida caching sozlangan.

## 14. Monitoring Tools (Ixtiyoriy)

### Sentry (Error Tracking)
```bash
npm install @sentry/node
```

### Grafana + Prometheus
Server metrikalarini kuzatish uchun.

## Yordam

Muammolar yuzaga kelsa:
- Loglarni tekshiring
- GitHub Issues da savol bering
- Email: support@aziztrades.com
