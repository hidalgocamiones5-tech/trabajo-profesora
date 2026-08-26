from api.models import Empresa

class EmpresaCliente(Empresa):
    class Meta:
        proxy = True
        verbose_name = 'Empresa (Cliente)'
        verbose_name_plural = 'Empresas Registradas'
