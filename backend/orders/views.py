from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter

from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer, OrderStatusUpdateSerializer


class OrderCreateView(generics.CreateAPIView):
    """POST /api/v1/orders/ — Place a new COD order (public)."""
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
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
        return qs


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
