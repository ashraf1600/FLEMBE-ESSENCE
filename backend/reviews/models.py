from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from catalog.models import Product


class Review(models.Model):
    class RatingChoices(models.IntegerChoices):
        ONE   = 1, '★☆☆☆☆ — Very Poor'
        TWO   = 2, '★★☆☆☆ — Poor'
        THREE = 3, '★★★☆☆ — Average'
        FOUR  = 4, '★★★★☆ — Good'
        FIVE  = 5, '★★★★★ — Excellent'

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews',
        db_index=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True,
    )
    # Denormalized for display speed (even if user is deleted)
    reviewer_name  = models.CharField(max_length=100)
    reviewer_email = models.EmailField(blank=True)

    rating  = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        choices=RatingChoices.choices,
    )
    title   = models.CharField(max_length=150, blank=True)
    body    = models.TextField()

    # Moderation
    is_approved  = models.BooleanField(default=False, db_index=True,
                                       help_text='Only approved reviews are shown on the storefront.')
    is_featured  = models.BooleanField(default=False,
                                       help_text='Show on homepage / product highlights.')

    # Engagement
    helpful_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        # One review per user per product
        unique_together = [('product', 'user')]

    def __str__(self):
        return f'{self.reviewer_name} — {self.product.name} ({self.rating}★)'
