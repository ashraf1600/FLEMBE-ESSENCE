from rest_framework import viewsets, permissions
from .models import DeliveryZone
from .serializers import DeliveryZoneSerializer


class DeliveryZoneViewSet(viewsets.ModelViewSet):
    serializer_class = DeliveryZoneSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return DeliveryZone.objects.all()
        return DeliveryZone.objects.filter(is_active=True)
