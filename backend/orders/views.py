from rest_framework import generics, permissions, status
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Avg, F
from django.utils import timezone
import datetime

from .models import Order, OrderItem
from .serializers import OrderCreateSerializer, OrderSerializer, OrderStatusUpdateSerializer


class OrderCreateView(generics.CreateAPIView):
    """POST /api/v1/orders/ — Place a new COD order (public guest or authenticated)."""
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response({
            'order_number': order.order_number,
            'subtotal': str(order.subtotal),
            'delivery_charge': str(order.delivery_charge),
            'total_amount': str(order.total_amount),
            'payment_method': order.payment_method,
            'payment_status': order.payment_status,
            'order_status': order.order_status,
            'message': 'Your order has been placed successfully.',
        }, status=status.HTTP_201_CREATED)


class CustomerOrderListView(generics.ListAPIView):
    """GET /api/v1/orders/my-orders/ — Authenticated customer: list their own orders."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Order.objects
            .filter(user=user)
            .select_related('customer', 'delivery_zone')
            .prefetch_related('items')
            .order_by('-created_at')
        )


class OrderDetailView(generics.RetrieveAPIView):
    """GET /api/v1/orders/<order_number>/ — Get order by order number (public)."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'order_number'
    queryset = Order.objects.all()


class AdminOrderListView(generics.ListAPIView):
    """GET /api/v1/admin/orders/ — Admin: list all orders with search."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [SearchFilter]
    search_fields = ['order_number', 'customer__phone', 'customer__name']

    def get_queryset(self):
        qs = Order.objects.select_related('customer', 'delivery_zone').prefetch_related('items')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(order_status=status_filter)
        return qs.order_by('-created_at')


class AdminOrderDetailView(generics.RetrieveAPIView):
    """GET /api/v1/admin/orders/<order_number>/ — Admin: order detail."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'order_number'
    queryset = Order.objects.select_related('customer', 'delivery_zone').prefetch_related('items')


class AdminOrderStatusUpdateView(generics.UpdateAPIView):
    """PATCH /api/v1/admin/orders/<order_number>/status/ — Admin: update order status."""
    serializer_class = OrderStatusUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'order_number'
    queryset = Order.objects.all()
    http_method_names = ['patch']


class AdminStatsView(APIView):
    """GET /api/v1/admin/stats/ — Full e-commerce analytics for the admin dashboard."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from catalog.models import Product
        from django.db.models.functions import TruncDate, TruncMonth

        now = timezone.now()
        today = now.date()
        last_30 = today - datetime.timedelta(days=30)
        last_7  = today - datetime.timedelta(days=7)

        # ── Order totals ──────────────────────────────────────────────────────
        all_orders = Order.objects.all()
        status_counts = dict(
            all_orders.values('order_status')
            .annotate(c=Count('id'))
            .values_list('order_status', 'c')
        )

        confirmed_statuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
        revenue_qs = all_orders.filter(
            order_status__in=confirmed_statuses
        ).aggregate(
            total=Sum('total_amount'),
            avg_order=Avg('total_amount'),
        )

        today_revenue = (
            all_orders
            .filter(created_at__date=today, order_status__in=confirmed_statuses)
            .aggregate(total=Sum('total_amount'))['total'] or 0
        )

        # ── Products ──────────────────────────────────────────────────────────
        active_products = Product.objects.filter(is_active=True).count()
        out_of_stock    = Product.objects.filter(is_active=True, stock_quantity=0).count()
        low_stock       = Product.objects.filter(is_active=True, stock_quantity__gt=0, stock_quantity__lte=3).count()

        # ── Category-wise sales ───────────────────────────────────────────────
        category_sales = list(
            OrderItem.objects
            .filter(order__order_status__in=confirmed_statuses)
            .values(cat_name=F('product__category__name'), cat_slug=F('product__category__slug'))
            .annotate(
                units_sold=Sum('quantity'),
                revenue=Sum(F('unit_price') * F('quantity')),
                order_count=Count('order', distinct=True),
            )
            .exclude(cat_name=None)
            .order_by('-revenue')
        )

        # ── Top-selling products ──────────────────────────────────────────────
        top_products = list(
            OrderItem.objects
            .filter(order__order_status__in=confirmed_statuses)
            .values('product_name', 'product_id', slug=F('product__slug'))
            .annotate(units_sold=Sum('quantity'), revenue=Sum(F('unit_price') * F('quantity')))
            .order_by('-units_sold')[:10]
        )

        # ── Daily — last 14 days ──────────────────────────────────────────────
        daily = list(
            all_orders
            .filter(created_at__date__gte=today - datetime.timedelta(days=13))
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'), revenue=Sum('total_amount'))
            .order_by('day')
        )

        # ── Monthly — last 6 months ───────────────────────────────────────────
        monthly = list(
            all_orders
            .filter(order_status__in=confirmed_statuses, created_at__date__gte=today - datetime.timedelta(days=180))
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total_amount'), orders=Count('id'))
            .order_by('month')
        )

        # ── Low-stock products ────────────────────────────────────────────────
        low_stock_products = list(
            Product.objects
            .filter(is_active=True, stock_quantity__lte=5)
            .values('id', 'name', 'slug', 'stock_quantity', cat_name=F('category__name'))
            .order_by('stock_quantity')[:8]
        )

        # ── Recent orders ─────────────────────────────────────────────────────
        recent = (
            Order.objects
            .select_related('customer', 'delivery_zone')
            .prefetch_related('items')
            .order_by('-created_at')[:5]
        )

        # ── Restock customer demand ──────────────────────────────────────────
        from catalog.models import RestockNotificationRequest
        restock_demands = list(
            RestockNotificationRequest.objects
            .filter(is_notified=False, product__stock_quantity=0)
            .values('product__id', 'product__name', 'product__slug', 'product__price')
            .annotate(request_count=Count('id'))
            .order_by('-request_count')[:10]
        )

        return Response({
            # KPIs
            'total_orders':      all_orders.count(),
            'today_orders':      all_orders.filter(created_at__date=today).count(),
            'week_orders':       all_orders.filter(created_at__date__gte=last_7).count(),
            'month_orders':      all_orders.filter(created_at__date__gte=last_30).count(),
            'pending_orders':    status_counts.get('PENDING', 0),
            'confirmed_orders':  status_counts.get('CONFIRMED', 0),
            'processing_orders': status_counts.get('PROCESSING', 0),
            'shipped_orders':    status_counts.get('SHIPPED', 0),
            'delivered_orders':  status_counts.get('DELIVERED', 0),
            'cancelled_orders':  status_counts.get('CANCELLED', 0),
            'failed_orders':     status_counts.get('FAILED_DELIVERY', 0),
            'status_breakdown':  status_counts,
            # Revenue
            'total_revenue':     str(revenue_qs['total'] or 0),
            'today_revenue':     str(today_revenue),
            'avg_order_value':   str(revenue_qs['avg_order'] or 0),
            # Products
            'active_products':   active_products,
            'out_of_stock':      out_of_stock,
            'low_stock':         low_stock,
            # Analytics
            'category_sales': [
                {
                    'name': r['cat_name'], 'slug': r['cat_slug'],
                    'units_sold': r['units_sold'] or 0,
                    'revenue': str(r['revenue'] or 0),
                    'order_count': r['order_count'],
                } for r in category_sales
            ],
            'top_products': [
                {
                    'product_id': r['product_id'], 'name': r['product_name'],
                    'slug': r['slug'], 'units_sold': r['units_sold'] or 0,
                    'revenue': str(r['revenue'] or 0),
                } for r in top_products
            ],
            'daily_orders': [
                {
                    'date': r['day'].isoformat() if r['day'] else None,
                    'count': r['count'], 'revenue': str(r['revenue'] or 0),
                } for r in daily
            ],
            'monthly_revenue': [
                {
                    'month': r['month'].strftime('%b %Y') if r['month'] else None,
                    'revenue': str(r['revenue'] or 0), 'orders': r['orders'],
                } for r in monthly
            ],
            'recent_orders':      OrderSerializer(recent, many=True).data,
            'low_stock_products': low_stock_products,
            'restock_demands': [
                {
                    'id': r['product__id'],
                    'name': r['product__name'],
                    'slug': r['product__slug'],
                    'price': str(r['product__price']),
                    'request_count': r['request_count'],
                } for r in restock_demands
            ],
        })
