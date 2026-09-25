from rest_framework import serializers
from .models import DeliveryZone


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = ['id', 'name', 'city', 'area', 'delivery_charge', 'is_free', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
