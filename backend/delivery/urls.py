from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliveryZoneViewSet

router = DefaultRouter()
router.register('delivery-zones', DeliveryZoneViewSet, basename='delivery-zone')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', include(router.urls)),  # Same endpoints, protected by IsAdminUser
]
