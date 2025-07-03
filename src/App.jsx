import { useMemo, useCallback, useState, useEffect } from "react";
import familiaData from "./data/familia.json";
import "./App.css";

// Utils
import { buildFamilyTree, nodeStyles } from "./utils/familytreebuild";
import { nodeTypes } from "./components/FamilyTreeNodeTypes";

// Importaciones de ReactFlow
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";







function App() {
  // Estado para almacenar posiciones guardadas
  const [savedPositions, setSavedPositions] = useState({});
  // Estado para controlar si se ha movido algún nodo
  const [nodesMoved, setNodesMoved] = useState(false);

  // Aqui se preparan los datos para ReactFlow usando el algoritmo recursivo
  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = buildFamilyTree(familiaData.personas);
    
    // Aplicar posiciones guardadas si existen
    const nodesWithSavedPositions = nodes.map(node => {
      if (savedPositions[node.id]) {
        return {
          ...node,
          position: savedPositions[node.id]
        };
      }
      return node;
    });
    
    return { initialNodes: nodesWithSavedPositions, initialEdges: edges };
  }, [savedPositions]);

  // Estado para nodos y conexiones
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Función personalizada para detectar cuando los nodos cambian de posición
  const handleNodesChange = useCallback((changes) => {
    // Si algún cambio es de tipo 'position', marcar que se han movido nodos
    const positionChanged = changes.some(change => 
      change.type === 'position' && 
      (change.position?.x !== change.prev?.position?.x || 
       change.position?.y !== change.prev?.position?.y)
    );
    
    if (positionChanged) {
      setNodesMoved(true);
    }
    
    // Aplicar los cambios a los nodos
    setNodes(nds => changes.reduce((acc, change) => {
      // Implementación básica para manejar cambios de posición
      if (change.type === 'position' && change.position) {
        const nodeIndex = acc.findIndex(n => n.id === change.id);
        if (nodeIndex !== -1) {
          acc[nodeIndex] = {
            ...acc[nodeIndex],
            position: change.position
          };
        }
      }
      return acc;
    }, [...nds]));
  }, [setNodes]);
  
  // Función para guardar las posiciones actuales de los nodos
  const saveNodePositions = useCallback(() => {
    const positions = {};
    nodes.forEach(node => {
      positions[node.id] = { x: node.position.x, y: node.position.y };
    });
    
    // Guardar en localStorage
    localStorage.setItem('familyTreePositions', JSON.stringify(positions));
    setSavedPositions(positions);
    setNodesMoved(false); // Resetear el estado de nodos movidos
    
    // Notificación más sutil con timeout
    const notification = document.createElement('div');
    notification.textContent = '¡Posiciones guardadas correctamente!';
    notification.style.position = 'fixed';
    notification.style.bottom = '70px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(0, 128, 0, 0.8)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '1000';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  }, [nodes]);
  
  // Cargar posiciones guardadas al iniciar
  useEffect(() => {
    const savedPositions = localStorage.getItem('familyTreePositions');
    if (savedPositions) {
      try {
        const parsedPositions = JSON.parse(savedPositions);
        setSavedPositions(parsedPositions);
      } catch (error) {
        console.error('Error parsing saved positions:', error);
        localStorage.removeItem('familyTreePositions'); // Limpiar posiciones inválidas
      }
    }
  }, []);

  // Función para restablecer las posiciones iniciales
  const resetPositions = useCallback(() => {
    // Elimina las posiciones guardadas
    localStorage.removeItem('familyTreePositions');
    setSavedPositions({});
    
    // Reconstruye el árbol con posiciones originales
    const { nodes, edges } = buildFamilyTree(familiaData.personas);
    setNodes(nodes);
    setEdges(edges);
    setNodesMoved(false); // Resetear el estado de nodos movidos
    
    // Notificación más sutil con timeout
    const notification = document.createElement('div');
    notification.textContent = '¡Posiciones restablecidas correctamente!';
    notification.style.position = 'fixed';
    notification.style.bottom = '70px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(220, 53, 69, 0.8)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '1000';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  }, [setNodes, setEdges]);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <h1 style={{ position: "absolute", top: 0, left: 20, zIndex: 10 }}>
        Relaciones Familiares - Cónyuges
      </h1>
      <ReactFlow
        style={{ width: "100%", height: "calc(100vh - 20px)" }}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={[120, 50]}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="grid" gap={20} size={1} />
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
        
        {/* Panel para controles de posición y guardado - solo visible cuando se han movido nodos */}
        {nodesMoved && (
          <Panel position="bottom-center" style={{ background: 'white', padding: '10px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={saveNodePositions}
                style={{ 
                  background: '#4CAF50', 
                  color: 'white', 
                  padding: '8px', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '40px', 
                  height: '40px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
                title="Guardar posiciones"
              >
                💾
              </button>
              <button 
                onClick={resetPositions}
                style={{ 
                  background: '#f44336', 
                  color: 'white', 
                  padding: '8px', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '40px', 
                  height: '40px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
                title="Restablecer posiciones"
              >
                ↺
              </button>
              <p style={{ margin: '0', color: '#666' }}>¿Guardar nueva disposición?</p>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export default App;
