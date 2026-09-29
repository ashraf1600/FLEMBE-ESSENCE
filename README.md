# Flembe Essence — Full Stack E-Commerce

> Real products. Honest service. Your satisfaction matters.

Flembe Essence is a production-ready, mobile-first e-commerce website for affordable and stylish jewellery and fashion accessories.

---

## Architecture

```
Flembe Essence/
├── backend/          # Django + DRF API
│   ├── core/         # Project settings, URLs, tests
│   ├── catalog/      # Products & categories
│   ├── orders/       # Order management
│   └── delivery/     # Delivery zones
└── frontend/         # React + TypeScript + Tailwind CSS
    └── src/
        ├── pages/    # All customer pages
        ├── components/  # Reusable UI components
        ├── context/  # CartContext
        └── lib/      # API client & queries
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS v4, Vite |
| State | TanStack Query v5, Context API |
| Backend | Python 3.11, Django 5, Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Images | Local media / Cloudinary (configurable) |

---

## Quick Start

### Backend

```bash
cd backend
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary python-decouple cloudinary django-cloudinary-storage django-filter

# Copy env file
cp .env.example .env
# Edit .env with your settings

python manage.py migrate
python manage.py seed_data      # Load demo categories, products, delivery zones
python manage.py createsuperuser
python manage.py runserver 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env  # set VITE_API_URL
npm run dev
```

Open: http://localhost:5173

---

## Production Deployment (Render)

The repository is fully pre-configured for deployment on [Render](https://render.com) using **Render Blueprints** (`render.yaml`):

- **PostgreSQL Database** (`flembe-essence-db`)
- **Django REST Backend** (`flembe-essence-backend`) using Gunicorn & WhiteNoise
- **React Frontend Static Site** (`flembe-essence-frontend`) with SPA routing

For full step-by-step instructions, see the dedicated [Render Deployment Guide](docs/RENDER_DEPLOYMENT.md).

---

## Environment Variables

### Backend (`backend/.env`)

```env
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
DB_ENGINE=sqlite             # or postgresql
DB_NAME=flembe_essence
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173
CLOUDINARY_CLOUD_NAME=       # optional
CLOUDINARY_API_KEY=          # optional
CLOUDINARY_API_SECRET=       # optional
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

---

## Customer Pages

| Route | Page |
|-------|------|
| `/` | Homepage with hero, categories, featured products |
| `/shop` | Product catalog with search/filter/sort |
| `/categories` | Category listing |
| `/categories/:slug` | Products in a category |
| `/products/:slug` | Product detail with image gallery |
| `/checkout` | COD checkout with delivery zone selection |
| `/order-success` | Order confirmation |
| `/about` | About Flembe Essence |
| `/delivery` | Delivery info and zones |
| `/return-exchange` | No Return/No Exchange policy |
| `/contact` | Contact information |

---

## Admin

Access Django Admin at: http://localhost:8000/admin  
Default credentials: `admin` / `Admin@2026!`

### Admin Capabilities
- ✅ Product CRUD with image upload
- ✅ Category management (hierarchical)
- ✅ Order management with inline order items
- ✅ Order status updates
- ✅ Delivery zone management

---

## API Endpoints

Base URL: `/api/v1/`

### Auth
```
POST /api/v1/auth/login/
POST /api/v1/auth/token/refresh/
```

### Products
```
GET  /api/v1/products/           ?search=&category=&min_price=&max_price=&ordering=&in_stock=
GET  /api/v1/products/:slug/
POST /api/v1/products/           (admin)
PATCH /api/v1/products/:slug/    (admin)
```

### Categories
```
GET  /api/v1/categories/
GET  /api/v1/categories/:slug/
```

### Orders
```
POST /api/v1/orders/
GET  /api/v1/orders/:order_number/
GET  /api/v1/admin/orders/          (admin)
PATCH /api/v1/admin/orders/:order_number/status/  (admin)
```

### Delivery Zones
```
GET  /api/v1/delivery-zones/
```

---

## Running Tests

```bash
cd backend
python manage.py test core.tests --verbosity=2
```

**Result: 26/26 tests pass** covering:
- Product CRUD and filtering
- Stock status validation
- COD order creation
- Server-side price calculation
- Free vs paid delivery
- Policy acceptance enforcement
- Out-of-stock rejection
- Stock decrement after order
- Admin authentication and authorization

---

## Brand Colors

```css
--burgundy:   #4B1D3F  /* Primary, CTA, headings */
--nude:       #E8D9C1  /* Backgrounds */
--rose-smoke: #D8A7B1  /* Accents, hover states */
--off-black:  #1B1B1B  /* Body text */
```

---

## Contact

- Phone: 01865330801
- Facebook: https://www.facebook.com/share/19bb8cxwHW/
- Instagram: https://www.instagram.com/_flembe_._essence_

---

## MVP Acceptance Checklist

### Customer
- [x] Homepage works
- [x] Shop works with 8 seeded products
- [x] Categories work
- [x] Product details work
- [x] Search works
- [x] Filtering works (category, price, stock)
- [x] Stock status works (In Stock / Out of Stock)
- [x] COD checkout works
- [x] Backend calculates totals
- [x] Delivery charge is correct
- [x] Policy acceptance is required
- [x] Order confirmation works
- [x] Facebook/Instagram links work
- [x] Contact page works
- [x] Delivery page works
- [x] Return/Exchange page works
- [x] Mobile UI works

### Admin
- [x] Admin login works (Django Admin)
- [x] Product CRUD works
- [x] Category CRUD works
- [x] Stock management works
- [x] Order management works
- [x] Order status works
- [x] Delivery zone CRUD works

### Engineering
- [x] SQLite (dev) / PostgreSQL (prod) works
- [x] API versioning (/api/v1/) works
- [x] Secrets are environment-based
- [x] 26 tests pass
- [x] TypeScript compiles with zero errors
- [x] README complete
