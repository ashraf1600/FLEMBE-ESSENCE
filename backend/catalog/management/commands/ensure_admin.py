from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decouple import config


class Command(BaseCommand):
    help = 'Ensure default admin and promote Nehal to superuser/staff'

    def handle(self, *args, **options):
        # 1. Promote 'Nehal' if exists, or create if not
        nehal = User.objects.filter(username__iexact='nehal').first()
        if nehal:
            nehal.is_staff = True
            nehal.is_superuser = True
            nehal.is_active = True
            nehal.save()
            self.stdout.write(self.style.SUCCESS(f"Promoted existing user '{nehal.username}' to Superuser/Admin."))
        else:
            default_pw = config('DJANGO_SUPERUSER_PASSWORD', default='Admin@12345')
            nehal = User.objects.create_superuser(
                username='Nehal',
                email='nehal@flembeessence.com',
                password=default_pw,
                first_name='Nehal'
            )
            self.stdout.write(self.style.SUCCESS(f"Created new superuser 'Nehal' with password: {default_pw}"))

        # 2. Also ensure 'admin' superuser exists
        admin_user = User.objects.filter(username__iexact='admin').first()
        if not admin_user:
            default_pw = config('DJANGO_SUPERUSER_PASSWORD', default='Admin@12345')
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@flembeessence.com',
                password=default_pw,
                first_name='Administrator'
            )
            self.stdout.write(self.style.SUCCESS(f"Created new superuser 'admin' with password: {default_pw}"))
        else:
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.is_active = True
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("User 'admin' is verified as superuser/staff."))
