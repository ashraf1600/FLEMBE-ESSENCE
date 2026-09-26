from django.contrib import admin
from django.utils.html import format_html
from .models import DeliveryZone


@admin.register(DeliveryZone)
class DeliveryZoneAdmin(admin.ModelAdmin):
    list_display  = ['name', 'city', 'area', 'charge_display', 'active_badge']
    list_filter   = ['city', 'is_free', 'is_active']
    search_fields = ['name', 'city', 'area']
    ordering      = ['city', 'name']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 30

    fieldsets = (
        ('Zone Details', {
            'description': (
                'Add the name, city, and specific area for this delivery location. '
                'Example: Name = "Mirpur 1", City = "Dhaka", Area = "Mirpur, Dhaka".'
            ),
            'fields': ('name', 'city', 'area'),
        }),
        ('Delivery Charge', {
            'description': (
                '✅  Tick "Free delivery" to offer free delivery in this area — '
                'the charge will automatically be set to ৳0. '
                'Otherwise enter the charge in Taka.'
            ),
            'fields': ('is_free', 'delivery_charge'),
        }),
        ('Is this area active?', {
            'description': 'Uncheck to stop accepting orders to this area temporarily.',
            'fields': ('is_active',),
        }),
        ('System', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    # ── Custom columns ────────────────────────────────────────────────────────

    def charge_display(self, obj):
        if obj.is_free:
            return format_html(
                '<span style="background:#ecfdf5;color:#059669;padding:4px 12px;'
                'font-size:11px;font-weight:700;">🎁  FREE DELIVERY</span>'
            )
        return format_html(
            '<strong style="color:#4B1D3F;font-size:14px;">৳{}</strong>',
            f'{obj.delivery_charge:,.0f}',
        )
    charge_display.short_description = 'Delivery Charge'
    charge_display.admin_order_field = 'delivery_charge'

    def active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="color:#059669;font-weight:700;">✓  Active</span>'
            )
        return format_html('<span style="color:#aaa;">○  Paused</span>')
    active_badge.short_description = 'Accepting Orders?'
    active_badge.admin_order_field = 'is_active'
