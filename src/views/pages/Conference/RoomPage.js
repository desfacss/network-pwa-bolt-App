import { useState, useEffect } from 'react'
import { supabase } from 'configs/SupabaseConfig'
import ConferenceScene from './ConferenceScene'
import BookingModal from './BookingModal'
import { useBookings } from './useBookings'

const RoomPage = ({ room, session }) => {
  const [selectedChair, setSelectedChair] = useState(null)
  const { bookings, addBooking } = useBookings(session?.id || null)

  const handleChairSelect = async (tableId, chairNumber) => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      alert('Please login to book seats')
      return
    }
    setSelectedChair({ tableId, chairNumber })
  }

  const handleBookingConfirm = async (data) => {
    if (!session?.id) {
      alert('No active session selected')
      return
    }
    
    const { error } = await addBooking({
      table_id: data.tableId,
      seat_number: data.chairNumber
    })

    if (!error) setSelectedChair(null)
  }

  useEffect(() => {
    console.log('RoomPage props:', { room, session, bookings })
  }, [room, session, bookings])

  if (!room || !session) {
    return <div>Loading room and session data...</div>
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ConferenceScene
        layout={room.layout_config}
        onChairSelect={handleChairSelect}
        bookings={bookings || []}
      />
      
      <BookingModal
        visible={!!selectedChair}
        table={{ id: selectedChair?.tableId }}
        chair={selectedChair?.chairNumber}
        onCancel={() => setSelectedChair(null)}
        onConfirm={handleBookingConfirm}
      />
    </div>
  )
}

export default RoomPage