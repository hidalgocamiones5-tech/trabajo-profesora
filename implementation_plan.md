# 🚀 Plan de Implementación: Motor de Cálculo y Conexión GRC (Cascada)

Actualmente, el sistema funciona como un prototipo visual (Mock). Las `TareasPendientes` no están enlazadas por base de datos a las `Normativas` de la empresa, y el `porcentaje_progreso` de cada ley es un campo estático numérico en lugar de uno calculado dinámicamente.

Este plan detalla la arquitectura necesaria para conectar el frontend ("Mi Trabajo") con el backend ("Catálogo") para que la finalización de tareas actualice los porcentajes de cumplimiento en tiempo real.

## User Review Required

> [!IMPORTANT]
> **Cambios en la Base de Datos:** Esta implementación requerirá migraciones en Django porque modificaremos llaves foráneas (ForeignKeys) en los modelos `TareaPendiente`, `Obligacion` y `Control`. Esto podría resetear las tareas de prueba que tengas actualmente creadas en la base de datos.
>
> **Lógica de Pesos vs Promedio Simple:** Inicialmente, el % de avance de una ley se calculará como un promedio simple de sus obligaciones (ej. 4 obligaciones = 25% cada una). ¿Estás de acuerdo con este enfoque o prefieres que ciertas tareas/obligaciones "pesen" más que otras en el progreso?

## Open Questions

> [!TIP]
> ¿Las tareas (Obligaciones) podrán reabrirse una vez completadas? Si un usuario marca una tarea como completada y luego le quita el check, ¿el porcentaje de cumplimiento global de la ley debería retroceder?

## Proposed Changes

---

### Backend: Models (`api/models.py`)

Necesitamos establecer la relación jerárquica: `ComplianceEmpresa` -> `Obligacion` -> `TareaPendiente`.

#### [MODIFY] api/models.py
- **`TareaPendiente`:**
  - Agregar `obligacion = models.ForeignKey(Obligacion, on_delete=models.CASCADE, null=True, blank=True)`
  - Agregar `compliance_empresa = models.ForeignKey(ComplianceEmpresa, on_delete=models.CASCADE, null=True, blank=True)`
- **`ComplianceEmpresa`:**
  - Crear un método de clase `recalcular_progreso()` que cuente cuántas tareas u obligaciones vinculadas están en estado `completada` versus el total, y actualice `porcentaje_progreso`.

---

### Backend: Signals & Triggers (`api/signals.py` o sobrescribir `save()`)

El sistema debe reaccionar automáticamente cada vez que alguien toca una tarea.

#### [NEW] api/signals.py
- Crear un *Signal* `post_save` para `TareaPendiente`.
- Lógica: Si `instance.estado == 'completada'`, buscar el registro `ComplianceEmpresa` padre y ejecutar `recalcular_progreso()`.

---

### Backend: API Endpoints (`api/views.py`)

Garantizar que el frontend pueda enviar la actualización de estado correctamente.

#### [MODIFY] api/views.py
- **`TareaPendienteViewSet`:** 
  - Asegurar que permita métodos `PATCH` para actualizar únicamente el campo `estado`. 
  - Exponer un endpoint extra de solo-lectura (ej. `/api/empresas/compliance-status/`) para que el frontend pueda consultar los % globales actualizados rápidamente.

---

### Frontend: Conexión React (`src/views/MyWork.tsx` y `src/services/api.ts`)

Conectar los botones visuales (Checkboxes) con los endpoints reales.

#### [MODIFY] src/services/api.ts
- Implementar `completarTarea(id: number, estado: string)`.

#### [MODIFY] src/views/MyWork.tsx
- Reemplazar el manejo de estado local estático por llamadas asíncronas.
- En la función `handleToggleTask`, hacer el llamado a `api.completarTarea`.
- Mostrar un estado de carga (Spinner) mientras el backend recalcula, y lanzar un `toast.success` cuando el backend devuelva el nuevo estado.

## Verification Plan

### Automated / Manual Tests
- **Paso 1:** Crear una `ComplianceEmpresa` (Ley Karin) con 0%.
- **Paso 2:** Crear 2 `TareaPendiente` vinculadas a esa ley.
- **Paso 3:** En el frontend ("Mi Trabajo"), hacer clic en completar la 1ra tarea.
- **Paso 4:** Verificar que en el backend (y visualmente en el Catálogo) la Ley Karin suba automáticamente al 50%.
- **Paso 5:** Completar la 2da tarea y verificar que llegue al 100%.
