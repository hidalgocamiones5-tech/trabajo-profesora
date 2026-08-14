import re
from rest_framework import serializers

def validar_rut_chile(rut: str) -> str:
    """
    Valida el RUT chileno según el algoritmo oficial de Módulo 11.
    Formato esperado: XX.XXX.XXX-K o XXXXXXXXK (limpio).
    Retorna el RUT limpio en formato estándar XXXXXXXX-K si es válido.
    Lanza rest_framework.serializers.ValidationError si el RUT es inválido.
    """
    if not rut or not isinstance(rut, str):
        raise serializers.ValidationError("El RUT no puede estar vacío.")

    # Limpiar puntos y guiones, convertir a mayúsculas
    rut_limpio = rut.replace(".", "").replace("-", "").strip().upper()

    if len(rut_limpio) < 2:
        raise serializers.ValidationError("El RUT debe tener al menos el cuerpo y dígito verificador.")

    cuerpo = rut_limpio[:-1]
    dv = rut_limpio[-1]

    if not cuerpo.isdigit():
        raise serializers.ValidationError("El cuerpo del RUT debe contener solo números.")

    if dv not in "0123456789K":
        raise serializers.ValidationError("El dígito verificador del RUT debe ser un número o 'K'.")

    # Algoritmo Módulo 11
    suma = 0
    multiplicador = 2

    for d in reversed(cuerpo):
        suma += int(d) * multiplicador
        multiplicador = 2 if multiplicador == 7 else multiplicador + 1

    resto = 11 - (suma % 11)

    if resto == 11:
        dv_esperado = "0"
    elif resto == 10:
        dv_esperado = "K"
    else:
        dv_esperado = str(resto)

    if dv != dv_esperado:
        raise serializers.ValidationError(f"El RUT '{rut}' no es válido según el algoritmo Módulo 11 (Chile).")

    # Retornar RUT formateado
    cuerpo_formateado = f"{int(cuerpo):,}".replace(",", ".")
    return f"{cuerpo_formateado}-{dv}"
