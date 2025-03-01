import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three' // Explicitly import Three.js

const Chair = ({ position, onSelect, isOccupied }) => {
  const handleClick = (e) => {
    e.stopPropagation()
    if (!isOccupied) onSelect()
  }

  return (
    <mesh position={position || [0, 0, 0]} onClick={handleClick}>
      <sphereGeometry args={[0.5, 32, 32]} /> {/* Added segments for better geometry */}
      <meshStandardMaterial 
        color={isOccupied ? "#ff4444" : "#4caf50"} 
        metalness={0.1}
        roughness={0.5}
      />
    </mesh>
  )
}

const ConferenceScene = ({ layout, onChairSelect, bookings }) => {
  // Add safety checks for props
  if (!layout || !layout.tables || !Array.isArray(layout.tables)) {
    console.error('Invalid layout prop:', layout)
    return <div>Invalid room layout</div>
  }

  if (!bookings || !Array.isArray(bookings)) {
    console.warn('Invalid bookings prop:', bookings)
  }

  const isChairOccupied = (tableId, chairNumber) => {
    if (!bookings) return false
    return bookings.some(booking => 
      booking.table_number === tableId && 
      booking.seat_number === chairNumber
    )
  }

  return (
    <Canvas
      camera={{ position: [40, 30, 40], fov: 50 }}
      gl={{ antialias: true }} // Add WebGL options
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#ffffff')) // Set background color
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Tables and Chairs */}
      {layout.tables.map((table) => (
        <group key={table.id}>
          <mesh position={[table.x || 0, 0.5, table.y || 0]}>
            <cylinderGeometry args={[2, 2, 1, 32]} />
            <meshStandardMaterial color="#3d5afe" />
          </mesh>

          {Array.from({ length: table.chairs || 0 }).map((_, i) => {
            const angle = (i * (360 / (table.chairs || 1))) * (Math.PI / 180)
            return (
              <Chair
                key={i}
                position={[
                  (table.x || 0) + Math.cos(angle) * 3,
                  0.3,
                  (table.y || 0) + Math.sin(angle) * 3
                ]}
                onSelect={() => onChairSelect(table.id, i)}
                isOccupied={isChairOccupied(table.id, i)}
              />
            )
          })}
        </group>
      ))}

      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={10}
        maxDistance={100}
      />
    </Canvas>
  )
}

export default ConferenceScene