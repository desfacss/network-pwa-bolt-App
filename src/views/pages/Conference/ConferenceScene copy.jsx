// import { Canvas } from '@react-three/fiber'
// import { OrbitControls } from '@react-three/drei'
// import * as THREE from 'three'

// const Chair = ({ position = [0, 0, 0], onSelect, booking }) => {
//   const handleClick = (e) => {
//     e.stopPropagation()
//     if (!booking && onSelect) onSelect()
//   }

//   const color = booking 
//     ? booking.seat_number === 0 
//       ? '#ffa500'  // Orange for table topic
//       : '#ff4444'   // Red for booked
//     : '#4caf50'     // Green for available

//   return (
//     <mesh position={position} onClick={handleClick}>
//       <sphereGeometry args={[0.5, 32, 32]} />
//       <meshStandardMaterial 
//         color={color}
//         metalness={0.1}
//         roughness={0.5}
//       >
//         {booking && booking.seat_number !== 0 && (
//           <html>
//             <div style={{ color: 'white', fontSize: '12px' }}>
//               {booking.users?.email || booking.user_id}
//             </div>
//           </html>
//         )}
//       </meshStandardMaterial>
//     </mesh>
//   )
// }

// const ConferenceScene = ({ layout, onChairSelect, onTableSelect, bookings }) => {
//   if (!layout?.tables) {
//     console.error('Invalid layout:', layout)
//     return <div>No valid room layout provided</div>
//   }

//   const getChairBooking = (tableId, chairNumber) => {
//     return bookings.find(booking => 
//       booking.table_number === tableId && 
//       booking.seat_number === chairNumber
//     )
//   }

//   const hasTopic = (tableId) => {
//     return bookings.some(booking => 
//       booking.table_number === tableId && 
//       booking.seat_number === 0 && 
//       booking.topic
//     )
//   }

//   const handleTableClick = (tableId) => (e) => {
//     e.stopPropagation()
//     onTableSelect(tableId)
//   }

//   return (
//     <Canvas
//       shadows
//       camera={{ position: [40, 30, 40], fov: 50 }}
//       gl={{ antialias: true }}
//       onCreated={({ gl }) => {
//         gl.setClearColor(new THREE.Color('#ffffff'))
//       }}
//       style={{ height: '100%' }}
//     >
//       <ambientLight intensity={0.5} />
//       <pointLight position={[10, 10, 10]} intensity={1} castShadow />

//       <mesh 
//         rotation={[-Math.PI / 2, 0, 0]} 
//         position={[0, 0, 0]}
//         receiveShadow
//       >
//         <planeGeometry args={[80, 60]} />
//         <meshStandardMaterial color="#808080" />
//       </mesh>

//       {layout.tables.map((table) => (
//         <group key={table.id}>
//           <mesh 
//             position={[table.x || 0, 0.5, table.y || 0]}
//             castShadow
//             onClick={handleTableClick(table.id)}
//           >
//             <cylinderGeometry args={[2, 2, 1, 32]} />
//             <meshStandardMaterial 
//               color={hasTopic(table.id) ? '#8a2be2' : '#3d5afe'}
//             />
//           </mesh>

//           {Array.from({ length: table.chairs || 0 }).map((_, i) => {
//             const angle = (i * (360 / (table.chairs || 1))) * (Math.PI / 180)
//             const booking = getChairBooking(table.id, i)
//             return (
//               <Chair
//                 key={i}
//                 position={[
//                   (table.x || 0) + Math.cos(angle) * 3,
//                   0.3,
//                   (table.y || 0) + Math.sin(angle) * 3
//                 ]}
//                 onSelect={() => onChairSelect?.(table.id, i)}
//                 booking={booking}
//               />
//             )
//           })}
//         </group>
//       ))}

//       <OrbitControls
//         enablePan={true}
//         enableZoom={true}
//         enableRotate={true}
//         minDistance={10}
//         maxDistance={100}
//       />
//     </Canvas>
//   )
// }

// export default ConferenceScene





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
      ? '#ffcc99'  // Light orange for table topic
      : '#ff6666'   // Soft red for booked
    : '#99ccff'     // Light blue for available

  return (
    <mesh position={position} onClick={handleClick}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshStandardMaterial 
        color={color}
        metalness={0.1}
        roughness={0.5}
        transparent
        opacity={0.9}
      >
        {booking && booking.seat_number !== 0 && (
          <html>
            <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
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
        gl.setClearColor(new THREE.Color('#f5f5dc')) // Pale light pastel background
      }}
      style={{ height: '100%' }}
    >
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />

      {/* Floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#dcdcdc" roughness={0.8} />
      </mesh>

      {/* Walls */}
      <group>
        {/* Back wall */}
        <mesh position={[0, 15, -30]} rotation={[0, 0, 0]}>
          <boxGeometry args={[80, 30, 0.5]} />
          <meshStandardMaterial color="#e6e6fa" transparent opacity={0.8} />
        </mesh>

        {/* Left wall */}
        <mesh position={[-40, 15, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[60, 30, 0.5]} />
          <meshStandardMaterial color="#ffe4e1" transparent opacity={0.8} />
        </mesh>

        {/* Right wall with two entrances */}
        <mesh position={[40, 15, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[60, 30, 0.5]} />
          <meshStandardMaterial color="#fff0f5" transparent opacity={0.8} />
        </mesh>
        {/* Entrance gaps */}
        <mesh position={[40, 15, -10]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[10, 30, 0.5]} />
          <meshStandardMaterial color="#f5f5dc" transparent opacity={0.8} />
        </mesh>
        <mesh position={[40, 15, 10]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[10, 30, 0.5]} />
          <meshStandardMaterial color="#f5f5dc" transparent opacity={0.8} />
        </mesh>

        {/* Front wall */}
        <mesh position={[0, 15, 30]} rotation={[0, 0, 0]}>
          <boxGeometry args={[80, 30, 0.5]} />
          <meshStandardMaterial color="#faf0e6" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Tables and Chairs */}
      {layout.tables.map((table) => (
        <group key={table.id}>
          {/* Table */}
          <mesh 
            position={[table.x || 0, 0.5, table.y || 0]}
            castShadow
            onClick={handleTableClick(table.id)}
          >
            <cylinderGeometry args={[2, 2, 0.8, 32]} />
            <meshStandardMaterial 
              color={hasTopic(table.id) ? '#c7a4ff' : '#b3d9ff'} // Pastel purple and blue
              roughness={0.6}
            />
          </mesh>

          {/* Chairs */}
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

      {/* Orbit Controls */}
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


// import { Canvas } from '@react-three/fiber'
// import { OrbitControls } from '@react-three/drei'
// import * as THREE from 'three'

// // Luxurious Chair Component
// const Chair = ({ position = [0, 0, 0], onSelect, booking }) => {
//   const handleClick = (e) => {
//     e.stopPropagation()
//     if (!booking && onSelect) onSelect()
//   }

//   const color = booking 
//     ? booking.seat_number === 0 
//       ? '#ffcc99'  // Light orange for table topic
//       : '#ff6666'   // Soft red for booked
//     : '#99ccff'     // Light blue for available

//   return (
//     <mesh position={position} onClick={handleClick}>
//       {/* Chair Base */}
//       <cylinderGeometry args={[0.3, 0.3, 0.8, 32]} />
//       <meshStandardMaterial 
//         color="#4d331f" // Dark wood color
//         metalness={0.2}
//         roughness={0.8}
//       />

//       {/* Chair Backrest */}
//       <mesh position={[0, 1.2, 0]}>
//         <boxGeometry args={[0.8, 1.2, 0.1]} />
//         <meshStandardMaterial 
//           color="#ffffff" // White cushioned backrest
//           metalness={0.1}
//           roughness={0.5}
//         />
//       </mesh>

//       {/* Chair Seat */}
//       <mesh position={[0, 0.5, 0]}>
//         <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
//         <meshStandardMaterial 
//           color="#ffffff" // White cushioned seat
//           metalness={0.1}
//           roughness={0.5}
//         />
//       </mesh>
//     </mesh>
//   )
// }

// // Luxurious Table Component
// const Table = ({ position = [0, 0, 0], onClick, hasTopic }) => {
//   return (
//     <group position={position} onClick={onClick}>
//       {/* Table Top */}
//       <mesh position={[0, 0.5, 0]}>
//         <cylinderGeometry args={[2, 2, 0.2, 32]} />
//         <meshStandardMaterial 
//           color={hasTopic ? '#c7a4ff' : '#b3d9ff'} // Pastel purple or blue
//           metalness={0.2}
//           roughness={0.6}
//         />
//       </mesh>

//       {/* Table Legs */}
//       <mesh position={[-1.5, 0.25, -1.5]}>
//         <cylinderGeometry args={[0.1, 0.1, 0.5, 32]} />
//         <meshStandardMaterial 
//           color="#4d331f" // Dark wood color
//           metalness={0.2}
//           roughness={0.8}
//         />
//       </mesh>
//       <mesh position={[1.5, 0.25, -1.5]}>
//         <cylinderGeometry args={[0.1, 0.1, 0.5, 32]} />
//         <meshStandardMaterial 
//           color="#4d331f"
//           metalness={0.2}
//           roughness={0.8}
//         />
//       </mesh>
//       <mesh position={[-1.5, 0.25, 1.5]}>
//         <cylinderGeometry args={[0.1, 0.1, 0.5, 32]} />
//         <meshStandardMaterial 
//           color="#4d331f"
//           metalness={0.2}
//           roughness={0.8}
//         />
//       </mesh>
//       <mesh position={[1.5, 0.25, 1.5]}>
//         <cylinderGeometry args={[0.1, 0.1, 0.5, 32]} />
//         <meshStandardMaterial 
//           color="#4d331f"
//           metalness={0.2}
//           roughness={0.8}
//         />
//       </mesh>

//       {/* Luxury Tablecloth Effect */}
//       <mesh position={[0, 0.6, 0]}>
//         <cylinderGeometry args={[2.2, 2.2, 0.05, 32]} />
//         <meshStandardMaterial 
//           color="#ffffff" // White fabric
//           metalness={0.1}
//           roughness={0.3}
//           transparent
//           opacity={0.9}
//         />
//       </mesh>
//     </group>
//   )
// }

// const ConferenceScene = ({ layout, onChairSelect, onTableSelect, bookings }) => {
//   if (!layout?.tables) {
//     console.error('Invalid layout:', layout)
//     return <div>No valid room layout provided</div>
//   }

//   const getChairBooking = (tableId, chairNumber) => {
//     return bookings.find(booking => 
//       booking.table_number === tableId && 
//       booking.seat_number === chairNumber
//     )
//   }

//   const hasTopic = (tableId) => {
//     return bookings.some(booking => 
//       booking.table_number === tableId && 
//       booking.seat_number === 0 && 
//       booking.topic
//     )
//   }

//   const handleTableClick = (tableId) => (e) => {
//     e.stopPropagation()
//     onTableSelect(tableId)
//   }

//   return (
//     <Canvas
//       shadows
//       camera={{ position: [40, 30, 40], fov: 50 }}
//       gl={{ antialias: true }}
//       onCreated={({ gl }) => {
//         gl.setClearColor(new THREE.Color('#f5f5dc')) // Pale light pastel background
//       }}
//       style={{ height: '100%' }}
//     >
//       {/* Ambient and directional lighting */}
//       <ambientLight intensity={0.7} />
//       <directionalLight position={[10, 10, 10]} intensity={1} castShadow />

//       {/* Floor */}
//       <mesh 
//         rotation={[-Math.PI / 2, 0, 0]} 
//         position={[0, 0, 0]}
//         receiveShadow
//       >
//         <planeGeometry args={[80, 60]} />
//         <meshStandardMaterial color="#dcdcdc" roughness={0.8} />
//       </mesh>

//       {/* Walls */}
//       <group>
//         {/* Back Wall */}
//         <mesh position={[0, 1, -30]} rotation={[0, 0, 0]}>
//           <boxGeometry args={[80, 2, 0.5]} /> {/* Transparent up to 2 feet */}
//           <meshStandardMaterial color="#e6e6fa" transparent opacity={0.8} />
//         </mesh>
//         <mesh position={[0, 16, -30]} rotation={[0, 0, 0]}>
//           <boxGeometry args={[80, 30, 0.5]} /> {/* Opaque above 2 feet */}
//           <meshStandardMaterial color="#e6e6fa" />
//         </mesh>

//         {/* Left Wall */}
//         <mesh position={[-40, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
//           <boxGeometry args={[60, 2, 0.5]} />
//           <meshStandardMaterial color="#ffe4e1" transparent opacity={0.8} />
//         </mesh>
//         <mesh position={[-40, 16, 0]} rotation={[0, Math.PI / 2, 0]}>
//           <boxGeometry args={[60, 30, 0.5]} />
//           <meshStandardMaterial color="#ffe4e1" />
//         </mesh>

//         {/* Right Wall with Two Entrances */}
//         <mesh position={[40, 1, 0]} rotation={[0, -Math.PI / 2, 0]}>
//           <boxGeometry args={[60, 2, 0.5]} />
//           <meshStandardMaterial color="#fff0f5" transparent opacity={0.8} />
//         </mesh>
//         <mesh position={[40, 16, 0]} rotation={[0, -Math.PI / 2, 0]}>
//           <boxGeometry args={[60, 30, 0.5]} />
//           <meshStandardMaterial color="#fff0f5" />
//         </mesh>
//         {/* Entrance Gaps */}
//         <mesh position={[40, 1, -10]} rotation={[0, -Math.PI / 2, 0]}>
//           <boxGeometry args={[10, 2, 0.5]} />
//           <meshStandardMaterial color="#f5f5dc" transparent opacity={0.8} />
//         </mesh>
//         <mesh position={[40, 16, -10]} rotation={[0, -Math.PI / 2, 0]}>
//           <boxGeometry args={[10, 30, 0.5]} />
//           <meshStandardMaterial color="#f5f5dc" />
//         </mesh>
//         <mesh position={[40, 1, 10]} rotation={[0, -Math.PI / 2, 0]}>
//           <boxGeometry args={[10, 2, 0.5]} />
//           <meshStandardMaterial color="#f5f5dc" transparent opacity={0.8} />
//         </mesh>
//         <mesh position={[40, 16, 10]} rotation={[0, -Math.PI / 2, 0]}>
//           <boxGeometry args={[10, 30, 0.5]} />
//           <meshStandardMaterial color="#f5f5dc" />
//         </mesh>

//         {/* Front Wall */}
//         <mesh position={[0, 1, 30]} rotation={[0, 0, 0]}>
//           <boxGeometry args={[80, 2, 0.5]} />
//           <meshStandardMaterial color="#faf0e6" transparent opacity={0.8} />
//         </mesh>
//         <mesh position={[0, 16, 30]} rotation={[0, 0, 0]}>
//           <boxGeometry args={[80, 30, 0.5]} />
//           <meshStandardMaterial color="#faf0e6" />
//         </mesh>
//       </group>

//       {/* Tables and Chairs */}
//       {layout.tables.map((table) => (
//         <group key={table.id}>
//           {/* Table */}
//           <Table
//             position={[table.x || 0, 0, table.y || 0]}
//             onClick={handleTableClick(table.id)}
//             hasTopic={hasTopic(table.id)}
//           />

//           {/* Chairs */}
//           {Array.from({ length: table.chairs || 0 }).map((_, i) => {
//             const angle = (i * (360 / (table.chairs || 1))) * (Math.PI / 180)
//             const booking = getChairBooking(table.id, i)
//             return (
//               <Chair
//                 key={i}
//                 position={[
//                   (table.x || 0) + Math.cos(angle) * 3,
//                   0,
//                   (table.y || 0) + Math.sin(angle) * 3
//                 ]}
//                 onSelect={() => onChairSelect?.(table.id, i)}
//                 booking={booking}
//               />
//             )
//           })}
//         </group>
//       ))}

//       {/* Orbit Controls */}
//       <OrbitControls
//         enablePan={true}
//         enableZoom={true}
//         enableRotate={true}
//         minDistance={10}
//         maxDistance={100}
//       />
//     </Canvas>
//   )
// }

// export default ConferenceScene