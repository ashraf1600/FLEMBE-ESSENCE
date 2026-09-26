from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils.text import slugify

from .models import Category, Product, ProductImage
from .serializers import (
    CategorySerializer, ProductSerializer,
    ProductListSerializer, ProductImageSerializer,
)
from .filters import ProductFilter


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        # Detail / write actions need to reach any category (including children)
        # so child category slugs don't 404.
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return Category.objects.prefetch_related('children').all()
        if self.request.query_params.get('all'):
            return Category.objects.prefetch_related('children').all()
        # List shows only active root categories; children are nested via serializer
        return (
            Category.objects
            .filter(parent=None, is_active=True)
            .prefetch_related('children')
        )

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name', '')
        slug = slugify(name)
        serializer.save(slug=slug)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'material', 'sku']
    ordering_fields = ['price', 'created_at', 'name', 'stock_quantity']
    ordering = ['-created_at']
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Product.objects.select_related('category').prefetch_related('images')
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name', '')
        slug = slugify(name)
        serializer.save(slug=slug)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser],
            permission_classes=[permissions.IsAdminUser])
    def upload_image(self, request, slug=None):
        product = self.get_object()
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)

        is_primary = request.data.get('is_primary', 'false').lower() == 'true'
        alt_text = request.data.get('alt_text', product.name)
        display_order = int(request.data.get('display_order', 0))

        # If setting as primary, clear other primaries
        if is_primary:
            product.images.update(is_primary=False)

        img = ProductImage.objects.create(
            product=product,
            image_file=image_file,
            alt_text=alt_text,
            is_primary=is_primary,
            display_order=display_order,
        )
        return Response(ProductImageSerializer(img, context={'request': request}).data,
                        status=status.HTTP_201_CREATED)
