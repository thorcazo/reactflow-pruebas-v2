import React, { useMemo, useCallback, useState, useEffect } from "react";
import familiaData from "./data/familia.json";
import familiaStressTest from "./data/familia_stress_test.json";
import "./App.css";

// Utils
import { buildFamilyTree, nodeStyles } from "./utils/familytreebuild";
import { nodeTypes } from "./components/FamilyTreeNodeTypes";

// Components
import MemberModal from "./components/MemberModal";

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
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [familyData, setFamilyData] = useState(familiaData);

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
  const currentFamilyData = useStressTest ? familiaStressTest : familyData;

  // Dark mode state management
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  // Effect to apply dark mode class to document and save preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Handle member modal save
  const handleSaveMember = useCallback((memberData) => {
    setFamilyData(prevData => {
      const updatedPersonas = prevData.personas.map(p => 
        p.id === memberData.id ? memberData : p
      );

      // If it's a new member, add it
      if (!prevData.personas.find(p => p.id === memberData.id)) {
        updatedPersonas.push(memberData);
      }

      const updatedData = { ...prevData, personas: updatedPersonas };
      
      // Save to localStorage
      localStorage.setItem('familyData', JSON.stringify(updatedData));
      
      return updatedData;
    });

    setSelectedMember(null);
    setIsModalOpen(false);
  }, []);

  // Handle edit member
  const handleEditMember = useCallback((memberId) => {
    const member = currentFamilyData.personas.find(p => p.id === parseInt(memberId));
    if (member) {
      setSelectedMember(member);
      setIsModalOpen(true);
    }
  }, [currentFamilyData.personas]);

  // Handle add new member
  const handleAddMember = useCallback(() => {
    setSelectedMember(null);
    setIsModalOpen(true);
  }, []);


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
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Update nodes and edges when dataset changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Fit view after dataset (nodes) change
  useEffect(() => {
    if (reactFlowInstance) {
      const timer = setTimeout(() => reactFlowInstance.fitView({ padding: 0.1 }), 100);
      return () => clearTimeout(timer);
    }
  }, [initialNodes, reactFlowInstance]);

  // Detector de cambios en nodos - se ejecuta después de que onNodesChange haya procesado los cambios
  const onNodeDragStop = useCallback((event, node) => {
    // Un nodo ha sido arrastrado y soltado, activar indicador para mostrar panel
    setNodesMoved(true);

    // Guardar referencia al último nodo movido
    if (node && node.id) {
      setLastMovedNode(node);
    }
  }, []);

  // Handle node click to edit
  const onNodeClick = useCallback((event, node) => {
    handleEditMember(node.id);
  }, [handleEditMember]);

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
    notification.style.bottom = '90px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(76, 175, 80, 0.95)';
    notification.style.color = 'white';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '1000';
    notification.style.fontFamily = "'Inter', sans-serif";
    notification.style.fontSize = '14px';
    notification.style.fontWeight = '500';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.backdropFilter = 'blur(10px)';

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
    notification.style.bottom = '90px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(244, 67, 54, 0.95)';
    notification.style.color = 'white';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '1000';
    notification.style.fontFamily = "'Inter', sans-serif";
    notification.style.fontSize = '14px';
    notification.style.fontWeight = '500';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.backdropFilter = 'blur(10px)';

    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  }, [setNodes, setEdges, currentFamilyData]);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }} className={darkMode ? 'dark' : ''}>
      <h1 style={{
        position: "absolute",
        top: 60,
        left: 20,
        zIndex: 10,
        fontFamily: "'Inter', sans-serif",
        fontSize: "24px",
        fontWeight: 600,
        color: darkMode ? '#e2e8f0' : '#2c3e50',
        letterSpacing: "-0.5px"
      }}>

      </h1>

      {/* Control Panel Container */}
      <div className="control-panel" style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 4, display: 'flex', flexDirection: 'row', gap: '10px' }}>
        {/* Selector de modo manual/automático */}
        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '0.5px solid #e0e0e0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(10px)'
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
                content: '',
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
            padding: '12px 14px',
            background: useStressTest ? 'rgba(255, 243, 205, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: useStressTest ? '1px solid #ff9800' : '0.5px solid #e0e0e0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: useStressTest ? 600 : 'normal',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(10px)'
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
              padding: '6px 16px',
              background: useStressTest ? '#ff9800' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {useStressTest ? '⚠️ Stress Test (50 personas)' : '✓ Normal (11 personas)'}
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <div
          style={{
            padding: '12px 14px',
            background: darkMode ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: darkMode ? '0.5px solid #4a5568' : '0.5px solid #e0e0e0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(10px)',
            color: darkMode ? '#e2e8f0' : '#333'
          }}
        >
          <span>Tema:</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: '6px 16px',
              background: darkMode ? '#4a5568' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
        </div>
      </div>

      <ReactFlow
        style={{ width: "100%", height: "calc(100vh - 20px)" }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={[120, 50]}
        onInit={setReactFlowInstance}
        fitView
        defaultEdgeOptions={{
          style: {
            strokeWidth: 1.5,
            stroke: '#bdbdbd',
            opacity: 0.6
          },
          markerEnd: {
            type: 'arrow',
            width: 12,
            height: 12,
            color: '#bdbdbd'
          }
        }}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={20} size={1} color="#e0e0e0" />

        {/* Panel de leyenda */}
        <Panel position="top-right">
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "0.5px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            backdropFilter: "blur(10px)",
            fontSize: "14px"
          }}>
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
          <Panel position="bottom-center" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '0.5px solid #e0e0e0',
            backdropFilter: 'blur(10px)'
          }}>
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

      {/* Member Modal */}
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMember(null);
        }}
        onSave={handleSaveMember}
        member={selectedMember}
        allMembers={currentFamilyData.personas}
      />

      {/* Add Member Button */}
      <button
        onClick={handleAddMember}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';
        }}
        title="Agregar nuevo miembro"
      >
        +
      </button>
    </div>
  );
}

export default App;
