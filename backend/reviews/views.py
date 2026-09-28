from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Review
from .serializers import (
    ReviewPublicSerializer, ReviewCreateSerializer,
    ReviewAdminSerializer,
)


# ── Public views ──────────────────────────────────────────────────────────────

class ProductReviewListView(APIView):
    """GET /api/v1/products/<slug>/reviews/ — Public approved reviews for a product with rating statistics."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        from django.db.models import Avg, Count
        reviews_qs = Review.objects.filter(
            product__slug=slug, is_approved=True
        ).order_by('-helpful_count', '-created_at')

        total_reviews = reviews_qs.count()
        avg_rating = reviews_qs.aggregate(avg=Avg('rating'))['avg'] or 0.0

        rating_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for item in reviews_qs.values('rating').annotate(c=Count('id')):
            rating_counts[item['rating']] = item['c']

        serializer = ReviewPublicSerializer(reviews_qs, many=True)
        return Response({
            'stats': {
                'total_reviews': total_reviews,
                'average_rating': round(float(avg_rating), 1),
                'rating_counts': rating_counts,
            },
            'results': serializer.data,
        })


class ReviewCreateView(generics.CreateAPIView):
    """POST /api/v1/reviews/ — Submit a review (customer or authenticated user)."""
    serializer_class   = ReviewCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data['product']
        user = request.user if getattr(request, 'user', None) and request.user.is_authenticated else None
        reviewer_name = serializer.validated_data.get('reviewer_name', '').strip()
        reviewer_email = serializer.validated_data.get('reviewer_email', '').strip()

        if not reviewer_name and not user:
            return Response(
                {'reviewer_name': ['Please provide your name.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Duplicate check:
        if user and Review.objects.filter(product=product, user=user).exists():
            return Response(
                {'detail': 'You have already submitted a review for this product.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        elif reviewer_email and Review.objects.filter(product=product, reviewer_email__iexact=reviewer_email).exists():
            return Response(
                {'detail': 'A review from this email address has already been submitted for this product.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save review as pending approval for moderation
        review = serializer.save(user=user, is_approved=False)
        return Response(
            {
                'message': 'Thank you! Your review has been submitted and will appear once approved.',
                'review': ReviewPublicSerializer(review).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ReviewHelpfulView(APIView):
    """POST /api/v1/reviews/<pk>/helpful/ — Mark a review as helpful."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            review = Review.objects.get(pk=pk, is_approved=True)
        except Review.DoesNotExist:
            return Response({'detail': 'Review not found.'}, status=status.HTTP_404_NOT_FOUND)
        review.helpful_count += 1
        review.save(update_fields=['helpful_count'])
        return Response({'helpful_count': review.helpful_count})


# ── Admin views ───────────────────────────────────────────────────────────────

class AdminReviewListView(generics.ListAPIView):
    """GET /api/v1/admin/reviews/ — Admin: list all reviews with filters."""
    serializer_class   = ReviewAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['is_approved', 'is_featured', 'rating']
    search_fields      = ['reviewer_name', 'body', 'title', 'product__name']
    ordering_fields    = ['created_at', 'rating', 'helpful_count']
    ordering           = ['-created_at']

    def get_queryset(self):
        return Review.objects.select_related('product', 'user').all()


class AdminReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/v1/admin/reviews/<pk>/ — Admin: review detail."""
    serializer_class   = ReviewAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset           = Review.objects.select_related('product', 'user').all()


class AdminReviewApproveView(APIView):
    """POST /api/v1/admin/reviews/<pk>/approve/ — Toggle approval."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        review.is_approved = not review.is_approved
        review.save(update_fields=['is_approved'])
        return Response({'is_approved': review.is_approved})


class AdminReviewFeatureView(APIView):
    """POST /api/v1/admin/reviews/<pk>/feature/ — Toggle featured."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        review.is_featured = not review.is_featured
        review.save(update_fields=['is_featured'])
        return Response({'is_featured': review.is_featured})
