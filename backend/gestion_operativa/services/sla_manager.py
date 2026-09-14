import datetime
from django.utils import timezone

def add_business_days(start_date: datetime.date, days_to_add: int) -> datetime.date:
    """Añade días hábiles saltando sábados y domingos (simplificado)."""
    current_date = start_date
    while days_to_add > 0:
        current_date += datetime.timedelta(days=1)
        # 5 = Saturday, 6 = Sunday
        if current_date.weekday() < 5:
            days_to_add -= 1
    return current_date

class SLAManager:
    @staticmethod
    def calculate_arco_deadline(fecha_ingreso: datetime.datetime = None) -> datetime.datetime:
        """
        Ley 21.719 establece 15 días hábiles para responder solicitudes ARCO.
        """
        if not fecha_ingreso:
            fecha_ingreso = timezone.now()
        
        deadline_date = add_business_days(fecha_ingreso.date(), 15)
        # Set to end of day
        deadline = datetime.datetime.combine(deadline_date, datetime.time(23, 59, 59))
        return timezone.make_aware(deadline)

    @staticmethod
    def check_sla_status(fecha_vencimiento: datetime.datetime) -> str:
        """
        Devuelve el estado del SLA respecto a la fecha actual.
        """
        if not fecha_vencimiento:
            return "OK"
            
        now = timezone.now()
        time_left = fecha_vencimiento - now
        
        if time_left.total_seconds() < 0:
            return "CRITICAL" # Vencido
        elif time_left.days <= 2:
            return "WARNING" # Quedan 24-48 hrs
        return "OK"
