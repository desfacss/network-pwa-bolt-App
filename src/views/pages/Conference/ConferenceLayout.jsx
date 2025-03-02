// ConferenceLayout.js
import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ConferenceScene from './ConferenceScene'; // Ensure this path is correct

const ConferenceLayout = ({ config, bookings = [], onChairSelect, onTableSelect }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const handleRoomSelect = (roomName) => {
    setSelectedRoom(roomName);
    setSelectedTable(null);
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      {/* Floor Plan View */}
      {!selectedRoom && (
        <Canvas camera={{ position: [0, 20, 20], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 15, 10]} intensity={1} />
          {Object.entries(config.rooms).map(([name, room], index) => (
            <mesh
              key={name}
              position={[index * 12 - 10, 0, 0]}
              onClick={() => handleRoomSelect(name)}
            >
              <boxGeometry args={[8, 0.1, 8]} />
              <meshStandardMaterial
                color={room.color || '#FF6B6B'}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
          <OrbitControls />
        </Canvas>
      )}

      {/* Room Detail View */}
      {selectedRoom && (
        <ConferenceScene
          layout={config.rooms[selectedRoom].tables}
          bookings={bookings}
          onChairSelect={onChairSelect}
          onTableSelect={(tableId) => {
            setSelectedTable(tableId);
            onTableSelect?.(tableId);
          }}
        />
      )}

      {/* UI Overlay */}
      {selectedRoom && (
        <div style={{ position: 'absolute', top: 20, left: 20, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: 300, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <button style={{ background: 'none', border: 'none', color: '#F84464', fontSize: 16, cursor: 'pointer', marginRight: 10, padding: 0 }} onClick={() => setSelectedRoom(null)}>
              ← Back
            </button>
            <h2 style={{ margin: 0, color: '#333', fontSize: 24 }}>{selectedRoom}</h2>
          </div>
          <div style={{ display: 'grid', gap: 15 }}>
            {config.rooms[selectedRoom].tables.map((table, index) => (
              <div
                key={table.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  padding: 15,
                  border: `2px solid ${selectedTable === table.id ? '#F84464' : '#eee'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedTable(table.id)}
              >
                <h3 style={{ margin: 0, color: '#333', fontSize: 16, fontWeight: '600' }}>Table {index + 1}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', color: '#666', fontSize: 14 }}>
                  <span>Type: {table.chairs <= 8 ? 'Round' : 'Rectangular'}</span>
                  <span>Chairs: {table.chairs}</span>
                </div>
                {selectedTable === table.id && (
                  <button
                    style={{
                      backgroundColor: '#F84464',
                      color: 'white',
                      border: 'none',
                      borderRadius: 5,
                      padding: '8px 16px',
                      width: '100%',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s',
                    }}
                    onClick={() => onTableSelect?.(table.id)}
                  >
                    Book Table
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceLayout;