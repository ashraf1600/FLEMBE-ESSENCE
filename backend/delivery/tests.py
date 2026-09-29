from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import DeliveryZone

User = get_user_model()


class DeliveryZoneCRUDTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin_test',
            password='AdminPassword123!',
            email='admin@test.com'
        )
        self.user = User.objects.create_user(
            username='customer_test',
            password='CustomerPassword123!',
            email='customer@test.com'
        )
        self.active_zone = DeliveryZone.objects.create(
            name='Daffodil Main Campus',
            city='Dhaka',
            area='Birulia',
            delivery_charge=0,
            is_free=True,
            is_active=True
        )
        self.inactive_zone = DeliveryZone.objects.create(
            name='Old Suburb Hub',
            city='Dhaka',
            area='Ashulia',
            delivery_charge=150,
            is_free=False,
            is_active=False
        )

    def test_anonymous_sees_only_active_zones(self):
        res = self.client.get('/api/v1/delivery-zones/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = [z['name'] for z in res.data] if isinstance(res.data, list) else [z['name'] for z in res.data.get('results', [])]
        self.assertIn('Daffodil Main Campus', names)
        self.assertNotIn('Old Suburb Hub', names)

    def test_admin_sees_all_zones(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/v1/delivery-zones/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = [z['name'] for z in res.data] if isinstance(res.data, list) else [z['name'] for z in res.data.get('results', [])]
        self.assertIn('Daffodil Main Campus', names)
        self.assertIn('Old Suburb Hub', names)

    def test_admin_create_zone(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'name': 'Cox\'s Bazar Beach Area',
            'city': 'Cox\'s Bazar',
            'area': 'Kolatoli Point',
            'delivery_charge': 80,
            'is_free': False,
            'is_active': True,
        }
        res = self.client.post('/api/v1/delivery-zones/', payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['name'], 'Cox\'s Bazar Beach Area')
        self.assertEqual(float(res.data['delivery_charge']), 80.0)

    def test_admin_create_free_zone_forces_zero_charge(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'name': 'Prime University Mirpur',
            'city': 'Dhaka',
            'area': 'Mirpur 1',
            'delivery_charge': 120,
            'is_free': True,
            'is_active': True,
        }
        res = self.client.post('/api/v1/delivery-zones/', payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(res.data['delivery_charge']), 0.0)

    def test_admin_update_zone(self):
        self.client.force_authenticate(user=self.admin)
        update_data = {
            'delivery_charge': 75,
            'is_free': False,
            'area': 'Birulia Road, Savar',
        }
        res = self.client.patch(f'/api/v1/delivery-zones/{self.active_zone.id}/', update_data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.active_zone.refresh_from_db()
        self.assertEqual(float(self.active_zone.delivery_charge), 75.0)
        self.assertFalse(self.active_zone.is_free)
        self.assertEqual(self.active_zone.area, 'Birulia Road, Savar')

    def test_admin_toggle_active_status(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.patch(f'/api/v1/delivery-zones/{self.active_zone.id}/', {'is_active': False})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.active_zone.refresh_from_db()
        self.assertFalse(self.active_zone.is_active)

    def test_admin_delete_zone(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.delete(f'/api/v1/delivery-zones/{self.active_zone.id}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(DeliveryZone.objects.filter(id=self.active_zone.id).exists())

    def test_unauthenticated_cannot_create_or_modify(self):
        payload = {'name': 'Hack Zone', 'city': 'Dhaka', 'delivery_charge': 0, 'is_free': True}
        res_post = self.client.post('/api/v1/delivery-zones/', payload)
        self.assertEqual(res_post.status_code, status.HTTP_401_UNAUTHORIZED)

        res_patch = self.client.patch(f'/api/v1/delivery-zones/{self.active_zone.id}/', {'delivery_charge': 500})
        self.assertEqual(res_patch.status_code, status.HTTP_401_UNAUTHORIZED)

        res_del = self.client.delete(f'/api/v1/delivery-zones/{self.active_zone.id}/')
        self.assertEqual(res_del.status_code, status.HTTP_401_UNAUTHORIZED)
