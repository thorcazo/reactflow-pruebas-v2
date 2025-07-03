import { useMemo } from "react";
import familiaData from "./data/familia.json";
import "./App.css";

// Importaciones de ReactFlow
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Estilos CSS para los nodos
const nodeStyles = {
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
    width: 300,
    height: "auto",
  },
};

// Componente personalizado para nodos de pareja
const CoupleNode = ({ data }) => {
  const { husband, wife } = data;

  return (
    <div style={nodeStyles.coupleNode}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ ...nodeStyles.feminine, flex: 1, marginRight: "5px" }}>
          <div>
            <strong>
              {wife.nombre} {wife.apellido1}
            </strong>
          </div>
          <div>Género: {wife.genero}</div>
          <div>Nac: {wife.fechaNacimiento}</div>
        </div>
        <div style={{ ...nodeStyles.masculine, flex: 1, marginLeft: "5px" }}>
          <div>
            <strong>
              {husband.nombre} {husband.apellido1}
            </strong>
          </div>
          <div>Género: {husband.genero}</div>
          <div>Nac: {husband.fechaNacimiento}</div>
        </div>
      </div>
    </div>
  );
};

// Componente personalizado para nodos individuales
const PersonNode = ({ data }) => {
  const style =
    data.genero === "Masculino" ? nodeStyles.masculine : nodeStyles.feminine;

  return (
    <div style={style}>
      <div>
        <strong>
          {data.nombre} {data.apellido1}
        </strong>
      </div>
      <div>Género: {data.genero}</div>
      <div>Nac: {data.fechaNacimiento}</div>
    </div>
  );
};

// Tipos de nodos personalizados
const nodeTypes = {
  coupleNode: CoupleNode,
  personNode: PersonNode,
};

// Función para convertir fecha de nacimiento a objeto Date
const parseFechaNacimiento = (fechaStr) => {
  if (!fechaStr) return null;
  const [año, mes, dia] = fechaStr.split("-").map(Number);
  return new Date(año, mes - 1, dia);
};

// Función para calcular posiciones de nodos en base a algoritmo recursivo
function buildFamilyTree(personas) {
  // Map para acceder rápidamente a las personas por ID
  const personasMap = new Map();
  personas.forEach((p) => personasMap.set(p.id, p));
  
  // Set para rastrear parejas ya procesadas
  const processedCouples = new Set();
  
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
        const hijosAncho = hijosOrdenados.length * 250; // Espacio total para los hijos
        const startX = x - (hijosAncho / 2) + 125; // Centrar los hijos bajo el padre
        
        hijosOrdenados.forEach((hijo, index) => {
          const childX = startX + (index * 250); // Espaciado horizontal de 250px
          const childY = y + 150; // 150px más abajo que los padres
          
          const childNodeId = processNode(hijo, childX, childY, level + 1);
          
          if (childNodeId) {
            // Crear conexión entre padres e hijo
            edges.push({
              id: `edge-${nodeId}-${childNodeId}`,
              source: nodeId,
              target: childNodeId,
              type: "smoothstep",
            });
          }
        });
      }
    } else {
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
              type: "smoothstep",
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
      processNode(root, startX + (index * 400), 100);
    });
  } else {
    // Si no se encuentran raíces, procesar todos como nodos independientes
    personas.forEach((persona, index) => {
      processNode(persona, 100 + (index * 300), 100);
    });
  }
  
  return { nodes, edges };
}

function App() {
  // Preparar los datos para ReactFlow usando el algoritmo recursivo
  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = buildFamilyTree(familiaData.personas);
    return { initialNodes: nodes, initialEdges: edges };
  }, []);

  // Estado para nodos y conexiones
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, __, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <h1 style={{ position: "absolute", top: 0, left: 20, zIndex: 10 }}>
        Relaciones Familiares - Cónyuges
      </h1>
      <ReactFlow
        style={{ width: "100%", height: "calc(100vh - 20px)" }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
        <Panel position="top-right">
          <div style={{ background: "white", padding: 10, borderRadius: 5 }}>
            <div>
              <span
                style={{
                  display: "inline-block",
                  width: 15,
                  height: 15,
                  backgroundColor: nodeStyles.masculine.backgroundColor,
                  border: nodeStyles.masculine.border,
                }}
              ></span>{" "}
              Masculino
            </div>
            <div>
              <span
                style={{
                  display: "inline-block",
                  width: 15,
                  height: 15,
                  backgroundColor: nodeStyles.feminine.backgroundColor,
                  border: nodeStyles.feminine.border,
                }}
              ></span>{" "}
              Femenino
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default App;
