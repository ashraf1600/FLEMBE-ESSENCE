# Deploying Flembe Essence to Render

This comprehensive guide walks you through deploying the **Flembe Essence** full-stack application (Django REST Framework + React/Vite + PostgreSQL) to [Render](https://render.com).

---

## Architecture on Render

```
┌─────────────────────────────────┐
│     Render Static Site          │
│   (React 19 + Vite + Tailwind)  │
│  https://<frontend>.onrender.com│
└────────────────┬────────────────┘
                 │ REST API calls (JWT, CORS enabled)
                 ▼
┌─────────────────────────────────┐
│     Render Web Service          │
│   (Django 5 + DRF + Gunicorn)   │
│  https://<backend>.onrender.com │
└────────────────┬────────────────┘
                 │ DATABASE_URL
                 ▼
┌─────────────────────────────────┐
│    Render Managed PostgreSQL    │
│      (flembe-essence-db)        │
└─────────────────────────────────┘
```

---

## Method 1: Automated Deployment via Blueprint (`render.yaml`) — Recommended

The repository includes a ready-to-use [`render.yaml`](../render.yaml) file that automatically provisions the PostgreSQL database, Django backend, and React static frontend together.

### Steps:
1. **Push your code to GitHub / GitLab**.
2. Go to the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** and select **Blueprint**.
4. Connect your `flembe-essence` repository.
5. Render will automatically detect `render.yaml` and display 3 resources:
   - `flembe-essence-db` (PostgreSQL Database)
   - `flembe-essence-backend` (Web Service)
   - `flembe-essence-frontend` (Static Site)
6. Click **Apply**.
7. Once deployed:
   - Grab the backend URL (e.g. `https://flembe-essence-backend.onrender.com`).
   - If your frontend name or URL differs, ensure the frontend's `VITE_API_URL` environment variable is set to `https://<your-backend-url>/api/v1` and the backend's `CORS_ALLOWED_ORIGINS` includes your frontend URL.

---

## Method 2: Manual Dashboard Setup (Step-by-Step)

If you prefer to configure each service manually in the Render dashboard, follow these steps:

### Step 1: Create PostgreSQL Database

1. In Render Dashboard, click **New +** > **PostgreSQL**.
2. Configure:
   - **Name**: `flembe-essence-db`
   - **Database**: `flembe_essence`
   - **User**: `flembe_user`
   - **Region**: Choose the region closest to your users (e.g., Singapore, Frankfurt, or Oregon).
   - **Plan**: `Free`.
3. Click **Create Database**.
4. Once created, copy the **Internal Database URL** (used if services are in the same region) or **External Database URL**.

---

### Step 2: Deploy Django Backend Web Service

1. Click **New +** > **Web Service**.
2. Connect your repository.
3. Configure the service settings:
   - **Name**: `flembe-essence-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Region**: Same region as your database.
   - **Branch**: `main` (or your active branch)
   - **Build Command**:
     ```bash
     ./build.sh
     ```
   - **Start Command**:
     ```bash
     gunicorn core.wsgi:application
     ```
   - **Plan**: `Free`

4. Add **Environment Variables** in the Environment section:

| Key | Value | Notes |
|-----|-------|-------|
| `DEBUG` | `False` | Disables debug mode for production |
| `SECRET_KEY` | *(Click "Generate" or paste a strong random string)* | Required |
| `DATABASE_URL` | *(Paste Internal Database URL from Step 1)* | Connects to Render PostgreSQL |
| `DB_ENGINE` | `postgresql` | Database backend |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,.onrender.com` | Allows Render domain |
| `CORS_ALLOWED_ORIGINS` | `https://flembe-essence-frontend.onrender.com` | Add your frontend URL |
| `CSRF_TRUSTED_ORIGINS` | `https://flembe-essence-frontend.onrender.com` | Add your frontend URL |
| `AUTO_SEED` | `true` | Automatically seeds demo categories, products & delivery zones |
| `DJANGO_SUPERUSER_USERNAME` | `admin` | Auto-creates superuser on build |
| `DJANGO_SUPERUSER_EMAIL` | `admin@flembeessence.com` | Superuser email |
| `DJANGO_SUPERUSER_PASSWORD` | `ChooseAStrongPassword123!` | Superuser password |

*(Optional Cloudinary Variables for persistent image uploads):*
| Key | Value |
|-----|-------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API Secret |

5. Click **Deploy Web Service**.
6. Wait for the build to finish. Once live, note your backend URL (e.g. `https://flembe-essence-backend.onrender.com`).
   - You can test it by visiting: `https://flembe-essence-backend.onrender.com/api/v1/products/`
   - Admin panel: `https://flembe-essence-backend.onrender.com/admin/`

---

### Step 3: Deploy React Frontend Static Site

1. In Render Dashboard, click **New +** > **Static Site**.
2. Connect the same repository.
3. Configure settings:
   - **Name**: `flembe-essence-frontend`
   - **Root Directory**: `frontend`
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     npm run build
     ```
   - **Publish Directory**:
     ```bash
     dist
     ```
4. Add **Environment Variables**:
   - `VITE_API_URL`: `https://flembe-essence-backend.onrender.com/api/v1` *(replace with your real backend URL)*
5. Configure **Client-Side SPA Routing** (Critical for React Router):
   - In your Static Site settings in Render, navigate to **Redirects/Rewrites**.
   - Click **Add Rule**:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`
   - Save the rule.
6. Click **Create Static Site**.

---

### Step 4: Verify Full Flow

1. Open your frontend URL (e.g., `https://flembe-essence-frontend.onrender.com`).
2. Verify:
   - Products and categories load on the homepage and `/shop`.
   - Category filtering and search work.
   - You can add products to cart and visit `/checkout`.
   - Place a Cash-on-Delivery order and verify the `/order-success` page.
   - Visit the admin dashboard at `/admin-login` (or `/admin/` on backend) and log in with your superuser credentials.

---

## Important Production Notes

1. **Free Tier Spin-down**:
   - Render's free web services spin down after 15 minutes of inactivity. The first request after sleep may take ~30–50 seconds to wake up.
   - The Static Site (frontend) is served from Render's global CDN and **never** sleeps.
2. **Cloudinary for Product Images**:
   - Render's file storage is ephemeral on free web services. Any product images uploaded through the Django Admin to the local file system will be erased when the container restarts.
   - For long-term production, sign up for a free [Cloudinary](https://cloudinary.com) account and add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to the backend environment variables.
3. **Database Backups**:
   - Render automatically handles connections and health checks with PostgreSQL using `dj-database-url`.
