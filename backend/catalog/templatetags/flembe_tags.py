"""
flembe_tags — custom template tags used by the Flembe Essence admin dashboard.
Provides {% get_store_stats as stats %} which returns a dict of KPIs.
"""
from django import template
from django.db.models import Sum

register = template.Library()


@register.simple_tag
def get_store_stats():
    """Return a dict of store KPIs for the admin dashboard."""
    # Import inside the function so this tag can be loaded before models are ready
    from orders.models import Order
    from catalog.models import Product

    pending   = Order.objects.filter(order_status='PENDING').count()
    confirmed = Order.objects.filter(order_status__in=['CONFIRMED', 'PROCESSING', 'SHIPPED']).count()
    delivered = Order.objects.filter(order_status='DELIVERED').count()
    total     = Order.objects.count()

    active_products  = Product.objects.filter(is_active=True).count()
    out_of_stock     = Product.objects.filter(is_active=True, stock_quantity=0).count()
    low_stock_count  = Product.objects.filter(is_active=True, stock_quantity__gt=0, stock_quantity__lte=3).count()

    revenue = (
        Order.objects
        .filter(order_status__in=['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'])
        .aggregate(total=Sum('total_amount'))['total'] or 0
    )

    recent_orders = (
        Order.objects
        .select_related('customer', 'delivery_zone')
        .order_by('-created_at')[:10]
    )

    low_stock_products = (
        Product.objects
        .filter(is_active=True, stock_quantity__lte=3)
        .order_by('stock_quantity')[:6]
    )

    return {
        'pending_orders':    pending,
        'confirmed_orders':  confirmed,
        'delivered_orders':  delivered,
        'total_orders':      total,
        'active_products':   active_products,
        'out_of_stock':      out_of_stock,
        'low_stock_count':   low_stock_count,
        'total_revenue':     int(revenue),
        'recent_orders':     recent_orders,
        'low_stock_products': low_stock_products,
    }
