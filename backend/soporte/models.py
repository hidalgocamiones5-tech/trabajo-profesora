from api.models import SolicitudTicket, Incidente, Riesgo

class TicketSoporte(SolicitudTicket):
    class Meta:
        proxy = True
        verbose_name = 'Ticket de Soporte'
        verbose_name_plural = 'Tickets de Soporte'

class IncidenteSoporte(Incidente):
    class Meta:
        proxy = True
        verbose_name = 'Incidente Reportado'
        verbose_name_plural = 'Incidentes Operativos'

class RiesgoSoporte(Riesgo):
    class Meta:
        proxy = True
        verbose_name = 'Matriz de Riesgo'
        verbose_name_plural = 'Gestión de Riesgos'
