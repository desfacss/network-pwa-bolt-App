// src/views/pages/Conference/ConferenceScene.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const ConferenceScene = ({ layout = [], bookings = [], onChairSelect, onTableSelect }) => {
  return (
    <Canvas camera={{ position: [0, 10, 20], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* Render tables */}
      {layout.map((table) => (
        <mesh
          key={table.id}
          position={[table.x, 0, table.y]}
          onClick={() => onTableSelect?.(table.id)}
        >
          <boxGeometry args={[2, 0.1, 2]} /> {/* Simplified table representation */}
          <meshStandardMaterial color="#4ECDC4" />
          {/* Render chairs around the table */}
          {Array.from({ length: table.chairs }, (_, i) => {
            const angle = (2 * Math.PI * i) / table.chairs;
            const radius = 1.5;
            const chairX = table.x + radius * Math.cos(angle);
            const chairZ = table.y + radius * Math.sin(angle);
            const isBooked = bookings.some(
              (b) => b.table_id === table.id && b.seat_number === i + 1
            );
            return (
              <mesh
                key={`${table.id}-chair-${i}`}
                position={[chairX, 0.5, chairZ]}
                onClick={(e) => {
                  e.stopPropagation();
                  onChairSelect?.(table.id, i + 1);
                }}
              >
                <boxGeometry args={[0.5, 1, 0.5]} />
                <meshStandardMaterial color={isBooked ? '#FF6B6B' : '#FFFFFF'} />
              </mesh>
            );
          })}
        </mesh>
      ))}

      <OrbitControls />
    </Canvas>
  );
};

export default ConferenceScene;