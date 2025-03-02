// RoomPage.js
import React, { useState, useEffect } from 'react';
import ConferenceLayout from './ConferenceLayout';
import BookingModal from './BookingModal';
import { useBookings } from './useBookings';
import { supabase } from 'configs/SupabaseConfig';


const RoomPage = ({ room, session }) => {
  const [selectedChair, setSelectedChair] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const { bookings, addBooking, updateBooking, deleteBooking } = useBookings(session?.id || null);

  // Transform room data into ConferenceLayout config format
  const conferenceConfig = {
    rooms: {
      [room.name]: {
        color: room.color || '#FF6B6B',
        tables: room.layout_config?.tables?.map((table) => ({
          id: table.id,
          chairs: table.chairs,
          x: table.x,
          y: table.y,
          type: table.type || 'round',
        })) || [],
      },
    },
  };

  const handleChairSelect = async (tableId, chairNumber) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      alert('Please login to book seats');
      return;
    }
    setSelectedChair({ tableId, chairNumber });
    setSelectedTable(null);
  };

  const handleTableSelect = async (tableId) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      alert('Please login to set table topics');
      return;
    }
    setSelectedTable(tableId);
    setSelectedChair(null);
  };

  const handleBookingConfirm = async (data) => {
    if (!session?.id) {
      alert('No active session selected');
      return;
    }

    const user = (await supabase.auth.getUser()).data.user;
    const existingBooking = bookings.find((b) => b.user_id === user.id && b.seat_number !== 0);

    if (existingBooking) {
      await deleteBooking(existingBooking.id); // Remove previous chair booking
    }

    const { error } = await addBooking({
      table_id: data.tableId,
      seat_number: data.chairNumber,
    });

    if (!error) setSelectedChair(null);
  };

  const handleTableTopicConfirm = async (data) => {
    if (!session?.id) {
      alert('No active session selected');
      return;
    }

    const user = (await supabase.auth.getUser()).data.user;
    const existingTopic = bookings.find((b) => b.table_number === data.tableId && b.seat_number === 0);
    const existingLeaderBooking = bookings.find((b) => b.user_id === user.id && b.seat_number !== 0);

    if (existingLeaderBooking) {
      await deleteBooking(existingLeaderBooking.id); // Remove previous chair booking if shifting tables
    }

    if (existingTopic) {
      const { error } = await updateBooking(existingTopic.id, {
        topic: data.topic,
        user_id: user.id, // Update leader to current user
      });
      // Assign or update chair 1 to the new leader
      const chair1Booking = bookings.find((b) => b.table_number === data.tableId && b.seat_number === 1);
      if (chair1Booking && chair1Booking.user_id !== user.id) {
        await deleteBooking(chair1Booking.id);
      }
      await addBooking({
        table_id: data.tableId,
        seat_number: 1,
      });
      if (!error) setSelectedTable(null);
    } else {
      const { error } = await Promise.all([
        addBooking({
          table_id: data.tableId,
          seat_number: 0,
          topic: data.topic,
        }),
        addBooking({
          table_id: data.tableId,
          seat_number: 1,
        }),
      ]);
      if (!error) setSelectedTable(null);
    }
  };

  useEffect(() => {
    console.log('RoomPage state:', { selectedChair, selectedTable, bookings });
  }, [selectedChair, selectedTable, bookings]);

  if (!room || !session) {
    return <div>Loading room and session data...</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <ConferenceLayout
        config={conferenceConfig}
        bookings={bookings}
        onChairSelect={handleChairSelect}
        onTableSelect={handleTableSelect}
      />

      <BookingModal
        visible={!!selectedChair || !!selectedTable}
        table={{ id: selectedChair?.tableId || selectedTable }}
        chair={selectedChair?.chairNumber}
        onCancel={() => {
          setSelectedChair(null);
          setSelectedTable(null);
        }}
        onConfirm={selectedChair ? handleBookingConfirm : handleTableTopicConfirm}
        isTableTopic={!selectedChair && !!selectedTable}
        existingTopic={bookings.find((b) => b.table_number === selectedTable && b.seat_number === 0)?.topic}
      />
    </div>
  );
};

export default RoomPage;