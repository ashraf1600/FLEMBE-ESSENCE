from rest_framework import serializers
from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'parent', 'children', 'is_active', 'created_at']
        read_only_fields = ['slug', 'created_at']

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategorySerializer(children, many=True, context=self.context).data


class CategoryMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'url', 'image_url', 'alt_text', 'is_primary', 'display_order']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.image_file:
            url = obj.image_file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return obj.image_url


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category = CategoryMinSerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True,
    )
    stock_status = serializers.ReadOnlyField()
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'material',
            'price', 'stock_quantity', 'stock_status', 'sku',
            'category', 'category_id', 'is_active',
            'images', 'primary_image', 'created_at', 'updated_at',
        ]
        read_only_fields = ['slug', 'stock_status', 'created_at', 'updated_at']

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        if primary:
            return ProductImageSerializer(primary, context=self.context).data
        return None


class ProductListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    stock_status = serializers.ReadOnlyField()
    category = CategoryMinSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'material', 'price', 'stock_quantity',
            'stock_status', 'category', 'primary_image', 'is_active',
        ]

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        if primary:
            return ProductImageSerializer(primary, context=self.context).data
        return None
