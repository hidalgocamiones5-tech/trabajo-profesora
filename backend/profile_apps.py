import os
import django
import time
from importlib import import_module

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

print("Loading apps individually...")
from django.conf import settings
for app in settings.INSTALLED_APPS:
    t0 = time.time()
    try:
        import_module(app)
        t1 = time.time()
        print(f"App {app} loaded in {t1 - t0:.3f}s")
    except Exception as e:
        print(f"App {app} failed: {e}")

t0 = time.time()
django.setup()
t1 = time.time()
print(f"django.setup() took {t1 - t0:.3f}s")
