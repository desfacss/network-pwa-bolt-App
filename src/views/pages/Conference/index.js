import { useState, useEffect } from 'react'
import RoomPage from './RoomPage'
import { supabase } from 'configs/SupabaseConfig'

const ParentComponent = () => {
  const [roomData, setRoomData] = useState(null)
  const [sessionData, setSessionData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: room, error: roomError } = await supabase
        .from('conference_rooms')
        .select('*')
        .eq('id', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22')
        .single()

      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44')
        .single()

      if (roomError) console.error('Room fetch error:', roomError)
      if (sessionError) console.error('Session fetch error:', sessionError)

      setRoomData(room)
      setSessionData(session)
    }
    fetchData()
  }, [])

  if (!roomData || !sessionData) {
    return <div>Loading...</div>
  }

  return (
    <RoomPage 
      room={roomData}
      session={sessionData}
    />
  )
}

export default ParentComponent