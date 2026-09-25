from django.contrib import admin
from .models import Customer, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'unit_price', 'quantity', 'subtotal']
    fields = ['product', 'product_name', 'unit_price', 'quantity', 'subtotal']


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'created_at']
    search_fields = ['name', 'phone']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer', 'order_status', 'payment_status',
                    'total_amount', 'payment_method', 'created_at']
    list_filter = ['order_status', 'payment_status', 'payment_method']
    search_fields = ['order_number', 'customer__phone', 'customer__name']
    readonly_fields = ['order_number', 'subtotal', 'delivery_charge', 'total_amount', 'created_at', 'updated_at']
    list_editable = ['order_status']
    ordering = ['-created_at']
    inlines = [OrderItemInline]

    fieldsets = (
        ('Order Info', {
            'fields': ('order_number', 'order_status', 'payment_method', 'payment_status')
        }),
        ('Customer', {
            'fields': ('customer', 'address', 'customer_note', 'policy_accepted')
        }),
        ('Delivery', {
            'fields': ('delivery_zone',)
        }),
        ('Financials', {
            'fields': ('subtotal', 'delivery_charge', 'total_amount')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
