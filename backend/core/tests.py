"""
Tests for Flembe Essence backend — catalog, orders, delivery.
Run: python manage.py test
"""
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from catalog.models import Category, Product, ProductImage
from delivery.models import DeliveryZone
from orders.models import Order, Customer


def make_category(name='Necklaces', parent=None):
    from django.utils.text import slugify
    cat, _ = Category.objects.get_or_create(slug=slugify(name), defaults={'name': name, 'parent': parent})
    return cat


def make_product(name='Test Necklace', sku='TEST-001', price=500, stock=10, category=None, active=True):
    from django.utils.text import slugify
    if category is None:
        category = make_category()
    p, _ = Product.objects.get_or_create(
        sku=sku,
        defaults={
            'name': name,
            'slug': slugify(name),
            'price': price,
            'stock_quantity': stock,
            'category': category,
            'is_active': active,
        }
    )
    return p


def make_zone(name='Test Zone', city='Dhaka', charge=60, free=False):
    z, _ = DeliveryZone.objects.get_or_create(
        name=name,
        defaults={'city': city, 'area': name, 'delivery_charge': charge, 'is_free': free}
    )
    return z


def make_admin():
    u, _ = User.objects.get_or_create(username='admin_test', defaults={'is_staff': True, 'is_superuser': True})
    u.set_password('admin123')
    u.save()
    return u


# ─── Catalog Tests ────────────────────────────────────────────────────────────

class CategoryAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat = make_category('Rings')

    def test_list_categories(self):
        resp = self.client.get('/api/v1/categories/')
        self.assertEqual(resp.status_code, 200)

    def test_category_detail(self):
        resp = self.client.get(f'/api/v1/categories/{self.cat.slug}/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['name'], 'Rings')


class ProductAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.product = make_product()

    def test_list_products(self):
        resp = self.client.get('/api/v1/products/')
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(resp.data['count'], 1)

    def test_product_detail(self):
        resp = self.client.get(f'/api/v1/products/{self.product.slug}/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['name'], self.product.name)

    def test_product_stock_status(self):
        self.assertEqual(self.product.stock_status, 'IN_STOCK')
        self.product.stock_quantity = 0
        self.product.save()
        self.assertEqual(self.product.stock_status, 'OUT_OF_STOCK')

    def test_product_search(self):
        resp = self.client.get('/api/v1/products/?search=Test')
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(resp.data['count'], 1)

    def test_product_category_filter(self):
        resp = self.client.get('/api/v1/products/?category=necklaces')
        self.assertEqual(resp.status_code, 200)

    def test_product_price_filter(self):
        resp = self.client.get('/api/v1/products/?min_price=100&max_price=1000')
        self.assertEqual(resp.status_code, 200)

    def test_product_ordering(self):
        resp = self.client.get('/api/v1/products/?ordering=price')
        self.assertEqual(resp.status_code, 200)
        resp2 = self.client.get('/api/v1/products/?ordering=-price')
        self.assertEqual(resp2.status_code, 200)

    def test_inactive_product_hidden(self):
        p = make_product(name='Inactive', sku='INACTIVE-001', active=False)
        resp = self.client.get('/api/v1/products/')
        slugs = [item['slug'] for item in resp.data['results']]
        self.assertNotIn(p.slug, slugs)

    def test_create_product_requires_admin(self):
        resp = self.client.post('/api/v1/products/', {'name': 'Hack', 'price': 100, 'sku': 'HACK-001'})
        self.assertEqual(resp.status_code, 401)


# ─── Order Tests ──────────────────────────────────────────────────────────────

class OrderAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='customer_user', password='password123')
        self.client.force_authenticate(user=self.user)
        self.product = make_product(price=500, stock=10)
        self.zone = make_zone(charge=60)

    def _order_payload(self, quantity=2, zone_id=None, policy=True):
        return {
            'customer': {'name': 'Test Customer', 'phone': '01800000001'},
            'address': '123 Test St, Dhaka',
            'delivery_zone_id': zone_id or self.zone.id,
            'items': [{'product_id': self.product.id, 'quantity': quantity}],
            'customer_note': 'Test note',
            'policy_accepted': policy,
        }

    def test_unauthenticated_can_place_guest_order(self):
        anon_client = APIClient()
        resp = anon_client.post('/api/v1/orders/', self._order_payload(), format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn('order_number', resp.data)

    def test_valid_order_creation(self):
        resp = self.client.post('/api/v1/orders/', self._order_payload(), format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn('order_number', resp.data)
        self.assertEqual(resp.data['payment_method'], 'COD')
        self.assertEqual(resp.data['order_status'], 'PENDING')

    def test_backend_calculates_subtotal_correctly(self):
        resp = self.client.post('/api/v1/orders/', self._order_payload(quantity=2), format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Decimal(resp.data['subtotal']), Decimal('1000.00'))  # 500 * 2
        self.assertEqual(Decimal(resp.data['delivery_charge']), Decimal('60.00'))
        self.assertEqual(Decimal(resp.data['total_amount']), Decimal('1060.00'))

    def test_free_delivery_zone(self):
        free_zone = make_zone('Free Zone', charge=0, free=True)
        resp = self.client.post('/api/v1/orders/', self._order_payload(zone_id=free_zone.id), format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Decimal(resp.data['delivery_charge']), Decimal('0.00'))
        self.assertEqual(Decimal(resp.data['total_amount']), Decimal('1000.00'))

    def test_policy_not_accepted_rejected(self):
        resp = self.client.post('/api/v1/orders/', self._order_payload(policy=False), format='json')
        self.assertEqual(resp.status_code, 400)

    def test_insufficient_stock_rejected(self):
        resp = self.client.post('/api/v1/orders/', self._order_payload(quantity=999), format='json')
        self.assertEqual(resp.status_code, 400)

    def test_out_of_stock_product_rejected(self):
        self.product.stock_quantity = 0
        self.product.save()
        resp = self.client.post('/api/v1/orders/', self._order_payload(quantity=1), format='json')
        self.assertEqual(resp.status_code, 400)

    def test_inactive_product_rejected(self):
        self.product.is_active = False
        self.product.save()
        resp = self.client.post('/api/v1/orders/', self._order_payload(), format='json')
        self.assertEqual(resp.status_code, 400)

    def test_stock_decremented_after_order(self):
        initial_stock = self.product.stock_quantity
        quantity = 3
        resp = self.client.post('/api/v1/orders/', self._order_payload(quantity=quantity), format='json')
        self.assertEqual(resp.status_code, 201)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, initial_stock - quantity)

    def test_order_number_format(self):
        resp = self.client.post('/api/v1/orders/', self._order_payload(), format='json')
        self.assertEqual(resp.status_code, 201)
        order_number = resp.data['order_number']
        self.assertTrue(order_number.startswith('FE-'))

    def test_retrieve_order_by_number(self):
        resp = self.client.post('/api/v1/orders/', self._order_payload(), format='json')
        order_number = resp.data['order_number']
        resp2 = self.client.get(f'/api/v1/orders/{order_number}/')
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.data['order_number'], order_number)

    def test_invalid_delivery_zone_rejected(self):
        payload = self._order_payload()
        payload['delivery_zone_id'] = 9999
        resp = self.client.post('/api/v1/orders/', payload, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_missing_customer_phone_rejected(self):
        payload = self._order_payload()
        payload['customer'] = {'name': 'No Phone'}
        resp = self.client.post('/api/v1/orders/', payload, format='json')
        self.assertEqual(resp.status_code, 400)


# ─── Admin Tests ──────────────────────────────────────────────────────────────

class AdminOrderAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.product = make_product(price=300, stock=20, sku='ADMIN-PROD-001')
        self.zone = make_zone('Admin Zone', charge=50)
        self.admin = make_admin()
        # Place an order to test with
        payload = {
            'customer': {'name': 'Admin Customer', 'phone': '01900000001'},
            'address': 'Admin Street',
            'delivery_zone_id': self.zone.id,
            'items': [{'product_id': self.product.id, 'quantity': 1}],
            'policy_accepted': True,
        }
        # Authenticate customer to place the initial order
        cust_user = User.objects.create_user(username='admin_cust_user', password='password123')
        self.client.force_authenticate(user=cust_user)
        resp = self.client.post('/api/v1/orders/', payload, format='json')
        self.order_number = resp.data['order_number']
        self.client.force_authenticate(user=None)

    def _login_admin(self):
        resp = self.client.post('/api/v1/auth/login/', {'username': 'admin_test', 'password': 'admin123'}, format='json')
        token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_admin_list_orders_unauthorized(self):
        resp = self.client.get('/api/v1/admin/orders/')
        self.assertIn(resp.status_code, [401, 403])

    def test_admin_list_orders_authorized(self):
        self._login_admin()
        resp = self.client.get('/api/v1/admin/orders/')
        self.assertEqual(resp.status_code, 200)

    def test_admin_update_order_status(self):
        self._login_admin()
        resp = self.client.patch(
            f'/api/v1/admin/orders/{self.order_number}/status/',
            {'order_status': 'CONFIRMED'},
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        order = Order.objects.get(order_number=self.order_number)
        self.assertEqual(order.order_status, 'CONFIRMED')

    def test_admin_stats_unauthorized(self):
        resp = self.client.get('/api/v1/admin/stats/')
        self.assertIn(resp.status_code, [401, 403])

    def test_admin_stats_authorized(self):
        self._login_admin()
        resp = self.client.get('/api/v1/admin/stats/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('total_orders', resp.data)
        self.assertIn('total_revenue', resp.data)
        self.assertIn('category_sales', resp.data)
        self.assertIn('top_products', resp.data)
        self.assertIn('recent_orders', resp.data)
        self.assertIn('low_stock_products', resp.data)
        self.assertEqual(resp.data['total_orders'], 1)


# ─── Auth & Customer Protection Tests ─────────────────────────────────────────

class AuthAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_user_registration(self):
        resp = self.client.post('/api/v1/auth/register/', {
            'username': 'newcustomer',
            'email': 'customer@example.com',
            'password': 'SecurePassword123!',
            'name': 'Jane Doe',
            'phone': '01812345678',
        }, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)
        self.assertEqual(resp.data['user']['username'], 'newcustomer')
        self.assertEqual(resp.data['user']['name'], 'Jane Doe')

    def test_user_login_returns_profile(self):
        u = User.objects.create_user(username='loginuser', email='login@example.com', password='mypassword')
        u.first_name = 'Login'
        u.last_name = 'User'
        u.save()

        resp = self.client.post('/api/v1/auth/login/', {
            'username': 'loginuser',
            'password': 'mypassword',
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.data)
        self.assertEqual(resp.data['user']['username'], 'loginuser')
        self.assertEqual(resp.data['user']['email'], 'login@example.com')

    def test_current_user_me_unauthorized(self):
        resp = self.client.get('/api/v1/auth/me/')
        self.assertEqual(resp.status_code, 401)

    def test_current_user_me_authorized(self):
        u = User.objects.create_user(username='meuser', email='me@example.com', password='mypassword')
        self.client.force_authenticate(user=u)
        resp = self.client.get('/api/v1/auth/me/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['username'], 'meuser')

    def test_my_orders_requires_authentication(self):
        resp = self.client.get('/api/v1/orders/my-orders/')
        self.assertEqual(resp.status_code, 401)

    def test_my_orders_returns_user_orders(self):
        u = User.objects.create_user(username='order_owner', password='password123')
        self.client.force_authenticate(user=u)

        product = make_product(sku='AUTH-001')
        zone = make_zone('Auth Zone')
        customer = Customer.objects.create(name='Owner', phone='01899999999')

        order = Order.objects.create(
            order_number='FE-20260926-999',
            user=u,
            customer=customer,
            delivery_zone=zone,
            address='Dhaka',
            subtotal=500,
            delivery_charge=60,
            total_amount=560,
            policy_accepted=True,
        )

        resp = self.client.get('/api/v1/orders/my-orders/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data['results'] if 'results' in resp.data else resp.data), 1)


