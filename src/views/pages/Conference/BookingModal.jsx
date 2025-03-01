import { Modal, Button } from 'antd'

const BookingModal = ({ visible, table, chair, onCancel, onConfirm }) => {
  const handleSubmit = async () => {
    await onConfirm({
      tableId: table.id,
      chairNumber: chair
    })
  }

  return (
    <Modal
      title={`Book Table ${table.id} - Chair ${chair}`}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Confirm Booking
        </Button>
      ]}
    >
      <p>Confirm your booking for Table {table.id}, Chair {chair}</p>
    </Modal>
  )
}

export default BookingModal