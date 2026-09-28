from django.urls import path
from .views import (
    ProductReviewListView, ReviewCreateView, ReviewHelpfulView,
    AdminReviewListView, AdminReviewDetailView,
    AdminReviewApproveView, AdminReviewFeatureView,
)

urlpatterns = [
    # Public
    path('products/<slug:slug>/reviews/', ProductReviewListView.as_view(), name='product-reviews'),
    path('reviews/', ReviewCreateView.as_view(), name='review-create'),
    path('reviews/<int:pk>/helpful/', ReviewHelpfulView.as_view(), name='review-helpful'),
    # Admin
    path('admin/reviews/', AdminReviewListView.as_view(), name='admin-review-list'),
    path('admin/reviews/<int:pk>/', AdminReviewDetailView.as_view(), name='admin-review-detail'),
    path('admin/reviews/<int:pk>/approve/', AdminReviewApproveView.as_view(), name='admin-review-approve'),
    path('admin/reviews/<int:pk>/feature/', AdminReviewFeatureView.as_view(), name='admin-review-feature'),
]
