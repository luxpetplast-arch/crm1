# MA'LUMOTLARNI CLOUDGA SAQLASH

## SIZNING SERVERINGIZ QAYERDA:

### **LOCAL SERVER (Hozirgi holat):**
```
c:\Users\tilav\Desktop\zavod tizimi
```

### **MA'LUMOTLAR QAYERDA SAQLANADI:**

#### **1. DATABASE (Asosiy ma'lumotlar):**
```
c:\Users\tilav\Desktop\zavod tizimi\data\
```
- **Customers** - Mijozlar ma'lumotlari
- **Sales** - Sotuvlar ma'lumotlari
- **Products** - Mahsulotlar ma'lumotlari
- **Inventory** - Inventar ma'lumotlari
- **Financial** - Moliyaviy ma'lumotlar

#### **2. BACKUP SYSTEM (5 qatlamli backup):**
```
c:\Users\tilav\Desktop\zavod tizimi\backups\
```
- **Layer 1 (Hot):** `./backups/layer1/hot/`
- **Layer 2 (Warm):** `./backups/layer2/warm/`
- **Layer 3 (Cold):** `./backups/layer3/cold/`
- **Layer 4 (Archive):** `./backups/layer4/archive/`
- **Layer 5 (Deep Archive):** `./backups/layer5/deep_archive/`

#### **3. LOGS (Log fayllari):**
```
c:\Users\tilav\Desktop\zavod tizimi\logs\
```
- **Application logs** - Ilova loglari
- **Error logs** - Xatolik loglari
- **Access logs** - Kirish loglari
- **Security logs** - Xavfsizlik loglari

#### **4. CONFIGURATION (Konfiguratsiya):**
```
c:\Users\tilav\Desktop\zavod tizimi\.env
c:\Users\tilav\Desktop\zavod tizimi\config\
```

---

## CLOUDGA SAQLASH VARIANTLARI:

### **1. AWS S3 (RECOMMENDED)**

#### **Nima uchun AWS S3?**
- **99.999999999%** durability (11 nines)
- **Unlimited storage** - Cheksiz saqlash
- **Auto-scaling** - Avtomatik scaling
- **Global CDN** - Global CDN
- **Versioning** - Versiyalash
- **Encryption** - Shifrlash
- **Lifecycle policies** - Lifecycle siyosatlari

#### **Qanday qilish?**
```bash
# 1. AWS account oching
# https://aws.amazon.com

# 2. S3 bucket yarating:
# - Region: eu-central-1 (Frankfurt)
# - Bucket name: luxpetplast-backup
# - Versioning: Enable
# - Encryption: Enable

# 3. AWS CLI install qiling:
# https://aws.amazon.com/cli/

# 4. Configure qiling:
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: eu-central-1

# 5. Backup script yaratish:
aws s3 sync "c:\Users\tilav\Desktop\zavod tizimi\backups" s3://luxpetplast-backup/backups
aws s3 sync "c:\Users\tilav\Desktop\zavod tizimi\data" s3://luxpetplast-backup/data
aws s3 sync "c:\Users\tilav\Desktop\zavod tizimi\logs" s3://luxpetplast-backup/logs
```

#### **Automatik Backup (Daily):**
```bash
# Windows Task Scheduler da:
# Task: Daily backup to AWS S3
# Time: Every day at 2:00 AM
# Command: aws s3 sync "C:\Users\tilav\Desktop\zavod tizimi" s3://luxpetplast-backup/$(date +%Y-%m-%d)
```

### **2. GOOGLE CLOUD STORAGE**

#### **Nima uchun Google Cloud?**
- **15 GB free** - 15 GB bepul
- **Google integration** - Google integratsiyasi
- **Machine learning** - Machine learning
- **BigQuery** - BigQuery
- **Global network** - Global tarmoq

#### **Qanday qilish?**
```bash
# 1. Google Cloud account oching
# https://cloud.google.com

# 2. Cloud Storage bucket yarating:
# - Name: luxpetplast-storage
# - Location: europe-west1
# - Storage class: Standard

# 3. gsutil install qiling:
# https://cloud.google.com/sdk/docs/install

# 4. Authenticate qiling:
gcloud auth login

# 5. Backup qiling:
gsutil -m rsync -r "c:\Users\tilav\Desktop\zavod tizimi" gs://luxpetplast-storage/
```

### **3. AZURE BLOB STORAGE**

#### **Nima uchun Azure?**
- **Microsoft integration** - Microsoft integratsiyasi
- **Hybrid cloud** - Hybrid cloud
- **Enterprise features** - Enterprise xususiyatlari
- **Compliance** - Qoidalarga riozat
- **Global regions** - Global regionlar

#### **Qanday qilish?**
```bash
# 1. Azure account oching
# https://azure.microsoft.com

# 2. Storage account yarating:
# - Name: luxpetplaststorage
# - Region: West Europe
# - Performance: Standard

# 3. Azure CLI install qiling:
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# 4. Login qiling:
az login

# 5. Backup qiling:
az storage blob upload-batch --destination "luxpetplaststorage" --source "c:\Users\tilav\Desktop\zavod tizimi"
```

### **4. DIGITAL OCEAN SPACES**

#### **Nima uchun Digital Ocean?**
- **Simple** - Oddiy
- **Affordable** - Arzon
- **Developer-friendly** - Developer friendly
- **S3 compatible** - S3 mos
- **Good documentation** - Yaxshi hujjatlar

#### **Qanday qilish?**
```bash
# 1. Digital Ocean account oching
# https://www.digitalocean.com

# 2. Space yarating:
# - Name: luxpetplast-space
# - Region: Amsterdam
# - CDN: Enable

# 3. s3cmd install qiling:
# pip install s3cmd

# 4. Configure qiling:
s3cmd --configure
# Access Key: YOUR_ACCESS_KEY
# Secret Key: YOUR_SECRET_KEY
# Host: ams3.digitaloceanspaces.com
# Host Bucket: luxpetplast-space.ams3.digitaloceanspaces.com

# 5. Backup qiling:
s3cmd sync "c:\Users\tilav\Desktop\zavod tizimi" s3://luxpetplast-space/
```

---

## RECOMMENDED: AWS S3

### **Nima uchun AWS S3 eng yaxshi?**

#### **1. RELIABILITY**
- **99.999999999%** durability (11 nines)
- **99.99%** availability
- **Multi-AZ** replication
- **Cross-region** replication

#### **2. SECURITY**
- **Encryption at rest** - Saqlashda shifrlash
- **Encryption in transit** - Transportda shifrlash
- **IAM policies** - IAM siyosatlari
- **VPC endpoints** - VPC endpointlar
- **Access logging** - Kirish loglari

#### **3. COST EFFECTIVE**
- **Pay-as-you-go** - Ishlab toping
- **Storage classes** - Storage klasslari
- **Lifecycle policies** - Lifecycle siyosatlari
- **Data transfer** - Ma'lumot transferi

#### **4. FEATURES**
- **Versioning** - Versiyalash
- **Cross-region replication** - Cross-region replikatsiya
- **Event notifications** - Event xabarnomalar
- **Analytics** - Analitika
- **Machine learning** - Machine learning

---

## AWS S3 QADAM-BQADAM YO'L-NOMASI:

### **QADAM 1: AWS ACCOUNT OCHING**
```bash
# 1. https://aws.amazon.com ga boring
# 2. "Create a free account" tugmasini bosing
# 3. Ma'lumotlarni to'ldiring
# 4. Credit card qo'shing (verifikatsiya uchun)
# 5. Phone verification qiling
```

### **QADAM 2: S3 BUCKET YARATING**
```bash
# 1. AWS Management Console ga kiring
# 2. S3 servisiga o'ting
# 3. "Create bucket" tugmasini bosing
# 4. Bucket name: luxpetplast-backup-2024
# 5. Region: eu-central-1 (Frankfurt)
# 6. "Block all public access" - belgilang
# 7. "Create bucket" tugmasini bosing
```

### **QADAM 3: AWS CLI INSTALL QILING**
```bash
# Windows uchun:
# 1. https://aws.amazon.com/cli/ ga boring
# 2. "Windows" ni tanlang
# 3. "64-bit" ni tanlang
# 4. Download qiling
# 5. Install qiling
```

### **QADAM 4: AWS CLI CONFIGURE QILING**
```bash
# Command Prompt oching
aws configure

# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: eu-central-1
# Default output format: json
```

### **QADAM 5: CLOUDGA BACKUP QILISH**
```bash
# 1. Test backup:
aws s3 ls

# 2. Backups papkasini cloudga ko'chirish:
aws s3 sync "c:\Users\tilav\Desktop\zavod tizimi\backups" s3://luxpetplast-backup-2024/backups

# 3. Data papkasini cloudga ko'chirish:
aws s3 sync "c:\Users\tilav\Desktop\zavod tizimi\data" s3://luxpetplast-backup-2024/data

# 4. Logs papkasini cloudga ko'chirish:
aws s3 sync "c:\Users\tilav\Desktop\zavod tizimi\logs" s3://luxpetplast-backup-2024/logs

# 5. To'liq backup:
aws s3 sync "c:\Users\tilav\Desktop\zavod tizimi" s3://luxpetplast-backup-2024/$(date +%Y-%m-%d)
```

### **QADAM 6: AUTOMATIK BACKUP QILISH**
```bash
# 1. Backup script yaratish:
# backup-to-cloud.bat

@echo off
echo Starting backup to AWS S3...
set DATE=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%
aws s3 sync "c:\Users\tilav\Desktop\zavod tizimi" s3://luxpetplast-backup-2024/%DATE%
echo Backup completed!
pause

# 2. Windows Task Scheduler da:
# - Task Scheduler oching
# - "Create Basic Task" tugmasini bosing
# - Name: "LUX PET PLAST Cloud Backup"
# - Trigger: Daily
# - Time: 2:00:00 AM
# - Action: Start a program
# - Program: backup-to-cloud.bat
# - Finish tugmasini bosing
```

---

## CLOUD BACKUP BENEFITS:

### **1. DISASTER RECOVERY**
- **Off-site backup** - Off-site backup
- **Geo-redundancy** - Geo-redundancy
- **Quick recovery** - Tezkor tiklash
- **Business continuity** - Biznes uzluksizligi

### **2. SCALABILITY**
- **Unlimited storage** - Cheksiz saqlash
- **Auto-scaling** - Avtomatik scaling
- **Global access** - Global kirish
- **CDN integration** - CDN integratsiyasi

### **3. SECURITY**
- **Encryption** - Shifrlash
- **Access control** - Kirish nazorati
- **Audit logging** - Audit loglash
- **Compliance** - Qoidalarga riozat

### **4. COST EFFECTIVE**
- **Pay-as-you-go** - Ishlab toping
- **No upfront cost** - Oldindan xarajat yo'q
- **Storage tiers** - Storage qatlamlari
- **Data transfer** - Ma'lumot transferi

---

## RECOMMENDED SETUP:

### **AWS S3 + LOCAL BACKUP**

#### **Hybrid Approach:**
1. **Local backup** - Tezkor tiklash uchun
2. **Cloud backup** - Disaster recovery uchun
3. **Automated sync** - Avtomatik sync
4. **Versioning** - Versiyalash
5. **Encryption** - Shifrlash

#### **Backup Strategy:**
- **Real-time:** Local Layer 1
- **Hourly:** Local Layer 2
- **Daily:** Local Layer 3 + Cloud
- **Weekly:** Local Layer 4 + Cloud
- **Monthly:** Local Layer 5 + Cloud

---

## FINAL RECOMMENDATION:

### **AWS S3 + LOCAL BACKUP**

#### **Nima uchun bu eng yaxshi?**
- **Best of both worlds** - Ikkala dunyoning eng yaxshisi
- **Fast local access** - Tezkor local kirish
- **Cloud disaster recovery** - Cloud falokat tiklash
- **Cost effective** - Xarajat samarali
- **Enterprise ready** - Enterprise tayyor

#### **Qanday boshlash?**
```bash
# 1. AWS account oching
# 2. S3 bucket yarating
# 3. AWS CLI install qiling
# 4. Configure qiling
# 5. Backup qiling
# 6. Automatiklashtiring
```

---

## XULOSA:

### **MA'LUMOTLARNI CLOUDGA SAQLASH:**

#### **RECOMMENDED: AWS S3**
- **99.999999999% durability**
- **Unlimited storage**
- **Pay-as-you-go**
- **Enterprise features**
- **Global CDN**

#### **HYBRID APPROACH:**
- **Local backup** - Tezkor kirish
- **Cloud backup** - Disaster recovery
- **Automated sync** - Avtomatik sync
- **Versioning** - Versiyalash

#### **COST:**
- **Storage:** ~$0.023 per GB
- **Transfer:** ~$0.09 per GB
- **Requests:** ~$0.004 per 1000
- **Monthly:** ~$10-50 for most businesses

### **HOZIRGINA BOSHLANG!**
```bash
# 1. AWS account oching
# 2. S3 bucket yarating
# 3. AWS CLI install qiling
# 4. Configure qiling
# 5. Backup qiling
```

**MA'LUMOTLARINGIZ ENDI CLOUDDA HAM SAQLANADI!** 

**1000% XAVFSIZLIK BILAN!** 

**DISASTER RECOVERY BILAN!** 

**GLOBAL ACCESS BILAN!** 

#CloudBackup #AWSS3 #DisasterRecovery #BusinessContinuity
