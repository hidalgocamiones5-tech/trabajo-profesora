import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# User 'empleado'
user, created = User.objects.get_or_create(username='empleado')
user.set_password('empleado123')
user.save()

# User 'admin'
admin_user, admin_created = User.objects.get_or_create(username='admin', defaults={'is_superuser': True, 'is_staff': True})
admin_user.set_password('admin123')
admin_user.save()

print("Usuarios 'empleado' y 'admin' listos para usarse.")
