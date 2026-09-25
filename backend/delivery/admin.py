from django.contrib import admin
from .models import DeliveryZone


@admin.register(DeliveryZone)
class DeliveryZoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'area', 'delivery_charge', 'is_free', 'is_active']
    list_filter = ['city', 'is_free', 'is_active']
    search_fields = ['name', 'area', 'city']
    list_editable = ['delivery_charge', 'is_free', 'is_active']
