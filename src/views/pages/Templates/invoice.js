import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Table,
  Typography,
  Divider,
  Row,
  Col,
} from 'antd';

const InvoiceEntryPage = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [count, setCount] = useState(0);

  // Columns for the editable table
  const columns = [
    {
      title: 'Service Description',
      dataIndex: 'description',
      width: '35%',
      editable: true,
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      width: '15%',
      editable: true,
    },
    {
      title: 'Rate ($)',
      dataIndex: 'rate',
      width: '15%',
      editable: true,
    },
    {
      title: 'Amount ($)',
      dataIndex: 'amount',
      width: '15%',
      render: (_, record) =>
        record.hours && record.rate ? (record.hours * record.rate).toFixed(2) : '0.00',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Typography.Link
            onClick={() => handleDelete(record.key)}
            style={{ color: 'red' }}
          >
            Delete
          </Typography.Link>
        ) : null,
    },
  ];

  // Handle adding a new row
  const handleAdd = () => {
    const newRow = {
      key: count,
      description: '',
      hours: 0,
      rate: 0,
      amount: 0,
    };
    setDataSource([...dataSource, newRow]);
    setCount(count + 1);
  };

  // Handle deleting a row
  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  // Handle saving changes to a row
  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });
      setDataSource(newData);
    }
  };

  // Merge columns with editable functionality
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  // Custom Editable Cell Component
  const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  // Calculate subtotal, VAT, and total
  const calculateSubtotal = () => {
    return dataSource.reduce((sum, item) => sum + (item.hours || 0) * (item.rate || 0), 0);
  };

  const calculateVat = (subtotal, vatPercent = 20) => (subtotal * vatPercent) / 100;

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const vat = calculateVat(subtotal);
    return subtotal + vat;
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header Section */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col span={12}>
          <img loading="lazy"
            src="https://via.placeholder.com/150"
            alt="Company Logo"
            style={{ height: '80px', marginBottom: 16 }}
          />
          <Typography.Text strong>From:</Typography.Text>
          <Typography.Paragraph style={{ margin: 0 }}>
            Your Company Name
            <br />
            123 Your Street, Your City, Your Country
            <br />
            Phone: 123-456-7890
            <br />
            Email: info@yourcompany.com
          </Typography.Paragraph>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Typography.Title level={3}>INVOICE</Typography.Title>
          <Typography.Text>
            Invoice Number: INV-100001
            <br />
            Date: 2023-01-01
            <br />
            Due Date: 2023-01-15
          </Typography.Text>
        </Col>
      </Row>

      {/* To Address Section */}
      <Divider />
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Typography.Text strong>Bill To:</Typography.Text>
          <Typography.Paragraph style={{ margin: 0 }}>
            Client Name
            <br />
            Client Company
            <br />
            456 Their Street, Their City, Their Country
            <br />
            Phone: 098-765-4321
            <br />
            Email: contact@clientcompany.com
          </Typography.Paragraph>
        </Col>
        <Col span={12}></Col>
      </Row>

      {/* Service Line Items Table */}
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={dataSource}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
          scroll={{ x: 800 }}
          style={{ marginBottom: 24 }}
        />
      </Form>

      {/* Add Row Button */}
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 24 }}>
        Add Service Line
      </Button>

      {/* Invoice Summary */}
      <Row justify="end" gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Typography.Title level={5}>Summary</Typography.Title>
          <Row justify="space-between">
            <Col>
              <Typography.Text>Subtotal:</Typography.Text>
            </Col>
            <Col>
              <Typography.Text>${calculateSubtotal().toFixed(2)}</Typography.Text>
            </Col>
          </Row>
          <Row justify="space-between">
            <Col>
              <Typography.Text>VAT (20%):</Typography.Text>
            </Col>
            <Col>
              <Typography.Text>${calculateVat(calculateSubtotal()).toFixed(2)}</Typography.Text>
            </Col>
          </Row>
          <Row justify="space-between">
            <Col>
              <Typography.Text strong>Total:</Typography.Text>
            </Col>
            <Col>
              <Typography.Text strong>${calculateTotal().toFixed(2)}</Typography.Text>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Digital Signature Placeholder */}
      <Divider />
      <Row justify="end" style={{ marginTop: 24 }}>
        <Col span={12}>
          <Typography.Text strong>Digital Signature:</Typography.Text>
          <Input placeholder="Sign here" style={{ marginTop: 8 }} />
        </Col>
      </Row>
    </div>
  );
};

export default InvoiceEntryPage;