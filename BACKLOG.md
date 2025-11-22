# Project Backlog

Este documento rastrea las mejoras futuras, optimizaciones técnicas y posibles errores conocidos para el proyecto React Flow Family Tree.

## 🚀 Nuevas Funcionalidades (Features)

- **[FEAT-001] Edición de Datos en UI**
  - *Descripción*: Permitir agregar, editar o eliminar miembros de la familia directamente desde la interfaz, sin modificar el JSON manualmente.
  - *Prioridad*: Alta

- **[FEAT-002] Buscador de Personas**
  - *Descripción*: Implementar una barra de búsqueda para localizar y centrar la vista en un miembro específico de la familia.
  - *Prioridad*: Media

- **[FEAT-003] Exportar Árbol**
  - *Descripción*: Funcionalidad para exportar la vista actual del árbol como imagen (PNG/JPEG) o PDF para impresión.
  - *Prioridad*: Media

- **[FEAT-004] Detalle de Persona (Modal)**
  - *Descripción*: Al hacer clic en un nodo, mostrar un modal con información detallada (biografía, fotos adicionales, fechas completas).
  - *Prioridad*: Baja

## 🎨 Experiencia de Usuario (UX/UI)

- **[UX-001] Diseño Responsivo Móvil**
  - *Descripción*: Mejorar la experiencia de navegación y controles en dispositivos móviles y tablets.
  - *Prioridad*: Media

- **[UX-002] Animaciones de Transición**
  - *Descripción*: Suavizar las transiciones al cambiar entre modo Manual y Automático.
  - *Prioridad*: Baja

## 🔧 Refactorización y Optimización

- **[REFACTOR-001] Optimización de Algoritmo**
  - *Descripción*: El algoritmo actual `buildFamilyTree` es recursivo y puede ser ineficiente con árboles muy grandes o profundos. Evaluar optimizaciones o memoización.
  - *Prioridad*: Media

- **[REFACTOR-002] Tipado con TypeScript**
  - *Descripción*: Migrar el proyecto a TypeScript para mejorar la seguridad de tipos, especialmente en las estructuras de datos de `familia.json` y props de componentes.
  - *Prioridad*: Baja

## 🐛 Errores Conocidos y Limitaciones

- **[BUG-001] Referencias Circulares**
  - *Descripción*: El algoritmo actual podría entrar en bucle infinito si existen referencias circulares en las relaciones (ej. error en datos donde A es padre de B y B es padre de A). Necesita validación previa.
  - *Estado*: Pendiente de validación.

- **[BUG-002] Superposición de Ramas**
  - *Descripción*: En familias muy extensas horizontalmente, algunas ramas lejanas podrían superponerse visualmente en el modo automático.
  - *Estado*: Observado en datasets grandes.
