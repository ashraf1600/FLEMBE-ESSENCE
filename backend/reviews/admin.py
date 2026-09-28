from django.contrib import admin
from django.utils.html import format_html
from .models import Review


STAR_COLORS = {1: '#dc2626', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#059669'}

STAR_HTML = {
    1: '★☆☆☆☆',
    2: '★★☆☆☆',
    3: '★★★☆☆',
    4: '★★★★☆',
    5: '★★★★★',
}


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = [
        'rating_stars', 'reviewer_name', 'product_link',
        'short_body', 'approval_badge', 'featured_badge',
        'helpful_count', 'created_at',
    ]
    list_display_links = ['reviewer_name']
    list_filter        = ['is_approved', 'is_featured', 'rating', 'created_at']
    search_fields      = ['reviewer_name', 'reviewer_email', 'body', 'title', 'product__name']
    readonly_fields    = ['user', 'helpful_count', 'created_at', 'updated_at']
    date_hierarchy     = 'created_at'
    ordering           = ['-created_at']
    list_per_page      = 25
    actions            = ['approve_reviews', 'reject_reviews', 'feature_reviews']

    fieldsets = (
        ('Review Content', {
            'fields': ('product', 'reviewer_name', 'reviewer_email', 'user', 'rating', 'title', 'body'),
        }),
        ('Moderation', {
            'description': 'Approved reviews appear on the storefront. Featured reviews may appear on the homepage.',
            'fields': ('is_approved', 'is_featured'),
        }),
        ('Engagement', {
            'fields': ('helpful_count', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    # ── Custom columns ────────────────────────────────────────────────────────

    def rating_stars(self, obj):
        color = STAR_COLORS.get(obj.rating, '#6b7280')
        stars = STAR_HTML.get(obj.rating, '?')
        return format_html(
            '<span style="color:{};font-size:14px;font-weight:700;letter-spacing:1px;">{}</span>',
            color, stars,
        )
    rating_stars.short_description = 'Rating'
    rating_stars.admin_order_field = 'rating'

    def product_link(self, obj):
        return format_html(
            '<a href="/admin/catalog/product/{}/change/" style="color:#4B1D3F;font-weight:600;text-decoration:none;">{}</a>',
            obj.product.id, obj.product.name,
        )
    product_link.short_description = 'Product'

    def short_body(self, obj):
        body = obj.body[:80] + '…' if len(obj.body) > 80 else obj.body
        return format_html('<span style="color:#374151;font-size:12px;">{}</span>', body)
    short_body.short_description = 'Review'

    def approval_badge(self, obj):
        if obj.is_approved:
            return format_html(
                '<span style="background:#ecfdf5;color:#059669;padding:3px 10px;border-radius:9999px;'
                'font-size:11px;font-weight:700;display:inline-block;border:1px solid #a7f3d0;">✓ APPROVED</span>'
            )
        return format_html(
            '<span style="background:#fef3c7;color:#b45309;padding:3px 10px;border-radius:9999px;'
            'font-size:11px;font-weight:700;display:inline-block;border:1px solid #fde68a;">⏳ PENDING</span>'
        )
    approval_badge.short_description = 'Status'
    approval_badge.admin_order_field = 'is_approved'

    def featured_badge(self, obj):
        if obj.is_featured:
            return format_html(
                '<span style="background:#fef9c3;color:#854d0e;padding:3px 10px;border-radius:9999px;'
                'font-size:11px;font-weight:700;display:inline-block;border:1px solid #fef08a;">⭐ FEATURED</span>'
            )
        return format_html('<span style="color:#9ca3af;font-size:12px;">—</span>')
    featured_badge.short_description = 'Featured'

    # ── Bulk actions ──────────────────────────────────────────────────────────

    @admin.action(description='✓ Approve selected reviews')
    def approve_reviews(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} review(s) approved and now visible on the storefront.')

    @admin.action(description='✗ Reject / hide selected reviews')
    def reject_reviews(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} review(s) hidden from the storefront.')

    @admin.action(description='⭐ Feature selected reviews')
    def feature_reviews(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} review(s) marked as featured.')
