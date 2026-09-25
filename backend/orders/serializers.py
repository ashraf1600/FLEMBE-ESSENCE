from rest_framework import serializers
from django.db import transaction
from django.utils import timezone

from .models import Customer, Order, OrderItem
from catalog.models import Product
from delivery.models import DeliveryZone


class CustomerSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20)


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=100)


class OrderCreateSerializer(serializers.Serializer):
    customer = CustomerSerializer()
    address = serializers.CharField()
    delivery_zone_id = serializers.IntegerField()
    items = OrderItemInputSerializer(many=True, min_length=1)
    customer_note = serializers.CharField(allow_blank=True, default='')
    policy_accepted = serializers.BooleanField()

    def validate_policy_accepted(self, value):
        if not value:
            raise serializers.ValidationError('You must accept the COD and No Return/Exchange policy.')
        return value

    def validate_delivery_zone_id(self, value):
        try:
            zone = DeliveryZone.objects.get(id=value, is_active=True)
        except DeliveryZone.DoesNotExist:
            raise serializers.ValidationError('Invalid or inactive delivery zone.')
        return value

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError('At least one item is required.')
        return items

    def _generate_order_number(self):
        today = timezone.now().strftime('%Y%m%d')
        prefix = f'FE-{today}-'
        last_order = Order.objects.filter(order_number__startswith=prefix).order_by('-order_number').first()
        if last_order:
            last_seq = int(last_order.order_number.split('-')[-1])
            new_seq = last_seq + 1
        else:
            new_seq = 1
        return f"{prefix}{new_seq:03d}"

    @transaction.atomic
    def create(self, validated_data):
        customer_data = validated_data['customer']
        address = validated_data['address']
        delivery_zone_id = validated_data['delivery_zone_id']
        items_data = validated_data['items']
        customer_note = validated_data.get('customer_note', '')
        policy_accepted = validated_data['policy_accepted']

        # Get or create customer by phone
        customer, _ = Customer.objects.get_or_create(
            phone=customer_data['phone'],
            defaults={'name': customer_data['name']},
        )
        # Update name if it changed
        if customer.name != customer_data['name']:
            customer.name = customer_data['name']
            customer.save(update_fields=['name'])

        delivery_zone = DeliveryZone.objects.get(id=delivery_zone_id, is_active=True)

        # Validate and lock products
        order_items = []
        subtotal = 0

        for item_data in items_data:
            product_id = item_data['product_id']
            quantity = item_data['quantity']

            # Lock row to prevent overselling
            try:
                product = Product.objects.select_for_update().get(id=product_id, is_active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError({
                    'items': f'Product ID {product_id} is unavailable or inactive.'
                })

            if product.stock_quantity < quantity:
                raise serializers.ValidationError({
                    'items': f'Insufficient stock for "{product.name}". Only {product.stock_quantity} available.'
                })

            item_subtotal = product.price * quantity
            subtotal += item_subtotal
            order_items.append({
                'product': product,
                'product_name': product.name,
                'unit_price': product.price,
                'quantity': quantity,
                'subtotal': item_subtotal,
            })

        # Calculate totals server-side
        delivery_charge = delivery_zone.delivery_charge
        total_amount = subtotal + delivery_charge

        # Generate unique order number
        order_number = self._generate_order_number()

        # Create order
        order = Order.objects.create(
            order_number=order_number,
            customer=customer,
            delivery_zone=delivery_zone,
            address=address,
            subtotal=subtotal,
            delivery_charge=delivery_charge,
            total_amount=total_amount,
            payment_method=Order.PaymentMethod.COD,
            payment_status=Order.PaymentStatus.UNPAID,
            order_status=Order.OrderStatus.PENDING,
            policy_accepted=policy_accepted,
            customer_note=customer_note,
        )

        # Create order items and deduct stock
        for item in order_items:
            product = item.pop('product')
            OrderItem.objects.create(order=order, product=product, **item)
            # Deduct stock
            product.stock_quantity -= item['quantity']
            product.save(update_fields=['stock_quantity'])

        return order


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'unit_price', 'quantity', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    delivery_zone_name = serializers.CharField(source='delivery_zone.name', read_only=True)
    delivery_zone_city = serializers.CharField(source='delivery_zone.city', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_phone',
            'delivery_zone_name', 'delivery_zone_city', 'address',
            'subtotal', 'delivery_charge', 'total_amount',
            'payment_method', 'payment_status', 'order_status',
            'policy_accepted', 'customer_note',
            'items', 'created_at', 'updated_at',
        ]


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['order_status']

    def validate_order_status(self, value):
        valid = [c[0] for c in Order.OrderStatus.choices]
        if value not in valid:
            raise serializers.ValidationError(f'Invalid status. Valid options: {valid}')
        return value
