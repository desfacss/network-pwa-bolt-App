import { Modal, Button, Input } from 'antd'
import { useState, useEffect } from 'react'

const BookingModal = ({ visible, table, chair, onCancel, onConfirm, isTableTopic, existingTopic }) => {
  const [topic, setTopic] = useState('')

  useEffect(() => {
    if (isTableTopic && existingTopic) {
      setTopic(existingTopic)
    } else {
      setTopic('')
    }
  }, [isTableTopic, existingTopic])

  const handleSubmit = async () => {
    await onConfirm({
      tableId: table.id,
      chairNumber: chair,
      topic: topic || undefined
    })
    if (!isTableTopic) setTopic('') // Only clear for chair bookings
  }

  return (
    <Modal
      title={isTableTopic 
        ? `Set Topic for Table ${table.id}` 
        : `Book Table ${table.id} - Chair ${chair}`}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {isTableTopic ? 'Update Topic' : 'Confirm Booking'}
        </Button>
      ]}
    >
      {isTableTopic ? (
        <div>
          <p>Set a networking topic for Table {table.id}</p>
          <Input
            placeholder="Enter topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
      ) : (
        <p>Confirm your booking for Table {table.id}, Chair {chair}</p>
      )}
    </Modal>
  )
}

export default BookingModal