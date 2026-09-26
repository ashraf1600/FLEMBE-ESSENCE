from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from core.auth_views import CustomTokenObtainPairView, RegisterView, CurrentUserView, ChangePasswordView

# ── Brand the built-in Django admin ──────────────────────────────────────
admin.site.site_header  = 'Flembe Essence'
admin.site.site_title   = 'Flembe Essence Admin'
admin.site.index_title  = 'Store Management'

urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth
    path('api/v1/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/register/', RegisterView.as_view(), name='register'),
    path('api/v1/auth/me/', CurrentUserView.as_view(), name='current_user'),
    path('api/v1/auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # App APIs
    path('api/v1/', include('catalog.urls')),
    path('api/v1/', include('orders.urls')),
    path('api/v1/', include('delivery.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
