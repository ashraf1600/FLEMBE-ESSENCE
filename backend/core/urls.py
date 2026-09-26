from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# ── Brand the built-in Django admin ──────────────────────────────────────
admin.site.site_header  = 'Flembe Essence'
admin.site.site_title   = 'Flembe Essence Admin'
admin.site.index_title  = 'Store Management'
urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # App APIs
    path('api/v1/', include('catalog.urls')),
    path('api/v1/', include('orders.urls')),
    path('api/v1/', include('delivery.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
