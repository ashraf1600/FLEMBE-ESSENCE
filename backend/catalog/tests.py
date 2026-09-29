from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Category, Product

User = get_user_model()


class CategoryCRUDTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin_cat_test',
            password='AdminPassword123!',
            email='admin_cat@test.com'
        )
        self.user = User.objects.create_user(
            username='user_cat_test',
            password='UserPassword123!',
            email='user_cat@test.com'
        )
        self.root_cat = Category.objects.create(
            name='Jewellery & Accessories',
            slug='jewellery-accessories',
            description='Affordable jewelry',
            is_active=True
        )
        self.sub_cat = Category.objects.create(
            name='Rings',
            slug='rings',
            description='Minimalist rings',
            parent=self.root_cat,
            is_active=True
        )
        self.inactive_cat = Category.objects.create(
            name='Archived Category',
            slug='archived-category',
            description='Old season',
            is_active=False
        )

    def test_anonymous_sees_only_active_root_categories(self):
        res = self.client.get('/api/v1/categories/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        items = res.data.get('results', res.data) if isinstance(res.data, dict) else res.data
        slugs = [c['slug'] for c in items]
        self.assertIn('jewellery-accessories', slugs)
        self.assertNotIn('archived-category', slugs)

    def test_admin_can_list_all_categories(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/v1/categories/?all=true')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        items = res.data.get('results', res.data) if isinstance(res.data, dict) else res.data
        slugs = [c['slug'] for c in items]
        self.assertIn('jewellery-accessories', slugs)
        self.assertIn('rings', slugs)
        self.assertIn('archived-category', slugs)

    def test_admin_create_category(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'name': 'Bangles & Kadas',
            'description': 'Handcrafted ethnic bangles',
            'parent': self.root_cat.id,
            'is_active': True,
        }
        res = self.client.post('/api/v1/categories/', payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['name'], 'Bangles & Kadas')
        self.assertEqual(res.data['slug'], 'bangles-kadas')
        self.assertEqual(res.data['parent'], self.root_cat.id)

    def test_admin_update_category_by_id(self):
        self.client.force_authenticate(user=self.admin)
        update_data = {
            'name': 'Updated Rings Collection',
            'description': 'Statement and stackable rings',
        }
        res = self.client.patch(f'/api/v1/categories/{self.sub_cat.id}/', update_data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.sub_cat.refresh_from_db()
        self.assertEqual(self.sub_cat.name, 'Updated Rings Collection')
        self.assertEqual(self.sub_cat.description, 'Statement and stackable rings')

    def test_admin_update_category_by_slug(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.patch(f'/api/v1/categories/{self.sub_cat.slug}/', {'is_active': False})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.sub_cat.refresh_from_db()
        self.assertFalse(self.sub_cat.is_active)

    def test_admin_delete_category(self):
        self.client.force_authenticate(user=self.admin)
        cat_id = self.sub_cat.id
        res = self.client.delete(f'/api/v1/categories/{cat_id}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(id=cat_id).exists())

    def test_unauthorized_cannot_create_or_delete(self):
        res = self.client.post('/api/v1/categories/', {'name': 'Unauthorized Cat'})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        res_del = self.client.delete(f'/api/v1/categories/{self.sub_cat.id}/')
        self.assertEqual(res_del.status_code, status.HTTP_401_UNAUTHORIZED)
