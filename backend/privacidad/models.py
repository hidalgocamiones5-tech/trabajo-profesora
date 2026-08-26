from api.models import TratamientoRAT, RegistroAuditoriaARCO

class RATPrivacidad(TratamientoRAT):
    class Meta:
        proxy = True
        verbose_name = 'Registro de Actividad (RAT)'
        verbose_name_plural = 'Registros RAT'

class AuditoriaARCO(RegistroAuditoriaARCO):
    class Meta:
        proxy = True
        verbose_name = 'Solicitud de Derecho ARCO'
        verbose_name_plural = 'Derechos ARCO'
