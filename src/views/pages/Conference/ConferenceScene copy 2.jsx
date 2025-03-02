import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const Chair = ({ position = [0, 0, 0], onSelect, booking }) => {
  const handleClick = (e) => {
    e.stopPropagation()
    if (!booking && onSelect) onSelect()
  }

  const color = booking 
    ? booking.seat_number === 0 
      ? '#ffa500'  // Orange for table topic
      : '#ff4444'   // Red for booked
    : '#4caf50'     // Green for available

  return (
    <mesh position={position} onClick={handleClick}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial 
        color={color}
        metalness={0.1}
        roughness={0.5}
      >
        {booking && booking.seat_number !== 0 && (
          <html>
            <div style={{ color: 'white', fontSize: '12px' }}>
              {booking.users?.email || booking.user_id}
            </div>
          </html>
        )}
      </meshStandardMaterial>
    </mesh>
  )
}

const ConferenceScene = ({ layout, onChairSelect, onTableSelect, bookings }) => {
  if (!layout?.tables) {
    console.error('Invalid layout:', layout)
    return <div>No valid room layout provided</div>
  }

  const getChairBooking = (tableId, chairNumber) => {
    return bookings.find(booking => 
      booking.table_number === tableId && 
      booking.seat_number === chairNumber
    )
  }

  const hasTopic = (tableId) => {
    return bookings.some(booking => 
      booking.table_number === tableId && 
      booking.seat_number === 0 && 
      booking.topic
    )
  }

  const handleTableClick = (tableId) => (e) => {
    e.stopPropagation()
    onTableSelect(tableId)
  }

  return (
    <Canvas
      shadows
      camera={{ position: [40, 30, 40], fov: 50 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#ffffff'))
      }}
      style={{ height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />

      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {layout.tables.map((table) => (
        <group key={table.id}>
          <mesh 
            position={[table.x || 0, 0.5, table.y || 0]}
            castShadow
            onClick={handleTableClick(table.id)}
          >
            <cylinderGeometry args={[2, 2, 1, 32]} />
            <meshStandardMaterial 
              color={hasTopic(table.id) ? '#8a2be2' : '#3d5afe'}
            />
          </mesh>

          {Array.from({ length: table.chairs || 0 }).map((_, i) => {
            const angle = (i * (360 / (table.chairs || 1))) * (Math.PI / 180)
            const booking = getChairBooking(table.id, i)
            return (
              <Chair
                key={i}
                position={[
                  (table.x || 0) + Math.cos(angle) * 3,
                  0.3,
                  (table.y || 0) + Math.sin(angle) * 3
                ]}
                onSelect={() => onChairSelect?.(table.id, i)}
                booking={booking}
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