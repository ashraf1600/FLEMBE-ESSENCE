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
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'material', 'sku']
    ordering_fields = ['price', 'created_at', 'name', 'stock_quantity']
    ordering = ['-created_at']
    lookup_field = 'slug'

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name', '')
        slug = slugify(name)
        product = serializer.save(slug=slug)

        # Handle multiple uploaded image files
        uploaded_files = self.request.FILES.getlist('images')
        if not uploaded_files and 'image' in self.request.FILES:
            uploaded_files = self.request.FILES.getlist('image')

        for idx, file_obj in enumerate(uploaded_files):
            ProductImage.objects.create(
                product=product,
                image_file=file_obj,
                alt_text=f"{product.name} - {idx + 1}",
                is_primary=(idx == 0),
                display_order=idx,
            )

        # Fallback to image_url if provided and no files uploaded
        image_url = self.request.data.get('image_url', '').strip()
        if image_url and not uploaded_files:
            ProductImage.objects.create(
                product=product,
                image_url=image_url,
                alt_text=product.name,
                is_primary=True,
            )

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'upload_image', 'delete_image']:
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

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser],
            permission_classes=[permissions.IsAdminUser])
    def upload_image(self, request, slug=None):
        product = self.get_object()
        image_files = request.FILES.getlist('images') or request.FILES.getlist('image')
        if not image_files:
            return Response({'error': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        created_images = []
        is_first = not product.images.filter(is_primary=True).exists()
        current_max = product.images.count()

        for idx, file_obj in enumerate(image_files):
            img = ProductImage.objects.create(
                product=product,
                image_file=file_obj,
                alt_text=f"{product.name} - {current_max + idx + 1}",
                is_primary=True if (is_first and idx == 0) else False,
                display_order=current_max + idx,
            )
            created_images.append(img)

        return Response(
            ProductImageSerializer(created_images, many=True, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)',
            permission_classes=[permissions.IsAdminUser])
    def delete_image(self, request, slug=None, image_id=None):
        product = self.get_object()
        try:
            img = product.images.get(pk=image_id)
            img.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image not found.'}, status=status.HTTP_404_NOT_FOUND)
