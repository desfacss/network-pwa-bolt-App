import React, { useState } from 'react';
import { Form, Input, Button, Table, InputNumber, DatePicker, Row, Col, Typography, Select } from 'antd';
import invoiceConfig from './invoiceConfig.json';
import purchaseOrderConfig from './purchaseOrderConfig.json';

const { TextArea } = Input;
const { Title } = Typography;

const config = invoiceConfig

const Invoice = () => {
  const [form] = Form.useForm();
  const [services, setServices] = useState([{ id: 1, name: '', quantity: 1, price: 0 }]);
  const [customer, setCustomer] = useState(null);

  // Helper function to render fields with alignment
  const renderField = (field, content) => {
    const alignmentMap = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end'
    };
    const alignment = alignmentMap[field.alignment] || 'flex-start';

    return (
      <div style={{ display: 'flex', justifyContent: alignment, marginBottom: '10px' }}>
        {field.type === 'image' ? (
          <img src={field.source} alt={field.label} style={{ maxWidth: field.width || 'auto' }} />
        ) : field.type === 'text' ? (
          <p>{field.value}</p>
        ) : field.type === 'signature' ? (
          <div>
            <p style={{ borderTop: '1px solid #000', marginTop: '10px', paddingTop: '10px' }}>____________________________________</p>
            <p>Signature</p>
          </div>
        ) : (
          content
        )}
      </div>
    );
  };

  // Generate table columns based on JSON configuration
  const columns = config?.services?.columns?.map(col => ({
    title: col.title,
    dataIndex: col.key,
    key: col.key,
    render: (text, record, index) => {
      if (col.type === 'number') {
        return <InputNumber
          min={col.key === 'quantity' ? 1 : 0}
          value={text}
          onChange={(value) => handleServiceChange(index, col.key, value)}
          bordered={false}
          style={{ border: 'none', width: '100%' }}
        />;
      }
      return <Input
        value={text}
        onChange={(e) => handleServiceChange(index, col.key, e.target.value)}
        bordered={false}
        style={{ border: 'none', width: '100%' }}
      />;
    },
  }));

  const handleServiceChange = (index, key, value) => {
    const newServices = [...services];
    newServices[index][key] = value;
    setServices(newServices);
  };

  const addService = () => {
    const newService = config?.services.columns.reduce((obj, col) => {
      obj[col.key] = col.type === 'number' ? (col.key === 'quantity' ? 1 : 0) : '';
      return obj;
    }, { id: services.length + 1 });
    setServices([...services, newService]);
  };

  const calculateSpecific = (key) => {
    switch (key) {
      case 'subtotal':
        return calculateTotal().toFixed(2);
      case 'tax':
        return (calculateTotal() * 0.1).toFixed(2);
      case 'total':
        return (calculateTotal() * 1.1).toFixed(2);
      default:
        return '0.00';
    }
  };

  const calculateTotal = () => {
    const priceColumn = config?.services?.columns?.find(col => col.key === 'price');
    const quantityColumn = config?.services?.columns?.find(col => col.key === 'quantity');
    if (priceColumn && quantityColumn) {
      return services.reduce((sum, service) => sum + (service[quantityColumn.key] * service[priceColumn.key]), 0);
    }
    return 0;
  };

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <Row gutter={[16, 16]}>
        {config?.header.fields.map(field => (
          <Col key={field.label} span={field.label === "Company Logo" ? 8 : 16}>
            {renderField(field)}
          </Col>
        ))}
      </Row>

      {/* Invoice Number and Date */}
      <Row gutter={[16, 16]}>
        {config?.invoiceNumber.fields.map(field => (
          <Col key={field.name} span={12}>
            <Form.Item label={field.label}>
              {renderField(field, field.type === 'input' ? <Input bordered={false} /> : <DatePicker bordered={false} />)}
            </Form.Item>
          </Col>
        ))}
      </Row>

      {/* Customer Details */}
      <Form form={form} layout="vertical">
        <Form.Item label="Customer" style={{ marginTop: '20px' }}>
          <Select onChange={() => { }} bordered={false}>
            {[1, 2].map(id => (
              <Select.Option key={id} value={id}>Customer {id}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        {config?.customerDetails.fields.map(field => (
          <Form.Item key={field.name} label={field.label}>
            {renderField(field, <Input value={customer ? customer[field.name] : ''} disabled bordered={false} />)}
          </Form.Item>
        ))}

        {/* Services */}
        <Title level={4} style={{ marginTop: '20px' }}>Services</Title>
        <Table columns={columns} dataSource={services} pagination={false} showHeader={false} bordered={false} size="small" />
        <Button onClick={addService} style={{ marginTop: '10px', border: 'none' }}>Add Service</Button>

        {/* Summary */}
        <Title level={4} style={{ marginTop: '20px' }}>Summary</Title>
        <Row justify="end" style={{ marginBottom: '10px' }}>
          <Col span={12}>
            {config?.summary.fields.map(field => (
              <Row key={field.key} justify="space-between" style={{ fontWeight: field.bold ? 'bold' : 'normal' }}>
                <span>{field.label}:</span>
                <span>{renderField(field, <span>${calculateSpecific(field.key)}</span>)}</span>
              </Row>
            ))}
          </Col>
        </Row>

        {/* Footer */}
        {config?.footer.fields.map(field => (
          <div key={field.name || field.label}>
            <Title level={4}>{field.label}</Title>
            {renderField(field, field.type === 'textArea' ? <TextArea bordered={false} /> : null)}
          </div>
        ))}

        <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
          <Button type="primary">Save Invoice</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Invoice;