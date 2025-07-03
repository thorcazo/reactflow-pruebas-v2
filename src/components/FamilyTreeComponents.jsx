import React from 'react';
import { Handle } from '@xyflow/react';
import { nodeStyles } from '../utils/familytreebuild';

// Componente personalizado para nodos de pareja
export const CoupleNode = ({ data }) => {
  const { husband, wife } = data;

  return (
    <div style={nodeStyles.coupleNode}>
      {/* Handle superior para conexión con padres */}
      <Handle 
        type="target" 
        position="top" 
        id="top" 
        style={{ background: '#555', width: '12px', height: '12px' }} 
      />
      
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
      
      {/* Handle inferior para conexión con hijos */}
      <Handle 
        type="source" 
        position="bottom" 
        id="bottom" 
        style={{ background: '#555', width: '12px', height: '12px' }} 
      />
    </div>
  );
};

// Componente personalizado para nodos individuales
export const PersonNode = ({ data }) => {
  return (
    <div
      style={
        data.genero === "Masculino"
          ? nodeStyles.masculine
          : nodeStyles.feminine
      }
    >
      {/* Handle superior para conexión con padres */}
      <Handle 
        type="target" 
        position="top" 
        id="top" 
        style={{ background: '#555', width: '12px', height: '12px' }} 
      />
      
      <div>
        <strong>
          {data.nombre} {data.apellido1}
        </strong>
      </div>
      <div>Género: {data.genero}</div>
      <div>Nac: {data.fechaNacimiento}</div>
      
      {/* Handle inferior para conexión con hijos */}
      <Handle 
        type="source" 
        position="bottom" 
        id="bottom" 
        style={{ background: '#555', width: '12px', height: '12px' }} 
      />
    </div>
  );
};

// Los componentes son exportados y nodeTypes se ha movido a FamilyTreeNodeTypes.js
