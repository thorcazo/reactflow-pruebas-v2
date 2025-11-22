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

- **[FEAT-005] Mejorar tipografia y posicion de elementos en la pizzara del arbol**
  - *Descripción*: Mejorar la tipografía y la posición de los elementos en la pizarra del árbol.Tipo OpenSans. Tamaño de fuente adecuado
  - *Prioridad*: Baja
  - *Estado*: **Completado**. Se implementó la fuente Open Sans, se optimizaron los tamaños de fuente (16px para nombres, 13px para detalles), se mejoró el espaciado y la jerarquía visual.

- **[FEAT-006] Mejorar visual. Minimalista**
  - *Descripción*: Mejorar la visualidad del árbol. Minimalista. Con colores mas elegantes.  
  - *Prioridad*: Baja

- **[FEAT-007] Modo oscuro**
  - *Descripción*: Implementar un modo oscuro para la interfaz.
  - *Prioridad*: Baja

## 🎨 Experiencia de Usuario (UX/UI)

- **[UX-001] Diseño Responsivo Móvil**
  - *Descripción*: Mejorar la experiencia de navegación y controles en dispositivos móviles y tablets.
  - *Prioridad*: Media

- **[UX-002] Animaciones de Transición**
  - *Descripción*: Suavizar las transiciones al cambiar entre modo Manual y Automático.
  - *Prioridad*: Baja

- **[UX-003] Elementos "Modo manual" y "Dataset", "Tema" Demasiado cerca y visualmente no correcto**
  - *Descripción*: Elementos "Modo manual" y "Dataset", "Tema" Demasiado cerca y visualmente no correcto. Hay que meterlos dentro de un contenedor que los separe. Ademas "Relaciones Familiares" tambien esta por encima de todo estos elementos. 
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
  - *Estado*: Corregido. Se implementó detección de ciclos en `buildFamilyTree`.

- **[BUG-002] Superposición de Ramas**
  - *Descripción*: En familias muy extensas horizontalmente, algunas ramas lejanas podrían superponerse visualmente en el modo automático.
  - *Estado*: **Resuelto**. Se implementó un algoritmo mejorado que calcula recursivamente el ancho necesario para cada subárbol antes de posicionar los nodos, eliminando las superposiciones. Probado exitosamente con dataset de estrés de 50 personas en 4 generaciones.

- **[BUG-003] El boton de "Dataset" no funciona**
  - *Descripción*: El boton de "Dataset" no funciona. Cuando pinchas no se visualiza el dataset normal y el dataset de estrés. Se debe cambiar cuando se pulse el boton.
  - *Estado*: **Sin completar**. 
  - *Prioridad*: Alta 