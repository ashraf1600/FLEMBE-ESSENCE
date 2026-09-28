from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """Full review — used for detail and admin list."""
    rating_display = serializers.CharField(source='get_rating_display', read_only=True)

    class Meta:
        model  = Review
        fields = [
            'id', 'product', 'product_id',
            'user', 'reviewer_name', 'reviewer_email',
            'rating', 'rating_display', 'title', 'body',
            'is_approved', 'is_featured', 'helpful_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'helpful_count', 'created_at', 'updated_at']

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Used by customers to submit a review."""

    class Meta:
        model  = Review
        fields = ['product', 'rating', 'title', 'body', 'reviewer_name', 'reviewer_email']

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        user = validated_data.get('user')
        if not user and request and getattr(request, 'user', None) and request.user.is_authenticated:
            user = request.user

        if user and not validated_data.get('reviewer_name'):
            validated_data['reviewer_name'] = (
                user.get_full_name() or user.username
            )
        if user and not validated_data.get('reviewer_email'):
            validated_data['reviewer_email'] = user.email or ''

        validated_data['user'] = user
        return super().create(validated_data)


class ReviewPublicSerializer(serializers.ModelSerializer):
    """Lightweight serializer — public storefront list (only approved)."""

    class Meta:
        model  = Review
        fields = [
            'id', 'reviewer_name', 'rating', 'title', 'body',
            'helpful_count', 'created_at',
        ]


class ReviewAdminSerializer(serializers.ModelSerializer):
    """Admin operations — includes moderation fields."""
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model  = Review
        fields = [
            'id', 'product', 'product_name',
            'reviewer_name', 'reviewer_email', 'user',
            'rating', 'title', 'body',
            'is_approved', 'is_featured', 'helpful_count',
            'created_at',
        ]
        read_only_fields = ['id', 'helpful_count', 'created_at']
