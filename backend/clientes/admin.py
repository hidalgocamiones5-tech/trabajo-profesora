from django.contrib import admin
from api.admin import EmpresaAdmin
from .models import EmpresaCliente

admin.site.register(EmpresaCliente, EmpresaAdmin)
