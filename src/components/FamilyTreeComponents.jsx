import React from 'react';
import { Handle } from '@xyflow/react';
import { nodeStyles } from '../utils/familytreebuild';

// Componente personalizado para nodos de pareja
export const CoupleNode = ({ data }) => {
  const { husband, wife } = data;

  return (
    <div style={{
      ...nodeStyles.coupleNode,
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = nodeStyles.coupleNode.boxShadow;
    }}>
      {/* Handle superior para conexión con padres */}
      <Handle
        type="target"
        position="top"
        id="top"
        style={{ background: '#9e9e9e', width: '10px', height: '10px', border: 'none' }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
        <div style={{
          ...nodeStyles.feminine,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, lineHeight: '1.3' }}>
            {wife.nombre} {wife.apellido1}
          </div>
          <div style={{ fontSize: '13px', color: '#555' }}>
            {wife.genero}
          </div>
          <div style={{ fontSize: '13px', color: '#555' }}>
            Nac: {wife.fechaNacimiento}
          </div>
        </div>
        <div style={{
          ...nodeStyles.masculine,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, lineHeight: '1.3' }}>
            {husband.nombre} {husband.apellido1}
          </div>
          <div style={{ fontSize: '13px', color: '#555' }}>
            {husband.genero}
          </div>
          <div style={{ fontSize: '13px', color: '#555' }}>
            Nac: {husband.fechaNacimiento}
          </div>
        </div>
      </div>

      {/* Handle inferior para conexión con hijos */}
      <Handle
        type="source"
        position="bottom"
        id="bottom"
        style={{ background: '#9e9e9e', width: '10px', height: '10px', border: 'none' }}
      />
    </div>
  );
};

// Componente personalizado para nodos individuales
export const PersonNode = ({ data }) => {
  return (
    <div
      style={{
        ...(data.genero === "Masculino"
          ? nodeStyles.masculine
          : nodeStyles.feminine),
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        const baseStyles = data.genero === "Masculino"
          ? nodeStyles.masculine
          : nodeStyles.feminine;
        e.currentTarget.style.boxShadow = baseStyles.boxShadow;
      }}
    >
      {/* Handle superior para conexión con padres */}
      <Handle
        type="target"
        position="top"
        id="top"
        style={{ background: '#9e9e9e', width: '10px', height: '10px', border: 'none' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, lineHeight: '1.3' }}>
          {data.nombre} {data.apellido1}
        </div>
        <div style={{ fontSize: '13px', color: '#555' }}>
          {data.genero}
        </div>
        <div style={{ fontSize: '13px', color: '#555' }}>
          Nac: {data.fechaNacimiento}
        </div>
      </div>

      {/* Handle inferior para conexión con hijos */}
      <Handle
        type="source"
        position="bottom"
        id="bottom"
        style={{ background: '#9e9e9e', width: '10px', height: '10px', border: 'none' }}
      />
    </div>
  );
};

// Los componentes son exportados y nodeTypes se ha movido a FamilyTreeNodeTypes.js
