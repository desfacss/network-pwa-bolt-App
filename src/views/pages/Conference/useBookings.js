import { useEffect, useState } from 'react'
import { supabase } from 'configs/SupabaseConfig'

export const useBookings = (sessionId) => {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    if (!sessionId) {
      setBookings([])
      return
    }

    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('session_id', sessionId)
      
      if (!error && data) {
        setBookings(data)
      }
    }

    fetchBookings()

    const channel = supabase
      .channel('bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setBookings(current => {
          if (payload.eventType === 'DELETE') {
            return current.filter(b => b.id !== payload.old.id)
          }
          if (payload.eventType === 'INSERT') {
            return [...current, payload.new]
          }
          if (payload.eventType === 'UPDATE') {
            return current.map(b => b.id === payload.new.id ? payload.new : b)
          }
          return current
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  const addBooking = async (booking) => {
    if (!sessionId) {
      return { data: null, error: new Error('No session ID provided') }
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: (await supabase.auth.getUser()).data.user?.id,
        session_id: sessionId,
        table_number: booking.table_id,
        seat_number: booking.seat_number
      }])
      .select()
    
    if (!error && data) {
      setBookings([...bookings, data[0]])
    }
    return { data, error }
  }

  return { bookings, addBooking }
}