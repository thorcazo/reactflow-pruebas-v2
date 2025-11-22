import React, { useMemo, useCallback, useState, useEffect } from "react";
import familiaData from "./data/familia.json";
import familiaStressTest from "./data/familia_stress_test.json";
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
  // Estado para rastrear el último nodo movido
  const [lastMovedNode, setLastMovedNode] = useState(null);
  // Estado para controlar el modo de posicionamiento (manual o automático)
  const [manualMode, setManualMode] = useState(() => {
    // Intentar recuperar la preferencia guardada en localStorage
    const savedMode = localStorage.getItem('familyTreePositionMode');
    // Por defecto usar modo manual (true)
    return savedMode ? savedMode === 'manual' : true;
  });

  // Bandera para controlar si ya se inicializaron las posiciones
  const [positionsInitialized, setPositionsInitialized] = useState(false);

  // Estado para controlar qué dataset usar (normal o stress test)
  const [useStressTest, setUseStressTest] = useState(false);
  const currentFamilyData = useStressTest ? familiaStressTest : familiaData;

  // Cargar posiciones guardadas al iniciar la aplicación
  useEffect(() => {
    // Solo cargar posiciones guardadas si estamos en modo manual
    if (manualMode) {
      const storedPositions = localStorage.getItem('familyTreePositions');
      if (storedPositions) {
        try {
          const parsedPositions = JSON.parse(storedPositions);
          setSavedPositions(parsedPositions);
          setPositionsInitialized(true); // Marcar que las posiciones ya fueron cargadas
          console.log('Posiciones cargadas desde localStorage (modo manual):', parsedPositions);
        } catch (error) {
          console.error('Error al cargar posiciones guardadas:', error);
          localStorage.removeItem('familyTreePositions'); // Limpiar si hay error
        }
      }
    } else {
      // En modo automático, limpiar posiciones guardadas para usar las del algoritmo
      setSavedPositions({});
      setPositionsInitialized(false);
      console.log('Modo automático: usando posiciones calculadas por el algoritmo');
    }
  }, [manualMode]);

  // Efecto para guardar la preferencia de modo en localStorage
  useEffect(() => {
    localStorage.setItem('familyTreePositionMode', manualMode ? 'manual' : 'auto');
  }, [manualMode]);

  // Aqui se preparan los datos para ReactFlow usando el algoritmo recursivo
  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = buildFamilyTree(currentFamilyData.personas);

    let nodesWithFinalPositions;

    if (manualMode) {
      // En modo manual, aplicar posiciones guardadas si existen
      nodesWithFinalPositions = nodes.map(node => {
        if (savedPositions && savedPositions[node.id]) {
          // Usar las posiciones guardadas en localStorage
          return {
            ...node,
            position: savedPositions[node.id]
          };
        }
        return node;
      });

      // Guardar posiciones iniciales SOLO si no existen en localStorage
      // y asegurarse de que esto ocurra solo una vez
      if (!positionsInitialized && Object.keys(savedPositions).length === 0) {
        const initialPositions = {};
        nodes.forEach(node => {
          initialPositions[node.id] = { x: node.position.x, y: node.position.y };
        });
        localStorage.setItem('familyTreePositions', JSON.stringify(initialPositions));
        setSavedPositions(initialPositions);
        console.log('Inicializando posiciones por primera vez (modo manual):', initialPositions);
      }
    } else {
      // En modo automático, usar siempre las posiciones calculadas por el algoritmo
      nodesWithFinalPositions = nodes;
      console.log('Usando posiciones calculadas automáticamente');
    }

    return { initialNodes: nodesWithFinalPositions, initialEdges: edges };
  }, [savedPositions, positionsInitialized, manualMode, currentFamilyData]);

  // Estado para nodos y conexiones
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Detector de cambios en nodos - se ejecuta después de que onNodesChange haya procesado los cambios
  const onNodeDragStop = useCallback((event, node) => {
    // Un nodo ha sido arrastrado y soltado, activar indicador para mostrar panel
    setNodesMoved(true);

    // Guardar referencia al último nodo movido
    if (node && node.id) {
      setLastMovedNode(node);
    }
  }, []);

  // Función para actualizar una posición específica en localStorage
  const updatePositionInLocalStorage = useCallback((nodeId, position) => {
    const currentStored = localStorage.getItem('familyTreePositions');
    let storedPositions = {};

    if (currentStored) {
      try {
        storedPositions = JSON.parse(currentStored);
      } catch (error) {
        console.error('Error al leer posiciones guardadas:', error);
      }
    }

    // Actualizar solo la posición del nodo especificado
    storedPositions[nodeId] = position;

    // Guardar de vuelta a localStorage
    localStorage.setItem('familyTreePositions', JSON.stringify(storedPositions));

    return storedPositions;
  }, []);

  // Función para guardar la posición del último nodo movido
  const saveNodePositions = useCallback(() => {
    // Verificar si hay un nodo que se haya movido
    if (!lastMovedNode) {
      console.warn('No se detectó ningún nodo movido para guardar');
      return;
    }

    // Obtener el nodo actual con su posición actualizada
    const movedNode = nodes.find(n => n.id === lastMovedNode.id);
    if (!movedNode) {
      console.warn('No se encontró el nodo movido en el estado actual');
      return;
    }

    // Actualizar solo la posición del nodo movido en localStorage
    const updatedPositions = updatePositionInLocalStorage(
      movedNode.id,
      { x: movedNode.position.x, y: movedNode.position.y }
    );

    // Actualizar el estado global con todas las posiciones actualizadas
    setSavedPositions(updatedPositions);

    // Resetear estados
    setNodesMoved(false);
    setLastMovedNode(null);

    // Notificación más sutil con timeout
    const notification = document.createElement('div');
    notification.textContent = `¡Posición del nodo ${movedNode.id} guardada correctamente!`;
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
  }, [lastMovedNode, nodes, updatePositionInLocalStorage]);

  // Función para restablecer las posiciones iniciales
  const resetPositions = useCallback(() => {
    // Elimina las posiciones guardadas
    localStorage.removeItem('familyTreePositions');
    setSavedPositions({});
    setLastMovedNode(null);

    // Reconstruye el árbol con posiciones originales
    const { nodes, edges } = buildFamilyTree(currentFamilyData.personas);

    // Guardar posiciones iniciales en localStorage
    const initialPositions = {};
    nodes.forEach(node => {
      initialPositions[node.id] = { x: node.position.x, y: node.position.y };
    });
    localStorage.setItem('familyTreePositions', JSON.stringify(initialPositions));

    // Actualizar estados
    setNodes(nodes);
    setEdges(edges);
    setSavedPositions(initialPositions);
    setNodesMoved(false); // Resetear el estado de nodos movidos

    // Notificación más sutil con timeout
    const notification = document.createElement('div');
    notification.textContent = '¡Posiciones restablecidas a valores iniciales!';
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
  }, [setNodes, setEdges, currentFamilyData]);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <h1 style={{ position: "absolute", top: 60, left: 20, zIndex: 10 }}>
        Relaciones Familiares - Cónyuges
      </h1>

      {/* Selector de modo manual/automático */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 4,
          padding: '10px',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px'
        }}
      >
        <span>Modo:</span>
        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '30px' }}>
          <input
            type="checkbox"
            checked={manualMode}
            onChange={() => setManualMode(!manualMode)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: manualMode ? '#2196F3' : '#ccc',
            transition: '.4s',
            borderRadius: '30px'
          }}>
            <span style={{
              position: 'absolute',
              content: '""',
              height: '22px',
              width: '22px',
              left: manualMode ? '34px' : '4px',
              bottom: '4px',
              backgroundColor: 'white',
              transition: '.4s',
              borderRadius: '50%'
            }} />
          </span>
        </label>
        <span>{manualMode ? 'Manual' : 'Auto'}</span>
      </div>

      {/* Selector de dataset (Normal o Stress Test) */}
      <div
        style={{
          position: 'absolute',
          top: '70px',
          left: '20px',
          zIndex: 4,
          padding: '10px',
          background: useStressTest ? '#fff3cd' : 'white',
          border: useStressTest ? '2px solid #ff9800' : '1px solid #ccc',
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: useStressTest ? 'bold' : 'normal'
        }}
      >
        <span>Dataset:</span>
        <button
          onClick={() => {
            setUseStressTest(!useStressTest);
            // Limpiar posiciones guardadas al cambiar dataset
            localStorage.removeItem('familyTreePositions');
            setSavedPositions({});
            setNodesMoved(false);
          }}
          style={{
            padding: '5px 15px',
            background: useStressTest ? '#ff9800' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          {useStressTest ? '⚠️ Stress Test (50 personas)' : '✓ Normal (11 personas)'}
        </button>
      </div>


      <ReactFlow
        style={{ width: "100%", height: "calc(100vh - 20px)" }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={[120, 50]}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="grid" gap={20} size={1} />

        {/* Panel de leyenda */}
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

        {/* Panel de control - solo visible cuando se ha movido algún nodo y estamos en modo manual */}
        {nodesMoved && manualMode && (
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
