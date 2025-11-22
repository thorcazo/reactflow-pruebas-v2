// Estilos CSS para los nodos
export const nodeStyles = {
  masculine: {
    backgroundColor: "#d6e4ff",
    color: "#000",
    border: "1px solid #3c78d8",
    borderRadius: "8px",
    padding: "10px 15px",
    width: 180,
  },
  feminine: {
    backgroundColor: "#fce4ec",
    color: "#000",
    border: "1px solid #e91e63",
    borderRadius: "8px",
    padding: "10px 15px",
    width: 180,
  },
  coupleNode: {
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    width: 360,
    height: "auto",
  },
};

// Función para convertir fecha de nacimiento a objeto Date
export const parseFechaNacimiento = (fechaStr) => {
  if (!fechaStr) return null;
  const [año, mes, dia] = fechaStr.split("-").map(Number);
  return new Date(año, mes - 1, dia);
};


// Función para calcular posiciones de nodos en base a algoritmo recursivo
// Aqui se define la funcion para calcular las posiciones de los nodos en base a algoritmo recursivo
function buildFamilyTree(personas) {
  // Map para acceder rápidamente a las personas por ID
  const personasMap = new Map();
  personas.forEach((p) => personasMap.set(p.id, p));

  // Set para rastrear parejas ya procesadas
  const processedCouples = new Set();

  // Set para rastrear personas que ya han sido incluidas en un nodo CoupleNode
  const peopleInCoupleNodes = new Set();

  // Set para rastrear personas ya procesadas como nodos individuales (para evitar ciclos)
  const processedSingleNodes = new Set();

  // Arreglos para nodos y edges
  const nodes = [];
  const edges = [];

  // Encontrar las raíces del árbol (personas sin progenitores)
  const findRoots = () => {
    const hasParents = new Set();

    // Identificar personas que son hijos de alguien
    personas.forEach((persona) => {
      persona.relaciones?.forEach((rel) => {
        if (rel.tipo === "progenitor") {
          hasParents.add(persona.id);
        }
      });
    });

    // Devolver personas que no tienen progenitores
    return personas.filter((p) => !hasParents.has(p.id));
  };

  const roots = findRoots();

  // Encontrar cónyuge de una persona
  const findConyuge = (persona) => {
    const conyugeRelacion = persona.relaciones?.find((rel) => rel.tipo === "conyuge");
    if (conyugeRelacion) {
      return personasMap.get(conyugeRelacion.idRelacion);
    }
    return null;
  };

  // Encontrar hijos de una pareja o persona
  const findHijos = (personaId) => {
    return personas.filter((p) => {
      return p.relaciones?.some(
        (rel) => rel.tipo === "progenitor" && rel.idRelacion === personaId
      );
    }).sort((a, b) => {
      // Ordenar por fecha de nacimiento (mayor a menor)
      const fechaA = parseFechaNacimiento(a.fechaNacimiento);
      const fechaB = parseFechaNacimiento(b.fechaNacimiento);
      if (!fechaA) return 1;
      if (!fechaB) return -1;
      return fechaA - fechaB;
    });
  };

  // Función recursiva para construir el árbol
  const processNode = (persona, x, y, level = 0) => {
    if (!persona) return null;

    const conyuge = findConyuge(persona);
    let nodeId;

    // Crear nodo de pareja o nodo individual
    if (conyuge) {
      const coupleKey = [persona.id, conyuge.id].sort().join("-");

      // Si esta pareja ya fue procesada, retornar su ID
      if (processedCouples.has(coupleKey)) {
        return `couple-${coupleKey}`;
      }

      processedCouples.add(coupleKey);

      // Agregar ambos a la lista de personas ya incluidas en nodos de pareja
      peopleInCoupleNodes.add(persona.id);
      peopleInCoupleNodes.add(conyuge.id);

      // Determinar quién es el esposo y quién es la esposa
      const husband = persona.genero === "Masculino" ? persona : conyuge;
      const wife = persona.genero === "Femenino" ? persona : conyuge;

      nodeId = `couple-${coupleKey}`;

      // Agregar nodo de pareja
      nodes.push({
        id: nodeId,
        type: "coupleNode",
        position: { x, y },
        data: { husband, wife },
        sourcePosition: "bottom",
        targetPosition: "top",
      });

      // Procesar hijos
      const hijosPersona = findHijos(persona.id);
      const hijosConyuge = findHijos(conyuge.id);

      // Combinar y eliminar duplicados
      const allHijosIds = new Set([...hijosPersona.map(h => h.id), ...hijosConyuge.map(h => h.id)]);
      const allHijos = [...allHijosIds].map(id => personasMap.get(id));

      // Ordenar hijos por fecha de nacimiento
      const hijosOrdenados = allHijos.sort((a, b) => {
        const fechaA = parseFechaNacimiento(a.fechaNacimiento);
        const fechaB = parseFechaNacimiento(b.fechaNacimiento);
        if (!fechaA) return 1;
        if (!fechaB) return -1;
        return fechaA - fechaB;
      });

      // Procesar cada hijo recursivamente
      if (hijosOrdenados.length > 0) {
        // Calcular espaciado basado en si los hijos tienen cónyuge
        const hijosEspacios = hijosOrdenados.map(hijo => {
          // Si el hijo tiene cónyuge, necesita más espacio
          const tieneConyuge = hijo.relaciones?.some(rel => rel.tipo === "conyuge");
          return tieneConyuge ? nodeStyles.masculine.width + 450 : nodeStyles.masculine.width + 50; // Más espacio para los que tienen cónyuge
        });

        // Calcular ancho total y posición inicial
        const hijosAncho = hijosEspacios.reduce((sum, espacio) => sum + espacio, 0);
        let startX = x - (hijosAncho / 2);

        // Posicionar cada hijo
        let currentX = startX;
        hijosOrdenados.forEach((hijo, index) => {
          const espacio = hijosEspacios[index];
          const childX = currentX + (espacio / 2); // Centrar en su espacio asignado
          const childY = y + 200; // Mayor distancia vertical para mejor visualización
          currentX += espacio; // Actualizar posición para el siguiente hijo

          const childNodeId = processNode(hijo, childX, childY, level + 1);

          if (childNodeId) {
            // Crear conexión entre padres e hijo
            edges.push({
              id: `edge-${nodeId}-${childNodeId}`,
              source: nodeId,
              target: childNodeId,
              sourceHandle: "bottom",
              targetHandle: "top",
              type: "smoothstep",
              markerEnd: { type: 'arrow' },
              style: { strokeWidth: 2 },
            });
          }
        });
      }
    } else {
      // Verificar si esta persona ya está incluida en un nodo CoupleNode
      if (peopleInCoupleNodes.has(persona.id)) {
        return null; // No crear nodo individual si ya está en un nodo de pareja
      }

      // Verificar si ya fue procesado como nodo individual (evitar ciclos)
      if (processedSingleNodes.has(persona.id)) {
        return `person-${persona.id}`;
      }
      processedSingleNodes.add(persona.id);

      // Nodo individual (sin cónyuge)
      nodeId = `person-${persona.id}`;

      nodes.push({
        id: nodeId,
        type: "personNode",
        position: { x, y },
        data: persona,
        sourcePosition: "bottom",
        targetPosition: "top",
      });

      // Procesar hijos de persona sin cónyuge
      const hijos = findHijos(persona.id);

      if (hijos.length > 0) {
        const hijosAncho = hijos.length * 250;
        const startX = x - (hijosAncho / 2) + 125;

        hijos.forEach((hijo, index) => {
          const childX = startX + (index * 250);
          const childY = y + 150;

          const childNodeId = processNode(hijo, childX, childY, level + 1);

          if (childNodeId) {
            edges.push({
              id: `edge-${nodeId}-${childNodeId}`,
              source: nodeId,
              target: childNodeId,
              sourceHandle: "bottom",
              targetHandle: "top",
              type: "smoothstep",
              markerEnd: { type: 'arrow' },
              style: { strokeWidth: 2 },
            });
          }
        });
      }
    }

    return nodeId;
  };

  // Procesar cada raíz del árbol
  if (roots.length > 0) {
    const rootsWidth = roots.length * 400;
    let startX = 100;

    // Si hay múltiples raíces, distribuirlas horizontalmente
    if (roots.length > 1) {
      startX = (window.innerWidth / 2) - (rootsWidth / 2) + 200;
    }

    roots.forEach((root, index) => {
      // Solo procesar si no es parte de un nodo de pareja ya procesado
      if (!peopleInCoupleNodes.has(root.id)) {
        processNode(root, startX + (index * 400), 100);
      }
    });
  } else {
    // Si no se encuentran raíces, procesar todos como nodos independientes
    personas.forEach((persona, index) => {
      // Solo procesar si no es parte de un nodo de pareja ya procesado
      if (!peopleInCoupleNodes.has(persona.id)) {
        processNode(persona, 100 + (index * 300), 100);
      }
    });
  }

  return { nodes, edges };
}


export { buildFamilyTree };