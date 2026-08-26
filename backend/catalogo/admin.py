from django.contrib import admin
from api.admin import NormativaAdmin
from .models import NormativaCatalogo

admin.site.register(NormativaCatalogo, NormativaAdmin)
