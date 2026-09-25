# Flembe Essence — Autonomous Development Specification

## 1. Mission

Build Flembe Essence as a production-ready, mobile-first e-commerce
website for affordable and stylish jewellery and fashion accessories.

**Brand:** Flembe Essence  
**Tagline:** Real products. Honest service. Your satisfaction matters.

The business currently sells through Facebook, Instagram, and occasional
stalls at Daffodil International University. The owner is from Cox’s
Bazar and plans to add local products such as shutki and achar in the
future.

This file is the **single source of truth** for Antigravity. Inspect the
existing repository first, then implement, test, debug, and document the
project autonomously. Do not stop at a plan.

------------------------------------------------------------------------

## 2. Core Goals

Customers must be able to:

- Browse products and categories
- Search and filter products
- View product details
- See price, material, stock status and images
- Place Cash-on-Delivery orders
- See delivery charges/eligible areas
- Read delivery and no-return/no-exchange policies
- Visit Facebook and Instagram

Admin must be able to:

- Manage products
- Manage categories
- Manage stock
- Manage orders
- Update order status
- Manage delivery zones and charges

The architecture must support future categories without database
redesign.

------------------------------------------------------------------------

## 3. Tech Stack

Preferred stack:

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- React
- REST API integration

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL
- JWT for admin/API authentication

### Image Storage

Use Cloudinary or AWS S3. Do not store large images directly in
PostgreSQL.

### API

Base path:

``` text
/api/v1/
```

Use `.env` and `.env.example`. Never commit secrets.

------------------------------------------------------------------------

## 4. Brand / UI Design

Use this exact palette from the provided brand reference:

``` css
--burgundy: #4B1D3F;
--nude: #E8D9C1;
--rose-smoke: #D8A7B1;
--off-black: #1B1B1B;
```

### Usage

- Burgundy: primary brand color, CTA buttons, headings, navbar accents
- Nude: backgrounds and large soft surfaces
- Rose Smoke: accents, hover states, badges and selected states
- Off Black: body text and navigation

Style:

**Minimal \| Elegant \| Modern \| Feminine \| Clean**

Avoid excessive gradients, clutter, excessive animation, or generic
template styling.

Mobile-first is mandatory.

------------------------------------------------------------------------

## 5. Customer Pages

Implement:

``` text
/
 /shop
 /categories
 /categories/[slug]
 /products/[slug]
 /about
 /delivery
 /return-exchange
 /contact
 /checkout
 /order-success
```

Admin may use Django Admin for MVP:

``` text
/admin
```

or a custom admin frontend if already established.

------------------------------------------------------------------------

## 6. Homepage

Include:

1.  Header/navbar
2.  Hero
3.  Shop Now CTA
4.  Shop by Category
5.  Featured Products
6.  Brand values
7.  Delivery information
8.  Social media links
9.  Footer

Suggested hero copy:

> Affordable Style, Made for You

Supporting copy should communicate affordable and stylish products for
students/young customers.

Do not invent unsupported business claims.

------------------------------------------------------------------------

## 7. Initial Categories

``` text
Jewellery & Accessories
├── Rings
├── Earrings
├── Bracelets
├── Hair Accessories
├── Necklaces
└── Other Accessories
```

Categories must be database-driven, not hard-coded.

Future categories may include:

``` text
Food
├── Achar
├── Shutki
└── Local Products

Fashion
└── T-Shirts
```

Use a scalable category model, preferably with optional `parent_id`.

------------------------------------------------------------------------

## 8. Product Requirements

Each product supports:

``` text
id
name
slug
description
material
price
stock_quantity
sku
category_id
is_active
created_at
updated_at
```

Product images:

``` text
id
product_id
image_url
alt_text
is_primary
display_order
created_at
```

A product can have multiple images.

### Product card

Show:

- Product image
- Name
- Price
- Stock status
- Order Now

Stock status must be derived from `stock_quantity`.

``` text
stock_quantity > 0 → In Stock
stock_quantity = 0 → Out of Stock
```

Do not manually store only `"In Stock"`.

------------------------------------------------------------------------

## 9. Shop Features

Support:

- Search
- Category filter
- Price filter
- Sorting
- Pagination
- Stock status

Examples:

``` http
GET /api/v1/products/?search=necklace
GET /api/v1/products/?category=rings
GET /api/v1/products/?min_price=200&max_price=500
GET /api/v1/products/?ordering=price
GET /api/v1/products/?ordering=-price
```

------------------------------------------------------------------------

## 10. Product Detail

Include:

- Image gallery
- Product name
- Price
- Description
- Material
- Stock status
- Quantity selector
- Order Now

Out-of-stock products must not be orderable.

------------------------------------------------------------------------

## 11. Checkout / Payment

MVP payment method:

**Cash on Delivery (COD) only**

Do NOT add Stripe, SSLCommerz, bKash, Nagad, card payments, etc. unless
explicitly requested later.

Checkout fields:

``` text
Name
Phone
Address
Delivery Area
Product(s)
Quantity
Customer Note
Policy Acceptance
```

The backend must calculate:

``` text
subtotal
delivery_charge
total_amount
```

Never trust price or total values supplied by the frontend.

------------------------------------------------------------------------

## 12. Order Flow

``` text
Browse
  ↓
Product Details
  ↓
Select Quantity
  ↓
Checkout
  ↓
Customer Information
  ↓
Delivery Area
  ↓
Backend calculates total
  ↓
Accept policy
  ↓
Create COD Order
  ↓
Order Confirmation
```

Order statuses:

``` text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
FAILED_DELIVERY
```

Normal flow:

``` text
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
```

Generate unique human-readable order numbers such as:

``` text
FE-20260925-001
```

------------------------------------------------------------------------

## 13. Delivery

COD is available in:

- Dhaka
- Cox’s Bazar

### Free delivery

- Daffodil International University — Main Campus
- Prime University
- Mirpur 1
- Mazar Road
- Lalkhuti
- Gabtoli Road

Other areas have a delivery charge.

Do NOT hard-code charges in frontend code.

Create a database-backed `delivery_zones` table:

``` text
id
name
city
area
delivery_charge
is_free
is_active
created_at
updated_at
```

Admin can modify delivery charges.

------------------------------------------------------------------------

## 14. Return / Exchange

Business policy:

**No Return / No Exchange.**

Customers should check the product upon receiving it. Any issue should
be reported immediately after delivery.

The policy must appear on:

- Return & Exchange page
- Checkout
- Footer

Checkout must contain an explicit checkbox:

``` text
[ ] I agree to the Cash on Delivery and No Return/Exchange policy.
```

Store the acceptance on the order:

``` text
policy_accepted = true
```

------------------------------------------------------------------------

## 15. Contact / Social

Phone:

``` text
01865330801
```

Facebook:

``` text
https://www.facebook.com/share/19bb8cxwHW/
```

Instagram:

``` text
https://www.instagram.com/_flembe_._essence_?stkn=MmI4OG8yem9mZ2hn
```

Use direct external links. Full social-media API integration is not
required for MVP.

------------------------------------------------------------------------

# 16. Database Design

## users

For admin authentication:

``` text
id PK
username
email
password_hash
role
is_active
created_at
updated_at
```

Prefer Django’s built-in/custom user model.

## categories

``` text
id PK
name
slug UNIQUE
description
image
parent_id FK → categories.id, nullable
is_active
created_at
updated_at
```

## products

``` text
id PK
category_id FK
name
slug UNIQUE
description
material
price
stock_quantity
sku UNIQUE
is_active
created_at
updated_at
```

## product_images

``` text
id PK
product_id FK
image_url
alt_text
is_primary
display_order
created_at
```

## customers

``` text
id PK
name
phone
created_at
updated_at
```

## delivery_zones

``` text
id PK
name
city
area
delivery_charge
is_free
is_active
created_at
updated_at
```

## orders

``` text
id PK
order_number UNIQUE
customer_id FK
delivery_zone_id FK
address
subtotal
delivery_charge
total_amount
payment_method
payment_status
order_status
policy_accepted
customer_note
created_at
updated_at
```

## order_items

``` text
id PK
order_id FK
product_id FK
product_name
unit_price
quantity
subtotal
```

Store `product_name` and `unit_price` as snapshots so historical orders
remain correct when products are renamed or repriced.

------------------------------------------------------------------------

# 17. Relationships

``` text
Category 1 ─── N Product
Product 1 ─── N ProductImage
Customer 1 ─── N Order
Order 1 ─── N OrderItem
Product 1 ─── N OrderItem
DeliveryZone 1 ─── N Order
```

Add indexes for:

``` text
slug
SKU
category_id
order_number
customer phone
order_status
created_at
```

------------------------------------------------------------------------

# 18. REST API

## Auth

``` http
POST /api/v1/auth/login/
POST /api/v1/auth/token/refresh/
```

## Categories

``` http
GET    /api/v1/categories/
GET    /api/v1/categories/{id}/
POST   /api/v1/categories/                 # admin
PATCH  /api/v1/categories/{id}/            # admin
DELETE /api/v1/categories/{id}/            # admin
```

## Products

``` http
GET    /api/v1/products/
GET    /api/v1/products/{id}/
POST   /api/v1/products/                   # admin
PATCH  /api/v1/products/{id}/              # admin
DELETE /api/v1/products/{id}/              # admin
```

## Orders

``` http
POST   /api/v1/orders/
GET    /api/v1/orders/{id}/
GET    /api/v1/admin/orders/                # admin
GET    /api/v1/admin/orders/{id}/           # admin
PATCH  /api/v1/admin/orders/{id}/status/   # admin
```

## Delivery

``` http
GET    /api/v1/delivery-zones/
POST   /api/v1/admin/delivery-zones/        # admin
PATCH  /api/v1/admin/delivery-zones/{id}/  # admin
DELETE /api/v1/admin/delivery-zones/{id}/  # admin
```

------------------------------------------------------------------------

# 19. Example Product Response

``` json
{
  "id": 1,
  "name": "Elegant Pearl Necklace",
  "slug": "elegant-pearl-necklace",
  "price": 450,
  "description": "Elegant necklace for everyday fashion.",
  "material": "Artificial Pearl",
  "stock_quantity": 12,
  "stock_status": "IN_STOCK",
  "category": {
    "id": 5,
    "name": "Necklaces"
  },
  "images": [
    {
      "url": "https://...",
      "is_primary": true
    }
  ]
}
```

------------------------------------------------------------------------

# 20. Example Order Request

``` json
{
  "customer": {
    "name": "Customer Name",
    "phone": "018XXXXXXXX"
  },
  "address": "Mirpur 1, Dhaka",
  "delivery_zone_id": 3,
  "items": [
    {
      "product_id": 12,
      "quantity": 2
    }
  ],
  "customer_note": "Please call before delivery.",
  "policy_accepted": true
}
```

Example response:

``` json
{
  "order_number": "FE-20260925-001",
  "subtotal": 700,
  "delivery_charge": 0,
  "total_amount": 700,
  "payment_method": "COD",
  "payment_status": "UNPAID",
  "order_status": "PENDING",
  "message": "Your order has been placed successfully."
}
```

------------------------------------------------------------------------

# 21. Critical Business Logic

## Total calculation

``` text
subtotal = SUM(unit_price × quantity)
total = subtotal + delivery_charge
```

Backend calculates both.

## Stock

Validate stock before order creation.

Use a database transaction and appropriate row locking to reduce
overselling.

Do not allow ordering inactive or out-of-stock products.

## Delivery

Determine charge from the database using the selected delivery zone.

Do not trust a frontend-supplied delivery charge.

------------------------------------------------------------------------

# 22. Admin Requirements

Admin should manage:

### Products

- Create
- Edit
- Deactivate
- Price
- Stock
- Images

### Categories

- Create
- Edit
- Activate/deactivate

### Orders

- Search by order number
- Search by phone
- View customer
- View products
- View totals
- Update status

### Delivery

- Create area
- Edit charge
- Mark free delivery
- Activate/deactivate

For MVP, Django Admin is acceptable and preferred if it speeds up
delivery.

------------------------------------------------------------------------

# 23. Security

Implement:

- JWT/admin authentication
- Django password hashing
- DRF permissions
- CORS configuration
- Input validation
- API throttling where appropriate
- Server-side price calculation
- Server-side stock validation
- Server-side delivery calculation
- Proper transaction handling

Never commit secrets.

------------------------------------------------------------------------

# 24. Frontend Components

Use reusable components such as:

``` text
Navbar
Footer
HeroSection
CategoryCard
ProductCard
ProductGrid
ProductGallery
PriceDisplay
StockBadge
QuantitySelector
OrderForm
OrderSummary
DeliverySelector
PolicyCheckbox
SocialLinks
LoadingState
EmptyState
ErrorState
```

Avoid duplicated UI/business logic.

------------------------------------------------------------------------

# 25. Responsive / Accessibility

Mobile-first.

Suggested product grid:

``` text
Mobile: 2 columns
Tablet: 3 columns
Desktop: 4 columns
```

Adjust if needed for visual quality.

Implement:

- Semantic HTML
- Form labels
- Keyboard accessibility
- Visible focus states
- Image alt text
- Good contrast
- Touch-friendly controls
- Clear validation messages

------------------------------------------------------------------------

# 26. SEO / Performance

Implement:

- Page titles
- Meta descriptions
- Open Graph metadata
- Clean slugs
- Sitemap
- robots.txt
- Optimized product images
- Lazy loading
- Pagination
- Efficient database queries

Example URL:

``` text
/products/elegant-pearl-necklace
```

------------------------------------------------------------------------

# 27. Error Handling

Use clear customer-facing states:

``` text
Loading...
No products found.
Product unavailable.
Something went wrong.
Order could not be placed.
Please try again.
```

Never expose production stack traces.

API errors should be structured and consistent, for example:

``` json
{
  "success": false,
  "message": "Insufficient stock.",
  "errors": {
    "quantity": ["Only 2 items are available."]
  }
}
```

------------------------------------------------------------------------

# 28. Environment

Create `.env.example`.

Potential variables:

``` env
DEBUG=False
SECRET_KEY=
DATABASE_URL=
CORS_ALLOWED_ORIGINS=
NEXT_PUBLIC_API_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Only include variables actually used.

Never commit `.env`.

------------------------------------------------------------------------

# 29. Seed Data

Create a development seed/fixture containing:

``` text
Rings
Earrings
Bracelets
Hair Accessories
Necklaces
Other Accessories
```

Add several realistic demo products.

Clearly mark demo content so it can be removed before production.

------------------------------------------------------------------------

# 30. Testing

Backend tests must cover:

- Product creation/list/detail
- Search/filter
- Out-of-stock behavior
- Valid order
- Invalid customer data
- Invalid product
- Insufficient stock
- Policy not accepted
- Correct subtotal
- Correct delivery charge
- Correct total
- Stock update
- Admin permissions
- Transaction/overselling protection where practical

Frontend checks:

- Mobile navigation
- Product browsing
- Search/filter
- Product detail
- Checkout
- Validation
- Order success
- Loading/error/empty states
- Responsive layout

------------------------------------------------------------------------

# 31. Documentation

Maintain:

``` text
README.md
docs/REQUIREMENTS.md
docs/API.md
docs/DATABASE.md
```

README: - Project overview - Architecture - Tech stack - Setup -
Environment variables - Database - Running backend - Running frontend -
Testing - Deployment

API.md: - Endpoints - Auth - Request examples - Responses - Errors -
Permissions

DATABASE.md: - Tables - Fields - Relationships - Indexes - Business
rules

------------------------------------------------------------------------

# 32. Development Phases

## Phase 1 — Foundation

``` text
Repository inspection
Frontend setup
Backend setup
PostgreSQL
Environment config
Base API
Design system
```

## Phase 2 — Catalog

``` text
Categories
Products
Images
Stock
Shop
Product details
Search/filter
```

## Phase 3 — Ordering

``` text
Customer
Delivery zones
Checkout
COD
Order creation
Stock validation
Order confirmation
```

## Phase 4 — Admin

``` text
Admin authentication
Product management
Category management
Order management
Delivery management
```

## Phase 5 — Polish

``` text
Responsive UI
SEO
Accessibility
Performance
Error handling
Testing
Documentation
```

------------------------------------------------------------------------

# 33. MVP Acceptance Checklist

### Customer

- [ ] Homepage works
- [ ] Shop works
- [ ] Categories work
- [ ] Product details work
- [ ] Search works
- [ ] Filtering works
- [ ] Stock status works
- [ ] COD checkout works
- [ ] Backend calculates totals
- [ ] Delivery charge is correct
- [ ] Policy acceptance is required
- [ ] Order confirmation works
- [ ] Facebook works
- [ ] Instagram works
- [ ] Contact works
- [ ] Delivery page works
- [ ] Return/Exchange page works
- [ ] Mobile UI works

### Admin

- [ ] Admin login works
- [ ] Product CRUD works
- [ ] Category CRUD works
- [ ] Stock management works
- [ ] Order management works
- [ ] Order status works
- [ ] Delivery zone CRUD works

### Engineering

- [ ] PostgreSQL works
- [ ] API versioning works
- [ ] Secrets are environment-based
- [ ] Tests pass
- [ ] Frontend lint/type checks pass
- [ ] Production build succeeds
- [ ] README complete
- [ ] API documentation complete
- [ ] Database documentation complete

------------------------------------------------------------------------

# 34. Future Features — Do Not Implement Yet

Architecture may support:

- Customer accounts
- Wishlist
- Reviews
- Coupons
- Discounts
- Product variants
- Size/color
- Sales analytics
- Email/SMS notifications
- WhatsApp integration
- Online payment
- Order tracking
- Inventory history
- Marketplace/multiple sellers
- Cox’s Bazar local-product expansion

Do not implement these in MVP unless explicitly requested.

------------------------------------------------------------------------

# 35. Autonomous Agent Instructions

Antigravity must act as a senior full-stack engineer.

### Before coding

1.  Inspect the repository and existing code.
2.  Identify what already exists.
3.  Preserve useful existing implementation.
4.  Create a task checklist.
5.  Verify installed dependencies.
6.  Start with the foundation and proceed phase by phase.

### While coding

1.  Follow this document as the source of truth.
2.  Make reasonable minor decisions autonomously.
3.  Do not repeatedly ask for confirmation for ordinary implementation
    choices.
4.  Do not hard-code database-driven business data.
5.  Do not expose secrets.
6.  Avoid unnecessary dependencies.
7.  Keep API contracts synchronized with frontend.
8.  Write tests for important business logic.
9.  Keep the UI consistent with the brand palette.
10. Prefer production-quality code over demo/mock behavior.

### After each phase

1.  Run tests.
2.  Run lint/type checks.
3.  Run build checks.
4.  Fix discovered errors.
5.  Review mobile UX.
6.  Update documentation.
7.  Continue to the next phase.

Only stop and ask the owner when a decision would materially affect
business behavior, legal/policy meaning, data ownership, or significant
infrastructure cost.

**Do not stop after generating a plan. Implement the project.**

------------------------------------------------------------------------

# 36. Final Definition of Done

The project is done when Flembe Essence is a real working full-stack
application—not a static mockup—with:

``` text
Next.js
+
TypeScript
+
Tailwind CSS
+
Django
+
Django REST Framework
+
PostgreSQL
```

and real:

``` text
Products
Categories
Images
Inventory
Delivery Zones
COD Orders
Order Items
Order Status
Admin Management
```

The final UI should feel like a polished, elegant, feminine, affordable
lifestyle brand using:

``` text
Burgundy  #4B1D3F
Nude      #E8D9C1
Rose Smoke #D8A7B1
Off Black #1B1B1B
```

Build it, test it, fix it, document it, and leave the repository in a
runnable state.
