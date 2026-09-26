from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from orders.models import Customer


def get_user_profile(user):
    phone = ''
    # First check orders placed by this user
    last_order = user.orders.order_by('-created_at').first()
    if last_order and last_order.customer and last_order.customer.phone:
        phone = last_order.customer.phone
    else:
        customer = Customer.objects.filter(name=user.get_full_name() or user.username).first()
        if customer:
            phone = customer.phone

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'name': user.get_full_name() or user.first_name or user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'phone': phone,
        'orders_count': user.orders.count(),
        'date_joined': user.date_joined.strftime('%b %d, %Y') if user.date_joined else '',
    }


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = get_user_profile(self.user)
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    name = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')

    def validate_username(self, value):
        val = value.strip()
        if User.objects.filter(username__iexact=val).exists():
            raise serializers.ValidationError('This username is already taken.')
        return val

    def validate_email(self, value):
        val = value.strip().lower()
        if User.objects.filter(email__iexact=val).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return val

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        username = validated_data['username']
        email = validated_data['email']
        password = validated_data['password']
        name = validated_data.get('name', '').strip()
        phone = validated_data.get('phone', '').strip()

        # Split name into first_name and last_name if possible
        parts = name.split(None, 1)
        first_name = parts[0] if parts else username
        last_name = parts[1] if len(parts) > 1 else ''

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        if phone:
            Customer.objects.get_or_create(
                phone=phone,
                defaults={'name': name or username}
            )

        return user


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': get_user_profile(user),
            'message': 'Account registered successfully.',
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(get_user_profile(request.user))

    def patch(self, request):
        user = request.user
        data = request.data

        if 'name' in data:
            name = data['name'].strip()
            if name:
                parts = name.split(None, 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ''

        if 'email' in data:
            new_email = data['email'].strip().lower()
            if new_email and new_email != user.email:
                if User.objects.filter(email__iexact=new_email).exclude(pk=user.pk).exists():
                    return Response({'email': ['Email is already in use by another account.']}, status=status.HTTP_400_BAD_REQUEST)
                user.email = new_email

        user.save()

        # If phone provided, associate or update Customer record
        if 'phone' in data:
            phone = data['phone'].strip()
            if phone:
                cust, _ = Customer.objects.get_or_create(
                    phone=phone,
                    defaults={'name': user.get_full_name() or user.username}
                )
                cust.name = user.get_full_name() or user.username
                cust.save()

        return Response(get_user_profile(user))


class ChangePasswordView(APIView):
    """POST /api/v1/auth/change-password/ — Change account password securely."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

        if not current_password or not new_password:
            return Response(
                {'error': 'Both current password and new password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password does not match.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user=user)
        except Exception as e:
            msg = list(e.messages) if hasattr(e, 'messages') else [str(e)]
            return Response({'error': msg[0]}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password has been updated successfully.'})
