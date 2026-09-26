from django.contrib import admin
from django.utils.html import format_html
from .models import Customer, Order, OrderItem


# ─── Status colour/icon map ───────────────────────────────────────────────────

STATUS_STYLE = {
    'PENDING':         ('#fffbeb', '#b45309', '🕐'),
    'CONFIRMED':       ('#eff6ff', '#1d4ed8', '✅'),
    'PROCESSING':      ('#f5f3ff', '#7c3aed', '⚙️'),
    'SHIPPED':         ('#e0f2fe', '#0369a1', '🚚'),
    'DELIVERED':       ('#ecfdf5', '#059669', '📦'),
    'CANCELLED':       ('#f9fafb', '#6b7280', '❌'),
    'FAILED_DELIVERY': ('#fef2f2', '#dc2626', '⚠️'),
}


# ─── Inline ──────────────────────────────────────────────────────────────────

class OrderItemInline(admin.TabularInline):
    model         = OrderItem
    extra         = 0
    readonly_fields = ['product_name', 'unit_price', 'quantity', 'subtotal']
    fields        = ['product_name', 'unit_price', 'quantity', 'subtotal']
    verbose_name  = "Item"
    verbose_name_plural = "🛍️  Items in this Order"
    can_delete    = False

    def has_add_permission(self, request, obj=None):
        return False


# ─── Customer ─────────────────────────────────────────────────────────────────

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display  = ['name', 'phone', 'order_count', 'created_at']
    search_fields = ['name', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    ordering      = ['-created_at']

    def order_count(self, obj):
        count = obj.orders.count()
        return format_html('<strong style="color:#4B1D3F;font-size:15px;">{}</strong>', count)
    order_count.short_description = '# Orders Placed'


# ─── Order ────────────────────────────────────────────────────────────────────

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display       = [
        'order_number', 'customer_name', 'customer_phone',
        'status_badge', 'formatted_total', 'payment_badge',
        'formatted_date',
    ]
    list_display_links = ['order_number', 'customer_name']
    list_filter        = ['order_status', 'payment_status', 'created_at']
    search_fields      = ['order_number', 'customer__phone', 'customer__name']
    readonly_fields    = [
        'order_number', 'subtotal', 'delivery_charge',
        'total_amount', 'created_at', 'updated_at',
    ]
    date_hierarchy     = 'created_at'
    ordering           = ['-created_at']
    inlines            = [OrderItemInline]
    save_on_top        = True
    list_per_page      = 25

    fieldsets = (
        ('📋  Order Status', {
            'description': (
                'Change the status here to keep track of where this order is. '
                'The customer is NOT automatically notified — contact them directly if needed.'
            ),
            'fields': ('order_number', 'order_status', 'payment_method', 'payment_status'),
        }),
        ('👤  Customer', {
            'fields': ('customer', 'address', 'delivery_zone', 'customer_note'),
        }),
        ('💰  Order Totals', {
            'description': 'Calculated automatically. These cannot be edited.',
            'fields': ('subtotal', 'delivery_charge', 'total_amount'),
        }),
        ('Policy', {
            'fields': ('policy_accepted',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    # ── Custom columns ────────────────────────────────────────────────────────

    def customer_name(self, obj):
        return format_html('<strong>{}</strong>', obj.customer.name)
    customer_name.short_description = 'Customer'
    customer_name.admin_order_field = 'customer__name'

    def customer_phone(self, obj):
        return format_html(
            '<a href="tel:{}" style="color:#4B1D3F;font-weight:500;">{}</a>',
            obj.customer.phone, obj.customer.phone,
        )
    customer_phone.short_description = 'Phone'

    def status_badge(self, obj):
        bg, color, icon = STATUS_STYLE.get(obj.order_status, ('#f3f4f6', '#6b7280', '•'))
        label = obj.get_order_status_display()
        return format_html(
            '<span style="background:{};color:{};padding:5px 12px;font-size:11px;'
            'font-weight:700;letter-spacing:.05em;white-space:nowrap;">{} {}</span>',
            bg, color, icon, label,
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'order_status'

    def formatted_total(self, obj):
        return format_html(
            '<strong style="color:#4B1D3F;font-size:14px;">৳{}</strong>',
            f'{obj.total_amount:,.0f}',
        )
    formatted_total.short_description = 'Total'
    formatted_total.admin_order_field = 'total_amount'

    def payment_badge(self, obj):
        if obj.payment_status == 'PAID':
            return format_html('<span style="color:#059669;font-weight:700;">✓ Paid</span>')
        return format_html(
            '<span style="color:#b45309;font-weight:600;">⏳ COD (collect on delivery)</span>'
        )
    payment_badge.short_description = 'Payment'

    def formatted_date(self, obj):
        return format_html(
            '<span style="color:#9ca3af;font-size:12px;">{}</span>',
            obj.created_at.strftime('%d %b %Y, %I:%M %p'),
        )
    formatted_date.short_description = 'Ordered At'
    formatted_date.admin_order_field = 'created_at'
