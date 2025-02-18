import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Table, InputNumber, DatePicker, Row, Col, Typography } from 'antd';
const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

// Mock JSON configuration for invoice columns
const columnConfig = {
  customerDetails: [
    { name: 'customerName', label: 'Customer Name' },
    { name: 'customerAddress', label: 'Customer Address' }
  ],
  serviceColumns: [
    { key: 'name', title: 'Service', type: 'text' },
    { key: 'quantity', title: 'Qty', type: 'number' },
    { key: 'price', title: 'Price', type: 'number' }
  ]
};

const Invoice = () => {
  const [form] = Form.useForm();
  const [services, setServices] = useState([{ id: 1, name: '', quantity: 1, price: 0 }]);
  const [customer, setCustomer] = useState(null);

  // Generate table columns based on JSON configuration
  const columns = columnConfig.serviceColumns.map(col => ({
    title: col.title,
    dataIndex: col.key,
    key: col.key,
    render: (text, record, index) => {
      switch(col.type) {
        case 'text':
          return (
            <Input 
              value={text} 
              onChange={(e) => handleServiceChange(index, col.key, e.target.value)} 
              bordered={false}
              style={{ border: 'none', width: '100%' }}
            />
          );
        case 'number':
          return (
            <InputNumber 
              min={col.key === 'quantity' ? 1 : 0} 
              value={text} 
              onChange={(value) => handleServiceChange(index, col.key, value)} 
              bordered={false}
              style={{ border: 'none', width: '100%' }}
              formatter={col.key === 'price' ? (value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : undefined}
              parser={col.key === 'price' ? (value) => value.replace(/\$\s?|(,*)/g, '') : undefined}
            />
          );
        default:
          return text;
      }
    },
  }));

  const handleServiceChange = (index, key, value) => {
    const newServices = [...services];
    newServices[index][key] = value;
    setServices(newServices);
  };

  const addService = () => {
    const newService = columnConfig.serviceColumns.reduce((obj, col) => {
      obj[col.key] = col.key === 'quantity' ? 1 : (col.key === 'price' ? 0 : '');
      return obj;
    }, { id: services.length + 1 });
    setServices([...services, newService]);
  };

  const handleCustomerChange = (value) => {
    // Here, you would normally fetch customer details from an API
    setCustomer({ name: `Customer ${value}`, address: `Address ${value}` });
  };

  const calculateTotal = () => {
    const priceColumn = columnConfig.serviceColumns.find(col => col.key === 'price');
    const quantityColumn = columnConfig.serviceColumns.find(col => col.key === 'quantity');
    if (priceColumn && quantityColumn) {
      return services.reduce((sum, service) => sum + (service[quantityColumn.key] * service[priceColumn.key]), 0);
    }
    return 0;
  };

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
      <Row justify="space-between" gutter={16}>
        <Col span={8}>
          <img src="/path/to/your/logo.png" alt="Company Logo" style={{ maxWidth: '100px' }} />
          <div>
            <p>Your Company Name</p>
            <p>Your Company Address</p>
          </div>
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>INVOICE</Title>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Form form={form} layout="vertical">
            <Form.Item label="Invoice Number" style={{ marginBottom: 0 }}>
              <Input bordered={false} />
            </Form.Item>
            <Form.Item label="Date" style={{ marginBottom: 0 }}>
              <DatePicker bordered={false} />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Form form={form} layout="vertical">
        <Form.Item label="Customer" style={{ marginTop: '20px' }}>
          <Select onChange={handleCustomerChange} bordered={false}>
            {[1, 2].map(id => (
              <Option key={id} value={id}>Customer {id}</Option>
            ))}
          </Select>
        </Form.Item>

        {customer && columnConfig.customerDetails.map(detail => (
          <Form.Item key={detail.name} label={detail.label}>
            <Input value={customer[detail.name]} disabled bordered={false} />
          </Form.Item>
        ))}

        <Title level={4} style={{ marginTop: '20px' }}>Services</Title>
        <Table 
          columns={columns} 
          dataSource={services} 
          pagination={false} 
          showHeader={false}
          bordered={false}
          size="small"
          style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000' }}
        />
        <Button onClick={addService} style={{ marginTop: '10px', border: 'none' }}>Add Service</Button>

        <Title level={4} style={{ marginTop: '20px' }}>Summary</Title>
        <Row justify="end" style={{ marginBottom: '10px' }}>
          <Col span={12}>
            <Row justify="space-between">
              <span>Subtotal:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </Row>
            <Row justify="space-between">
              <span>Tax (10%):</span>
              <span>${(calculateTotal() * 0.1).toFixed(2)}</span>
            </Row>
            <Row justify="space-between" style={{ fontWeight: 'bold' }}>
              <span>Total:</span>
              <span>${(calculateTotal() * 1.1).toFixed(2)}</span>
            </Row>
          </Col>
        </Row>

        <Title level={4}>Terms and Conditions</Title>
        <TextArea rows={4} bordered={false} placeholder="Enter terms and conditions here" />
        <Title level={4} style={{ marginTop: '20px' }}>Remarks</Title>
        <TextArea rows={2} bordered={false} placeholder="Any additional remarks?" />
        <Title level={4} style={{ marginTop: '20px' }}>Signature</Title>
        <p style={{ borderTop: '1px solid #000', marginTop: '10px', paddingTop: '10px' }}>____________________________________</p>
        <p>Signature</p>

        <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
          <Button type="primary">Save Invoice</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Invoice;