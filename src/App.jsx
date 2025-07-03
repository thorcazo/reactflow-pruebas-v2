import { useMemo } from "react";
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
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";







function App() {
  // Aqui se preparan los datos para ReactFlow usando el algoritmo recursivo
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
