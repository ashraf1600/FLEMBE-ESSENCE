"""
Seed data management command — run with:
    python manage.py seed_data
    python manage.py seed_data --clear
"""
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from catalog.models import Category, Product, ProductImage
from delivery.models import DeliveryZone


class Command(BaseCommand):
    help = 'Seed development data: categories, products with images, delivery zones.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing products and categories before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing catalog data...'))
            ProductImage.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            DeliveryZone.objects.all().delete()
            self.stdout.write('Existing data cleared.')

        self.stdout.write('Seeding Flembe Essence data...')
        self._seed_categories()
        self._seed_delivery_zones()
        self._seed_products()
        self.stdout.write(self.style.SUCCESS('Seeding complete!'))

    def _seed_categories(self):
        # Parent Category
        parent, _ = Category.objects.get_or_create(
            slug='jewellery-accessories',
            defaults={
                'name': 'Jewellery & Accessories',
                'description': 'Affordable, elegant jewellery and stylish fashion accessories made for you.'
            }
        )
        subs = [
            ('Rings', 'Minimalist, stackable, and statement rings for everyday glamour.'),
            ('Earrings', 'Studs, hoops, and drop earrings designed for all-day comfort.'),
            ('Bracelets', 'Delicate charm chains, bangles, and beaded friendship bracelets.'),
            ('Hair Accessories', 'Chic claw clips, pearl pins, velvet headbands, and silk bows.'),
            ('Necklaces', 'Timeless pearl strands, dainty pendants, and layered gold chains.'),
            ('Other Accessories', 'Aesthetic sunglasses, travel jewellery boxes, silk scarves, and charms.'),
        ]
        for name, desc in subs:
            Category.objects.update_or_create(
                slug=slugify(name),
                defaults={
                    'name': name,
                    'description': desc,
                    'parent': parent,
                    'is_active': True,
                }
            )
        self.stdout.write('  Categories: OK (6 subcategories under Jewellery & Accessories)')

    def _seed_delivery_zones(self):
        zones = [
            # Free zones (Campus & nearby areas specified in AGENTS.md)
            {'name': 'Daffodil International University – Main Campus', 'city': 'Dhaka', 'area': 'Birulia', 'delivery_charge': 0, 'is_free': True},
            {'name': 'Prime University', 'city': 'Dhaka', 'area': 'Mirpur', 'delivery_charge': 0, 'is_free': True},
            {'name': 'Mirpur 1', 'city': 'Dhaka', 'area': 'Mirpur 1', 'delivery_charge': 0, 'is_free': True},
            {'name': 'Mazar Road', 'city': 'Dhaka', 'area': 'Mirpur', 'delivery_charge': 0, 'is_free': True},
            {'name': 'Lalkhuti', 'city': 'Dhaka', 'area': 'Mirpur', 'delivery_charge': 0, 'is_free': True},
            {'name': 'Gabtoli Road', 'city': 'Dhaka', 'area': 'Gabtoli', 'delivery_charge': 0, 'is_free': True},
            # Paid zones — Dhaka & Cox's Bazar
            {'name': 'Dhaka – Inside Dhaka', 'city': 'Dhaka', 'area': 'Inside Dhaka', 'delivery_charge': 60, 'is_free': False},
            {'name': 'Dhaka – Outside Dhaka / Suburbs', 'city': 'Dhaka', 'area': 'Outside Dhaka', 'delivery_charge': 120, 'is_free': False},
            {'name': "Cox's Bazar Town", 'city': "Cox's Bazar", 'area': "Cox's Bazar Town", 'delivery_charge': 100, 'is_free': False},
        ]
        for z in zones:
            DeliveryZone.objects.update_or_create(
                name=z['name'],
                defaults=z
            )
        self.stdout.write(f'  Delivery Zones: OK ({len(zones)} zones seeded)')

    def _seed_products(self):
        try:
            necklaces = Category.objects.get(slug='necklaces')
            earrings = Category.objects.get(slug='earrings')
            rings = Category.objects.get(slug='rings')
            bracelets = Category.objects.get(slug='bracelets')
            hair = Category.objects.get(slug='hair-accessories')
            accessories = Category.objects.get(slug='other-accessories')
        except Category.DoesNotExist:
            self.stdout.write(self.style.WARNING('  Categories not found, run seed again.'))
            return

        demo_products = [
            # ─── NECKLACES ──────────────────────────────────────────────
            {
                'name': 'Elegant Pearl Necklace',
                'sku': 'FE-NK-001',
                'category': necklaces,
                'description': 'A timeless freshwater-style pearl necklace crafted for everyday elegance and festive charm. Lightweight and comfortable for all-day wear.',
                'material': 'Artificial Pearl, 18K Gold Plated Chain',
                'price': 450,
                'stock_quantity': 20,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Elegant Pearl Necklace - Front View',
                    },
                    {
                        'url': 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Elegant Pearl Necklace - Detail View',
                    },
                ],
            },
            {
                'name': 'Layered Gold Choker Necklace',
                'sku': 'FE-NK-002',
                'category': necklaces,
                'description': 'Trendy multi-layered gold choker and chain set with delicate satellite and paperclip links. Accentuates any neckline beautifully.',
                'material': '18K Gold-plated Stainless Steel',
                'price': 550,
                'stock_quantity': 15,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Layered Gold Choker Necklace',
                    },
                    {
                        'url': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Layered Gold Choker - Lifestyle View',
                    },
                ],
            },
            {
                'name': 'Celestial Sunburst Coin Pendant',
                'sku': 'FE-NK-003',
                'category': necklaces,
                'description': 'Vintage-inspired round coin pendant embossed with radiant celestial sunburst details. Designed to catch light with subtle brilliance.',
                'material': 'Brass with Warm Gold Tone Finish',
                'price': 380,
                'stock_quantity': 25,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1569388330292-79cc1ec67270?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Celestial Sunburst Coin Pendant Necklace',
                    },
                ],
            },
            {
                'name': 'Minimalist Crystal Solitaire Pendant',
                'sku': 'FE-NK-004',
                'category': necklaces,
                'description': 'A dainty crystal solitaire pendant suspended on an ultra-fine cable chain. Minimalist aesthetic ideal for daily college and office wear.',
                'material': 'Cubic Zirconia, Rhodium-plated Chain',
                'price': 320,
                'stock_quantity': 18,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Minimalist Crystal Solitaire Pendant',
                    },
                ],
            },

            # ─── EARRINGS ───────────────────────────────────────────────
            {
                'name': 'Rose Gold Huggie Hoop Earrings',
                'sku': 'FE-ER-001',
                'category': earrings,
                'description': 'Modern chunky rose gold huggie hoop earrings. Secure click-top clasp that will not irritate sensitive ears.',
                'material': 'Rose Gold-plated Hypoallergenic Alloy',
                'price': 280,
                'stock_quantity': 35,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Rose Gold Huggie Hoop Earrings',
                    },
                    {
                        'url': 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Rose Gold Hoop Earrings Angle View',
                    },
                ],
            },
            {
                'name': 'Crystal Teardrop Dangle Earrings',
                'sku': 'FE-ER-002',
                'category': earrings,
                'description': 'Faceted teardrop glass crystal earrings with micro-pave detailing. Sparkles delightfully from every angle.',
                'material': 'Faceted Crystal, Silver Tone Setting',
                'price': 350,
                'stock_quantity': 22,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Crystal Teardrop Dangle Earrings',
                    },
                ],
            },
            {
                'name': 'Baroque Freshwater Pearl Studs',
                'sku': 'FE-ER-003',
                'category': earrings,
                'description': 'Organic irregular baroque freshwater pearls set onto hypoallergenic stainless steel posts. Understated modern luxury.',
                'material': 'Cultured Baroque Shell Pearl, Stainless Steel Post',
                'price': 260,
                'stock_quantity': 30,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Baroque Freshwater Pearl Studs',
                    },
                ],
            },
            {
                'name': 'Hammered Geometric Gold Studs',
                'sku': 'FE-ER-004',
                'category': earrings,
                'description': 'Hammered abstract disc studs delivering an editorial runway vibe at student-friendly affordability.',
                'material': 'Textured Brass with Matte Gold Finish',
                'price': 290,
                'stock_quantity': 14,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Hammered Geometric Gold Studs',
                    },
                ],
            },

            # ─── RINGS ──────────────────────────────────────────────────
            {
                'name': 'Adjustable Silver Stacking Ring',
                'sku': 'FE-RN-001',
                'category': rings,
                'description': 'A sleek minimalist adjustable silver ring with open back design. Perfect for stacking across multiple fingers.',
                'material': 'Silver-plated Alloy',
                'price': 150,
                'stock_quantity': 50,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Adjustable Silver Stacking Ring',
                    },
                    {
                        'url': 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Adjustable Silver Ring Stacking Display',
                    },
                ],
            },
            {
                'name': 'Celestial Moon & Star Ring Set',
                'sku': 'FE-RN-002',
                'category': rings,
                'description': 'Stackable two-piece ring set featuring crescent moon and north star motifs adorned with micro crystals.',
                'material': '14K Gold Plated Alloy, Zircon',
                'price': 280,
                'stock_quantity': 28,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Celestial Moon and Star Ring Set',
                    },
                ],
            },
            {
                'name': 'Vintage Opal Oval Signet Ring',
                'sku': 'FE-RN-003',
                'category': rings,
                'description': 'Art-deco inspired oval signet ring centered with an iridescent simulated opal stone surrounded by sunburst etching.',
                'material': 'Gold-plated Brass, Synthetic Opal',
                'price': 340,
                'stock_quantity': 20,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Vintage Opal Oval Signet Ring',
                    },
                ],
            },
            {
                'name': 'Dainty Twisted Rope Band Ring',
                'sku': 'FE-RN-004',
                'category': rings,
                'description': 'Delicate twisted rope motif band. Subtle texture that adds depth when stacked with solitaire or signet rings.',
                'material': 'High Polish Stainless Steel',
                'price': 180,
                'stock_quantity': 0,  # Out of stock for testing
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Dainty Twisted Rope Band Ring',
                    },
                ],
            },

            # ─── BRACELETS ──────────────────────────────────────────────
            {
                'name': 'Gold Lucky Charm Chain Bracelet',
                'sku': 'FE-BR-001',
                'category': bracelets,
                'description': 'Delicate chain bracelet adorned with miniature heart, star, and clover lucky charms with an adjustable extender.',
                'material': '18K Gold Plated Alloy',
                'price': 320,
                'stock_quantity': 25,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Gold Lucky Charm Chain Bracelet',
                    },
                ],
            },
            {
                'name': 'Pastel Beaded Friendship Bracelet',
                'sku': 'FE-BR-002',
                'category': bracelets,
                'description': 'Vibrant candy pastel beaded bracelet woven on durable elastic cord. Ideal gift for best friends and everyday campus wear.',
                'material': 'Czech Glass Beads, Stretch Cord',
                'price': 120,
                'stock_quantity': 35,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Pastel Beaded Friendship Bracelet',
                    },
                ],
            },
            {
                'name': 'Sparkling Crystal Tennis Bracelet',
                'sku': 'FE-BR-003',
                'category': bracelets,
                'description': 'Continuous line of prong-set brilliant round stones offering timeless evening glam and everyday wrist sparkle.',
                'material': 'AAA Cubic Zirconia, Rhodium-plated Brass',
                'price': 420,
                'stock_quantity': 16,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Sparkling Crystal Tennis Bracelet',
                    },
                ],
            },
            {
                'name': 'Minimalist Rose Gold Cuff Bangle',
                'sku': 'FE-BR-004',
                'category': bracelets,
                'description': 'Sleek oval cuff bangle with concealed clasp mechanism. Smooth mirror-polished finish for an effortlessly refined look.',
                'material': 'Rose Gold Stainless Steel',
                'price': 360,
                'stock_quantity': 18,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Minimalist Rose Gold Cuff Bangle',
                    },
                ],
            },

            # ─── HAIR ACCESSORIES ───────────────────────────────────────
            {
                'name': 'Floral Blossom Pearl Hair Pin Set',
                'sku': 'FE-HP-001',
                'category': hair,
                'description': 'Set of 4 handcrafted floral and pearl accent bobby pins to adorn braids, half-up styles, or sleek buns.',
                'material': 'Resin Blossom, Pearl beads, Gold-tone Pins',
                'price': 200,
                'stock_quantity': 40,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Floral Blossom Pearl Hair Pin Set',
                    },
                ],
            },
            {
                'name': 'French Amber Tortoiseshell Claw Clip',
                'sku': 'FE-HP-002',
                'category': hair,
                'description': 'Large aesthetic French claw clip in amber tortoiseshell pattern with strong metal spring for thick or fine hair.',
                'material': 'Cellulose Acetate, Steel Spring',
                'price': 180,
                'stock_quantity': 30,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
                        'alt': 'French Amber Tortoiseshell Claw Clip',
                    },
                ],
            },
            {
                'name': 'Romantic Satin Ribbon Bow Barrette',
                'sku': 'FE-HP-003',
                'category': hair,
                'description': 'Oversized dramatic silk satin ribbon bow barrette. Adds an effortlessly romantic touch to any outfit or campus look.',
                'material': 'Lustrous Silk Satin, French Clip Base',
                'price': 220,
                'stock_quantity': 26,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Romantic Satin Ribbon Bow Barrette',
                    },
                ],
            },
            {
                'name': 'Padded Velvet Pearl Headband',
                'sku': 'FE-HP-004',
                'category': hair,
                'description': 'Padded plush velvet headband hand-embellished with assorted faux pearls. Comfortable fit without temple pinch.',
                'material': 'Plush Velvet, Faux Pearl Accents',
                'price': 290,
                'stock_quantity': 15,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Padded Velvet Pearl Headband',
                    },
                ],
            },

            # ─── OTHER ACCESSORIES ──────────────────────────────────────
            {
                'name': 'Vintage Retro Cat-Eye Sunglasses',
                'sku': 'FE-AC-001',
                'category': accessories,
                'description': 'Statement cat-eye sunglasses featuring UV400 protective dark tinted lenses and gold metal temple accents.',
                'material': 'Polycarbonate Frame, UV400 Resin Lenses',
                'price': 490,
                'stock_quantity': 22,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Vintage Retro Cat-Eye Sunglasses',
                    },
                ],
            },
            {
                'name': 'Compact Quilted Travel Jewellery Case',
                'sku': 'FE-AC-002',
                'category': accessories,
                'description': 'Pocket-sized zippered jewellery box with ring rolls, necklace hooks, and divider pockets for safe travel.',
                'material': 'PU Vegan Leather, Soft Velvet Lining',
                'price': 450,
                'stock_quantity': 19,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Compact Quilted Travel Jewellery Case',
                    },
                ],
            },
            {
                'name': 'Pastel Floral Silk Square Scarf',
                'sku': 'FE-AC-003',
                'category': accessories,
                'description': 'Versatile 70x70cm silky scarf in pastel floral motif. Wear as neck scarf, hair ribbon, or handbag charm.',
                'material': 'Silk Twill Blend',
                'price': 320,
                'stock_quantity': 25,
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Pastel Floral Silk Square Scarf',
                    },
                ],
            },
            {
                'name': 'Sweet Pastel Beaded Phone Charm',
                'sku': 'FE-AC-004',
                'category': accessories,
                'description': 'Cute beaded phone wrist strap charm with pastel beads, heart charms, and durable nylon attachment cord.',
                'material': 'Acrylic Beads, Braided Nylon Cord',
                'price': 150,
                'stock_quantity': 0,  # Out of stock for testing
                'images': [
                    {
                        'url': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80',
                        'alt': 'Sweet Pastel Beaded Phone Charm',
                    },
                ],
            },
        ]

        created_count = 0
        updated_count = 0
        image_count = 0

        for p_data in demo_products:
            images = p_data.pop('images', [])
            sku = p_data['sku']
            name = p_data['name']

            product, created = Product.objects.update_or_create(
                sku=sku,
                defaults={
                    'slug': slugify(name),
                    'name': name,
                    'category': p_data['category'],
                    'description': p_data['description'],
                    'material': p_data['material'],
                    'price': p_data['price'],
                    'stock_quantity': p_data['stock_quantity'],
                    'is_active': True,
                }
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

            # Sync images for this product
            # Remove old remote images if any to prevent stale or duplicate links
            product.images.filter(image_file='').delete()

            for order_idx, img_info in enumerate(images):
                ProductImage.objects.create(
                    product=product,
                    image_url=img_info['url'],
                    alt_text=img_info.get('alt', product.name),
                    is_primary=(order_idx == 0),
                    display_order=order_idx,
                )
                image_count += 1

        self.stdout.write(
            f'  Products: OK ({created_count} created, {updated_count} updated, {image_count} images synced)'
        )
