from django.db import models
from django.conf import settings
from catalog.models import Product
from delivery.models import DeliveryZone


class Customer(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.phone})"


class Order(models.Model):
    class OrderStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        PROCESSING = 'PROCESSING', 'Processing'
        SHIPPED = 'SHIPPED', 'Shipped'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'
        FAILED_DELIVERY = 'FAILED_DELIVERY', 'Failed Delivery'

    class PaymentStatus(models.TextChoices):
        UNPAID = 'UNPAID', 'Unpaid'
        PAID = 'PAID', 'Paid'

    class PaymentMethod(models.TextChoices):
        COD = 'COD', 'Cash on Delivery'

    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
    )
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='orders')
    delivery_zone = models.ForeignKey(DeliveryZone, on_delete=models.PROTECT, related_name='orders')
    address = models.TextField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_charge = models.DecimalField(max_digits=8, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.COD)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    order_status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        db_index=True,
    )
    policy_accepted = models.BooleanField(default=False)
    customer_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.order_number

    def save(self, *args, **kwargs):
        if self.pk:
            old_order = Order.objects.filter(pk=self.pk).only('order_status').first()
            if old_order and old_order.order_status != self.order_status:
                self._handle_stock_transition(old_order.order_status, self.order_status)
        super().save(*args, **kwargs)

    def _handle_stock_transition(self, old_status, new_status):
        active_statuses = {
            self.OrderStatus.PENDING,
            self.OrderStatus.CONFIRMED,
            self.OrderStatus.PROCESSING,
            self.OrderStatus.SHIPPED,
            self.OrderStatus.DELIVERED,
        }
        releasing_statuses = {
            self.OrderStatus.CANCELLED,
            self.OrderStatus.FAILED_DELIVERY,
        }

        # Transition from active to cancelled/failed: replenish product stock
        if old_status in active_statuses and new_status in releasing_statuses:
            for item in self.items.select_related('product').all():
                if item.product_id:
                    Product.objects.filter(pk=item.product_id).update(
                        stock_quantity=models.F('stock_quantity') + item.quantity
                    )

        # Transition from cancelled/failed back to active: re-deduct stock
        elif old_status in releasing_statuses and new_status in active_statuses:
            for item in self.items.select_related('product').all():
                if item.product_id:
                    Product.objects.filter(pk=item.product_id).update(
                        stock_quantity=models.Case(
                            models.When(stock_quantity__gte=item.quantity, then=models.F('stock_quantity') - item.quantity),
                            default=0,
                            output_field=models.PositiveIntegerField(),
                        )
                    )


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='order_items')
    # Snapshot fields to preserve historical accuracy
    product_name = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"

    def save(self, *args, **kwargs):
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)
