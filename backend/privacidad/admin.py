from django.contrib import admin
from api.admin import TratamientoRATAdmin, RegistroAuditoriaARCOAdmin
from .models import RATPrivacidad, AuditoriaARCO

admin.site.register(RATPrivacidad, TratamientoRATAdmin)
admin.site.register(AuditoriaARCO, RegistroAuditoriaARCOAdmin)
