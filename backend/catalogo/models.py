from api.models import Normativa

class NormativaCatalogo(Normativa):
    class Meta:
        proxy = True
        verbose_name = 'Normativa Oficial BCN'
        verbose_name_plural = 'Leyes & Normativas'
