from django.contrib import admin
from api.admin import SolicitudTicketAdmin, IncidenteAdmin, RiesgoAdmin
from .models import TicketSoporte, IncidenteSoporte, RiesgoSoporte

admin.site.register(TicketSoporte, SolicitudTicketAdmin)
admin.site.register(IncidenteSoporte, IncidenteAdmin)
admin.site.register(RiesgoSoporte, RiesgoAdmin)
