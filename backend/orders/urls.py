from django.urls import path
from .views import (
    OrderCreateView, OrderDetailView,
    AdminOrderListView, AdminOrderDetailView,
    AdminOrderStatusUpdateView,
)

urlpatterns = [
    path('orders/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<str:order_number>/', OrderDetailView.as_view(), name='order-detail'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/orders/<str:order_number>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('admin/orders/<str:order_number>/status/', AdminOrderStatusUpdateView.as_view(), name='admin-order-status'),
]
