import React, { useState, useEffect } from 'react';

const MemberModal = ({ isOpen, onClose, onSave, member, allMembers }) => {
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    apellido1: '',
    apellido2: '',
    genero: 'Masculino',
    fechaNacimiento: '',
    fechaDefuncion: '',
    activo: true,
    biografia: 1,
    relaciones: []
  });

  const [selectedSpouse, setSelectedSpouse] = useState('');
  const [selectedParents, setSelectedParents] = useState([]);

  useEffect(() => {
    if (member) {
      setFormData(member);
      // Extract existing relationships
      const spouseRel = member.relaciones?.find(r => r.tipo === 'conyuge');
      const parentRels = member.relaciones?.filter(r => r.tipo === 'progenitor');
      
      setSelectedSpouse(spouseRel ? spouseRel.idRelacion.toString() : '');
      setSelectedParents(parentRels ? parentRels.map(r => r.idRelacion) : []);
    } else {
      // New member - generate ID
      const maxId = allMembers.reduce((max, m) => Math.max(max, m.id), 0);
      setFormData({
        id: maxId + 1,
        nombre: '',
        apellido1: '',
        apellido2: '',
        genero: 'Masculino',
        fechaNacimiento: '',
        fechaDefuncion: '',
        activo: true,
        biografia: 1,
        relaciones: []
      });
      setSelectedSpouse('');
      setSelectedParents([]);
    }
  }, [member, allMembers, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build relationships array
    const relaciones = [];
    
    // Add spouse relationship
    if (selectedSpouse) {
      relaciones.push({
        tipo: 'conyuge',
        idRelacion: parseInt(selectedSpouse)
      });
    }
    
    // Add parent relationships
    selectedParents.forEach(parentId => {
      relaciones.push({
        tipo: 'progenitor',
        idRelacion: parentId
      });
    });

    const updatedMember = {
      ...formData,
      id: parseInt(formData.id),
      relaciones
    };

    onSave(updatedMember);
  };

  const handleParentToggle = (parentId) => {
    setSelectedParents(prev => {
      if (prev.includes(parentId)) {
        return prev.filter(id => id !== parentId);
      } else {
        return [...prev, parentId];
      }
    });
  };

  if (!isOpen) return null;

  // Filter available spouses (opposite gender, not current member)
  const availableSpouses = allMembers.filter(m => 
    m.id !== formData.id && 
    m.genero !== formData.genero
  );

  // Filter available parents (not current member)
  const availableParents = allMembers.filter(m => m.id !== formData.id);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .modal-content {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '650px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '28px', fontSize: '28px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
          {member ? '✏️ Editar Miembro' : '➕ Agregar Miembro'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Basic Info */}
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '14px' }}>Información Personal</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Juan"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #e0e0e0',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      ':focus': { borderColor: '#4CAF50', boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)' }
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4CAF50';
                      e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                    Género *
                  </label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #e0e0e0',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4CAF50';
                      e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                    Apellido 1 *
                  </label>
                  <input
                    type="text"
                    name="apellido1"
                    value={formData.apellido1}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Pérez"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #e0e0e0',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4CAF50';
                      e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                    Apellido 2
                  </label>
                  <input
                    type="text"
                    name="apellido2"
                    value={formData.apellido2}
                    onChange={handleChange}
                    placeholder="Ej: Rodríguez"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #e0e0e0',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4CAF50';
                      e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '14px' }}>Fechas Importantes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #e0e0e0',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4CAF50';
                      e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                    Fecha de Defunción
                  </label>
                  <input
                    type="date"
                    name="fechaDefuncion"
                    value={formData.fechaDefuncion || ''}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #e0e0e0',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4CAF50';
                      e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Relationships */}
            <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '14px' }}>Relaciones Familiares</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                  👥 Cónyuge
                </label>
                <select
                  value={selectedSpouse}
                  onChange={(e) => setSelectedSpouse(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #e0e0e0',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Sin cónyuge</option>
                  {availableSpouses.map(spouse => (
                    <option key={spouse.id} value={spouse.id}>
                      {spouse.nombre} {spouse.apellido1} {spouse.apellido2}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                  👨‍👩‍👧‍👦 Progenitores
                </label>
                <div style={{
                  maxHeight: '180px',
                  overflow: 'auto',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: '#fafafa'
                }}>
                  {availableParents.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999', margin: 0, padding: '20px 0' }}>
                      No hay más personas disponibles
                    </p>
                  ) : (
                    availableParents.map(parent => (
                      <label
                        key={parent.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f0f0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedParents.includes(parent.id)}
                          onChange={() => handleParentToggle(parent.id)}
                          style={{ marginRight: '12px', cursor: 'pointer', width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '14px', color: '#333' }}>
                          {parent.nombre} {parent.apellido1}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px', paddingTop: '24px', borderTop: '2px solid #f0f0f0' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 28px',
                  borderRadius: '8px',
                  border: '1.5px solid #e0e0e0',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#666',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f5f5f5';
                  e.target.style.borderColor = '#d0d0d0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  padding: '12px 28px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#45a049';
                  e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#4CAF50';
                  e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ✓ Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberModal;
