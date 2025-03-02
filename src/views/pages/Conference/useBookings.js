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
        .select(`
          id,
          user_id,
          session_id,
          table_number,
          seat_number,
          topic,
          created_at,
          users!bookings_user_id_fkey(email)
        `)
        .eq('session_id', sessionId)

      if (error) {
        console.error('Error fetching bookings:', error)
      } else if (data) {
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

    const user = (await supabase.auth.getUser()).data.user
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: user.id,
        session_id: sessionId,
        table_number: booking.table_id,
        seat_number: booking.seat_number,
        topic: booking.topic
      }])
      .select(`
        id,
        user_id,
        session_id,
        table_number,
        seat_number,
        topic,
        created_at,
        users!bookings_user_id_fkey(email)
      `)

    if (!error && data) {
      setBookings([...bookings, data[0]])
    }
    return { data, error }
  }

  const updateBooking = async (bookingId, updates) => {
    const user = (await supabase.auth.getUser()).data.user
    const { data, error } = await supabase
      .from('bookings')
      .update({ ...updates, user_id: user.id })
      .eq('id', bookingId)
      .select(`
        id,
        user_id,
        session_id,
        table_number,
        seat_number,
        topic,
        created_at,
        users!bookings_user_id_fkey(email)
      `)

    if (!error && data) {
      setBookings(current => current.map(b => b.id === bookingId ? data[0] : b))
    }
    return { data, error }
  }

  const deleteBooking = async (bookingId) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (!error) {
      setBookings(current => current.filter(b => b.id !== bookingId))
    }
    return { error }
  }

  return { bookings, addBooking, updateBooking, deleteBooking }
}