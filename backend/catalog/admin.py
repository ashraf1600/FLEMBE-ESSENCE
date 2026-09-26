from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product, ProductImage


# ─── Inline ──────────────────────────────────────────────────────────────────

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 2
    fields = ['image_file', 'image_url', 'alt_text', 'is_primary', 'display_order']
    verbose_name = "Photo"
    verbose_name_plural = "📸  Product Photos"
    show_change_link = False


# ─── Category ─────────────────────────────────────────────────────────────────

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display   = ['name', 'parent_name', 'product_count', 'active_badge']
    list_filter    = ['is_active', 'parent']
    search_fields  = ['name', 'description']
    readonly_fields = ['slug', 'created_at', 'updated_at']
    ordering       = ['name']

    fieldsets = (
        ('Category Details', {
            'description': (
                'A category groups similar products together — for example "Rings" or "Earrings". '
                'You can also create a parent category like "Jewellery" that contains smaller ones.'
            ),
            'fields': ('name', 'description', 'parent', 'image'),
        }),
        ('Visibility', {
            'description': 'Uncheck "Visible to customers" to hide this category from your shop.',
            'fields': ('is_active',),
        }),
        ('System (do not change)', {
            'fields': ('slug', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    # ── Custom columns ────────────────────────────────────────────────────────

    def parent_name(self, obj):
        if obj.parent:
            return obj.parent.name
        return format_html('<span style="color:#aaa;font-style:italic;">Top-level</span>')
    parent_name.short_description = 'Under Category'

    def product_count(self, obj):
        count = obj.products.filter(is_active=True).count()
        color = '#4B1D3F' if count > 0 else '#aaa'
        return format_html(
            '<strong style="color:{};font-size:15px;">{}</strong>', color, count
        )
    product_count.short_description = '# Products'

    def active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background:#ecfdf5;color:#059669;padding:3px 12px;'
                'font-size:11px;font-weight:700;letter-spacing:.05em;">✓ VISIBLE</span>'
            )
        return format_html(
            '<span style="background:#f3f4f6;color:#9ca3af;padding:3px 12px;'
            'font-size:11px;font-weight:700;letter-spacing:.05em;">○ HIDDEN</span>'
        )
    active_badge.short_description = 'Customers Can See?'


# ─── Product ──────────────────────────────────────────────────────────────────

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display       = ['product_thumbnail', 'name', 'category', 'formatted_price', 'stock_badge', 'active_badge']
    list_display_links = ['product_thumbnail', 'name']
    list_filter        = ['is_active', 'category']
    search_fields      = ['name', 'sku', 'description', 'material']
    readonly_fields    = ['slug', 'stock_status', 'created_at', 'updated_at']
    date_hierarchy     = 'created_at'
    inlines            = [ProductImageInline]
    save_on_top        = True
    list_per_page      = 25

    fieldsets = (
        ('What is this product?', {
            'description': 'This information is shown to your customers on the website.',
            'fields': ('name', 'category', 'description', 'material'),
        }),
        ('Price & Stock', {
            'description': '⚠️  Price is in Taka (৳). Stock is how many pieces you currently have available.',
            'fields': ('price', 'stock_quantity', 'sku'),
        }),
        ('Visibility', {
            'description': 'Uncheck "Show on website" to temporarily hide a product without deleting it.',
            'fields': ('is_active',),
        }),
        ('System Info (do not change)', {
            'fields': ('slug', 'stock_status', 'created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'These are managed automatically.',
        }),
    )

    # ── Custom columns ────────────────────────────────────────────────────────

    def product_thumbnail(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary:
            url = primary.image_file.url if primary.image_file else primary.image_url
            if url:
                return format_html(
                    '<img src="{}" style="width:52px;height:52px;object-fit:cover;'
                    'border-radius:3px;border:1px solid #D5C4A8;" />',
                    url,
                )
        return format_html(
            '<div style="width:52px;height:52px;background:#E8D9C1;display:flex;'
            'align-items:center;justify-content:center;color:#4B1D3F;font-size:20px;'
            'font-weight:bold;border-radius:3px;">F</div>'
        )
    product_thumbnail.short_description = 'Photo'

    def formatted_price(self, obj):
        return format_html('<strong style="color:#4B1D3F;font-size:14px;">৳{}</strong>', f'{obj.price:,.0f}')
    formatted_price.short_description = 'Price'
    formatted_price.admin_order_field = 'price'

    def stock_badge(self, obj):
        q = obj.stock_quantity
        if q == 0:
            return format_html(
                '<span style="background:#fef2f2;color:#dc2626;padding:4px 10px;'
                'font-size:11px;font-weight:700;">❌  OUT OF STOCK</span>'
            )
        if q <= 3:
            return format_html(
                '<span style="background:#fffbeb;color:#b45309;padding:4px 10px;'
                'font-size:11px;font-weight:700;">⚠️  ONLY {} LEFT</span>', q
            )
        return format_html(
            '<span style="background:#ecfdf5;color:#059669;padding:4px 10px;'
            'font-size:11px;font-weight:700;">✓  {} in stock</span>', q
        )
    stock_badge.short_description = 'Stock'
    stock_badge.admin_order_field = 'stock_quantity'

    def active_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="color:#059669;font-weight:700;">✓  Live</span>')
        return format_html('<span style="color:#aaa;">○  Hidden</span>')
    active_badge.short_description = 'On Website?'
    active_badge.admin_order_field = 'is_active'


# ─── Product Image ────────────────────────────────────────────────────────────

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display  = ['image_preview', 'product', 'primary_badge', 'display_order']
    list_filter   = ['is_primary']
    search_fields = ['product__name', 'alt_text']
    ordering      = ['product', 'display_order']

    def image_preview(self, obj):
        url = obj.image_file.url if obj.image_file else obj.image_url
        if url:
            return format_html(
                '<img src="{}" style="width:64px;height:64px;object-fit:cover;border-radius:3px;" />',
                url,
            )
        return '—'
    image_preview.short_description = 'Preview'

    def primary_badge(self, obj):
        if obj.is_primary:
            return format_html(
                '<span style="background:#4B1D3F;color:#E8D9C1;padding:2px 10px;font-size:11px;font-weight:700;">MAIN</span>'
            )
        return '—'
    primary_badge.short_description = 'Main Photo?'
