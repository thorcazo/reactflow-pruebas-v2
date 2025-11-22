# React Flow Family Tree Visualizer

Este proyecto es una aplicación web interactiva para visualizar relaciones familiares (árbol genealógico) utilizando [React Flow](https://reactflow.dev/). Permite visualizar conexiones entre cónyuges, padres e hijos de una manera dinámica y organizada.

## 🚀 Características Principales

- **Visualización de Árbol Genealógico**: Generación automática de nodos y conexiones basada en datos JSON.
- **Nodos Personalizados**:
  - **Nodos de Persona**: Representación individual con distinción de género por colores (Azul para masculino, Rosa para femenino).
  - **Nodos de Pareja**: Agrupación visual de cónyuges en un único bloque contenedor.
- **Modos de Posicionamiento**:
  - **Automático**: Algoritmo recursivo que organiza el árbol jerárquicamente.
  - **Manual**: Permite arrastrar y soltar nodos para personalizar la distribución.
- **Persistencia de Datos**:
  - Las posiciones personalizadas en modo manual se guardan automáticamente en `localStorage`.
  - Preferencia de modo (Manual/Auto) persistente.
- **Controles Interactivos**: Zoom, Pan, MiniMap y controles de navegación estándar de React Flow.

## 🛠️ Tecnologías Utilizadas

- **[React](https://react.dev/)**: Biblioteca principal para la interfaz de usuario.
- **[Vite](https://vitejs.dev/)**: Entorno de desarrollo y empaquetador rápido.
- **[@xyflow/react](https://reactflow.dev/)**: Biblioteca para la visualización de grafos y diagramas.
- **CSS Puro**: Estilos personalizados sin dependencias de frameworks CSS pesados.

## 📦 Instalación y Ejecución

Asegúrate de tener [Node.js](https://nodejs.org/) instalado.

1. **Clonar el repositorio** (o descargar los archivos):
   ```bash
   git clone <url-del-repositorio>
   cd reactflow-pruebas-v2
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   # o si usas pnpm
   pnpm install
   ```

3. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   # o
   pnpm dev
   ```

4. **Construir para producción**:
   ```bash
   npm run build
   ```

## 📂 Estructura del Proyecto

- **`src/App.jsx`**: Componente principal. Maneja el estado global, la lógica de modos (manual/auto) y la persistencia.
- **`src/data/familia.json`**: Fuente de datos del árbol genealógico. Define las personas y sus relaciones.
- **`src/utils/familytreebuild.js`**: Contiene el algoritmo recursivo `buildFamilyTree` que transforma los datos planos JSON en nodos y aristas (edges) para React Flow.
- **`src/components/`**:
    - `FamilyTreeNodeTypes.js`: Definición de los tipos de nodos personalizados.
    - `FamilyTreeComponents.jsx`: Componentes React para renderizar los nodos (PersonNode, CoupleNode).

## 📝 Uso

1. Al abrir la aplicación, verás el árbol generado automáticamente.
2. Usa el **switch "Modo"** en la esquina superior izquierda para alternar entre posicionamiento automático y manual.
3. En **Modo Manual**:
   - Arrastra los nodos a la posición deseada.
   - Al soltar un nodo, aparecerá un botón flotante 💾 para guardar la nueva disposición.
   - Puedes restablecer las posiciones originales con el botón ↺.
