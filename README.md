# Plus36 Academy — LMS Platform

A complete Learning Management System built with **Next.js 14**, featuring a stunning landing page, multi-role dashboards, material upload system, payment integration, and a full REST API for mobile apps.

---

## 🚀 Features

### Landing Page
- Animated hero with live student counter
- 3 benefit sections with conversion psychology
- Social proof framework (reviews, employer logos, stats)
- 5 unique CTA variations optimized for conversion
- Interactive FAQ with smooth accordion
- Full responsive design, dark theme

### Authentication
- Multi-role: **Student**, **Tutor**, **Admin**
- JWT-based authentication
- Secure password hashing (bcrypt)
- Role-based route protection

### Dashboards
| Role | Features |
|------|---------|
| **Student** | Course progress, continue learning, recommendations, certificates |
| **Tutor** | Course management, material upload, student analytics, earnings |
| **Admin** | Platform stats, user management, revenue reports, activity feed |

### Material Upload (Tutor) — Local Storage
Files are saved directly to your server's `/public/uploads/` folder and served as static assets. No cloud account needed.

| Type | Folder | Extensions |
|------|--------|-----------|
| PDF | `/public/uploads/pdfs/` | `.pdf` |
| Image | `/public/uploads/images/` | `.jpg .png .gif .webp` |
| Video | `/public/uploads/videos/` | `.mp4 .mov .avi .mkv` |
| Avatar | `/public/uploads/avatars/` | any image |
| Thumbnail | `/public/uploads/thumbnails/` | any image |

Each file is renamed to a UUID to avoid collisions.

### Payment Integration
- **Paystack** (primary — Nigerian & African market)
- **Stripe** (international)
- Free course auto-enrollment

### API (Mobile Ready)
Full REST API documented at `/api-docs` with Flutter/Dart code samples.

---

## 🛠️ Setup

### 1. Clone & Install

```bash
git clone <repo>
cd plus36-academy
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
# MySQL (XAMPP example)
DATABASE_URL="mysql://root:@localhost:3306/plus36_academy"

# If you use a password with WAMP:
# DATABASE_URL="mysql://root:yourpassword@localhost:3306/plus36_academy"

# Auth
JWT_SECRET="any-long-random-string-at-least-32-chars"
NEXTAUTH_SECRET="another-long-random-string"

# Uploads (default works out of the box)
UPLOAD_DIR="./public/uploads"
NEXT_PUBLIC_UPLOAD_URL="/uploads"
MAX_FILE_SIZE_MB="500"
```

### 3. MySQL Database

**Option A — XAMPP / WAMP / MAMP:**
1. Start MySQL from your control panel
2. Open phpMyAdmin → Create database `plus36_academy`
3. Set `DATABASE_URL` as shown above

**Option B — MySQL CLI:**
```sql
CREATE DATABASE plus36_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Upload Storage

Files land in your project's `public/uploads/` subfolders and are immediately accessible at:

```
http://localhost:3000/uploads/videos/abc123.mp4
http://localhost:3000/uploads/pdfs/xyz456.pdf
http://localhost:3000/uploads/images/img789.jpg
```

**Important for production:** The `public/` folder is served as-is by Next.js. On a VPS, make sure this directory has enough disk space, and consider setting up a regular backup of `/public/uploads/`.

> **Disk space tip:** 1 hour of 1080p video ≈ 4–8 GB. Plan accordingly.
> For very large deployments, you can later swap `src/lib/upload.ts` to write to S3 or any other storage — the rest of the codebase doesn't change.

---

## 📁 Project Structure

```
plus36-academy/
├── public/
│   └── uploads/           ← all uploaded files live here
│       ├── pdfs/
│       ├── images/
│       ├── videos/
│       ├── avatars/
│       └── thumbnails/
├── prisma/
│   └── schema.prisma      ← MySQL schema
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── auth/login|register/        # Auth pages
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Shared sidebar
│   │   │   ├── admin/page.tsx
│   │   │   ├── tutor/page.tsx
│   │   │   ├── tutor/upload/page.tsx   # Material uploader
│   │   │   └── student/page.tsx
│   │   ├── api-docs/page.tsx           # API documentation
│   │   └── api/                        # REST API routes
│   │       ├── auth/{login,register,me}/
│   │       ├── courses/[id]/modules/
│   │       ├── materials/{upload,[id]}/
│   │       ├── payments/{verify}/
│   │       ├── enrollments/
│   │       └── users/{stats}/
│   └── lib/
│       ├── upload.ts       ← local disk storage logic
│       ├── auth.ts         ← JWT helpers
│       ├── prisma.ts       ← DB client
│       └── api.ts          ← response helpers
```

---

## 📡 API Quick Reference

**Base URL:** `https://your-domain.com/api`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, get JWT |
| GET | `/auth/me` | Yes | Get profile |
| PUT | `/auth/me` | Yes | Update profile |
| GET | `/courses` | No | List courses (paginated) |
| GET | `/courses/:id` | No | Get course + modules |
| POST | `/courses` | TUTOR | Create course |
| PUT | `/courses/:id` | TUTOR | Update course |
| **POST** | **`/materials/upload`** | **TUTOR** | **Upload file (multipart)** |
| POST | `/materials` | TUTOR | Save material record |
| PUT | `/materials/:id` | TUTOR | Update material |
| DELETE | `/materials/:id` | TUTOR | Delete material |
| GET | `/enrollments` | Yes | My enrollments |
| POST | `/payments` | Yes | Enroll / pay |
| GET | `/payments/verify` | No | Check payment status |
| GET | `/users` | ADMIN | All users |
| GET | `/users/stats` | Yes | Dashboard stats |

**Interactive docs:** `/api-docs`

---

## 💳 Payment Flow

```
Student → POST /api/payments { courseId } 
       ← { checkoutUrl }  (redirect to Paystack/Stripe)
       
Payment provider → POST /api/payments/verify (webhook)
                → Creates Enrollment record
                
Student now has access to all course materials ✓
```

---

## 🚀 Deployment (VPS / Ubuntu)

```bash
# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# Install MySQL
sudo apt install mysql-server
sudo mysql -e "CREATE DATABASE plus36_academy;"

# Clone and setup
git clone <repo> /var/www/plus36
cd /var/www/plus36
npm install
cp .env.example .env  # fill in your values
npx prisma migrate deploy
npm run build

# Run with PM2
npm install -g pm2
pm2 start npm --name "plus36" -- start
pm2 save
```

Use **Nginx** as a reverse proxy pointing to `localhost:3000`.

---

## License
MIT — Built for Plus36 Academy

