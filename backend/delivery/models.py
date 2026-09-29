from django.db import models


class DeliveryZone(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=255, blank=True)
    delivery_charge = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_free = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['city', 'name']

    def __str__(self):
        return f"{self.name} ({self.city})"

    def save(self, *args, **kwargs):
        # Ensure free zones have 0 delivery charge; if charge > 0, is_free is False
        if self.is_free:
            self.delivery_charge = 0
        elif self.delivery_charge and float(self.delivery_charge) > 0:
            self.is_free = False
        super().save(*args, **kwargs)
