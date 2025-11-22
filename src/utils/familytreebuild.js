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


// Función para calcular posiciones de nodos en base a algoritmo recursivo mejorado
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

  // Mapa para almacenar el ancho calculado de cada subárbol
  const subtreeWidths = new Map();

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

  // NUEVA FUNCIÓN: Calcular recursivamente el ancho necesario para un subárbol
  const calculateSubtreeWidth = (persona) => {
    if (!persona) return 0;

    const conyuge = findConyuge(persona);
    let nodeKey;

    if (conyuge) {
      nodeKey = `couple-${[persona.id, conyuge.id].sort().join("-")}`;
    } else {
      nodeKey = `person-${persona.id}`;
    }

    // Si ya calculamos el ancho de este subárbol, devolverlo
    if (subtreeWidths.has(nodeKey)) {
      return subtreeWidths.get(nodeKey);
    }

    // Obtener todos los hijos
    let allHijos = [];
    if (conyuge) {
      const hijosPersona = findHijos(persona.id);
      const hijosConyuge = findHijos(conyuge.id);
      const allHijosIds = new Set([...hijosPersona.map(h => h.id), ...hijosConyuge.map(h => h.id)]);
      allHijos = [...allHijosIds].map(id => personasMap.get(id));
    } else {
      allHijos = findHijos(persona.id);
    }

    if (allHijos.length === 0) {
      // Nodo hoja: ancho mínimo
      const width = conyuge ? nodeStyles.coupleNode.width : nodeStyles.masculine.width;
      subtreeWidths.set(nodeKey, width + 100); // Agregar margen
      return width + 100;
    }

    // Calcular el ancho total sumando los anchos de todos los subárboles de los hijos
    let totalChildrenWidth = 0;
    allHijos.forEach(hijo => {
      totalChildrenWidth += calculateSubtreeWidth(hijo);
    });

    // El ancho del subárbol es el máximo entre:
    // 1. El ancho del nodo actual
    // 2. La suma de los anchos de los hijos
    const nodeWidth = conyuge ? nodeStyles.coupleNode.width : nodeStyles.masculine.width;
    const subtreeWidth = Math.max(nodeWidth + 100, totalChildrenWidth);

    subtreeWidths.set(nodeKey, subtreeWidth);
    return subtreeWidth;
  };

  // Función recursiva para construir el árbol con espaciado mejorado
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

      // Procesar cada hijo recursivamente con el nuevo algoritmo
      if (hijosOrdenados.length > 0) {
        // MEJORA: Calcular el ancho de cada subárbol hijo
        const hijosConAnchos = hijosOrdenados.map(hijo => ({
          hijo,
          ancho: calculateSubtreeWidth(hijo)
        }));

        // Calcular ancho total necesario
        const totalWidth = hijosConAnchos.reduce((sum, item) => sum + item.ancho, 0);

        // Posición inicial centrada respecto al padre
        let currentX = x - (totalWidth / 2);

        // Posicionar cada hijo
        hijosConAnchos.forEach(({ hijo, ancho }) => {
          // Centrar el hijo en su espacio asignado
          const childX = currentX + (ancho / 2);
          const childY = y + 250; // Espaciado vertical aumentado

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

          // Avanzar a la siguiente posición
          currentX += ancho;
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
        // MEJORA: Usar el mismo sistema de cálculo de ancho para personas sin cónyuge
        const hijosConAnchos = hijos.map(hijo => ({
          hijo,
          ancho: calculateSubtreeWidth(hijo)
        }));

        const totalWidth = hijosConAnchos.reduce((sum, item) => sum + item.ancho, 0);
        let currentX = x - (totalWidth / 2);

        hijosConAnchos.forEach(({ hijo, ancho }) => {
          const childX = currentX + (ancho / 2);
          const childY = y + 200;

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

          currentX += ancho;
        });
      }
    }

    return nodeId;
  };

  // Calcular anchos de subárbol para todas las raíces primero
  roots.forEach(root => {
    calculateSubtreeWidth(root);
  });

  // Procesar cada raíz del árbol con mejor distribución
  if (roots.length > 0) {
    // Calcular el ancho total necesario para todas las raíces
    const rootsWithWidths = roots
      .filter(root => !peopleInCoupleNodes.has(root.id))
      .map(root => ({
        root,
        width: calculateSubtreeWidth(root)
      }));

    const totalRootsWidth = rootsWithWidths.reduce((sum, item) => sum + item.width, 0);

    // Centrar el árbol completo en la pantalla
    let startX = (window.innerWidth / 2) - (totalRootsWidth / 2);

    rootsWithWidths.forEach(({ root, width }) => {
      const rootX = startX + (width / 2);
      processNode(root, rootX, 100);
      startX += width;
    });
  } else {
    // Si no se encuentran raíces, procesar todos como nodos independientes
    const independientes = personas.filter(persona => !peopleInCoupleNodes.has(persona.id));

    const independientesConAnchos = independientes.map(persona => ({
      persona,
      width: calculateSubtreeWidth(persona)
    }));

    const totalWidth = independientesConAnchos.reduce((sum, item) => sum + item.width, 0);
    let startX = (window.innerWidth / 2) - (totalWidth / 2);

    independientesConAnchos.forEach(({ persona, width }) => {
      const x = startX + (width / 2);
      processNode(persona, x, 100);
      startX += width;
    });
  }

  return { nodes, edges };
}


export { buildFamilyTree };