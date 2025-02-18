import React, { useState } from 'react';
import { Form, Input, Button, Table, InputNumber, DatePicker, Row, Col, Typography, Divider } from 'antd';
import purchaseOrderConfig from './purchaseOrderConfig.json';
import workOrderConfig from './workOrderConfig.json';

const { TextArea } = Input;
const { Title } = Typography;

const config = purchaseOrderConfig

const Template = () => {
  const [form] = Form.useForm();
  const [items, setItems] = useState(Array(config?.itemsTable?.initialRows).fill().map((_, index) => ({
    key: index + 1,
    sNo: index + 1,
    description: '',
    unit: '',
    quantity: 1,
    rate: 0,
    amount: 0
  })));

  // Function to render different types of fields
  const renderField = (field, content) => {
    const alignmentMap = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end'
    };
    const alignment = alignmentMap[field.alignment] || 'flex-start';

    return (
      <div style={{ display: 'flex', justifyContent: alignment, marginBottom: '10px' }}>
        {field?.type === 'image' ? (
          <img src={field?.source} alt={field?.label} style={{ maxWidth: field?.width || 'auto' }} />
        ) : field?.type === 'text' ? (
          <p>{field?.value}</p>
        ) : field?.type === 'signature' ? (
          <div>
            <p style={{ borderTop: '1px solid #000', marginTop: '10px', paddingTop: '10px' }}>____________________________________</p>
            <p>{field?.label}</p>
          </div>
        ) : (
          content
        )}
      </div>
    );
  };

  // Table columns configuration
  const columns = config?.itemsTable?.columns?.map(col => ({
    title: col?.title,
    dataIndex: col?.key,
    key: col?.key,
    render: (text, record, index) => {
      if (col?.type === 'number') {
        return <InputNumber
          min={col?.key === 'quantity' ? 1 : 0}
          value={text}
          onChange={(value) => handleItemChange(index, col?.key, value)}
          bordered={false}
          style={{ border: 'none', width: '100%' }}
        />;
      }
      return <Input
        value={text}
        onChange={(e) => handleItemChange(index, col?.key, e.target.value)}
        bordered={false}
        style={{ border: 'none', width: '100%' }}
      />;
    },
  }));

  // Handling changes in table items
  const handleItemChange = (index, key, value) => {
    const newItems = [...items];
    newItems[index][key] = value;
    // Calculate amount if rate or quantity changes
    if (key === 'rate' || key === 'quantity') {
      newItems[index].amount = (newItems[index]?.rate * newItems[index]?.quantity).toFixed(2);
    }
    setItems(newItems);
  };

  // Calculating totals
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + parseFloat(item?.amount || 0), 0).toFixed(2);
  };

  const calculateGST = () => {
    const total = calculateTotal();
    return (total * 0.18).toFixed(2); // Assuming 18% GST
  };

  const calculateGrandTotal = () => {
    const total = parseFloat(calculateTotal());
    const gst = parseFloat(calculateGST());
    return (total + gst).toFixed(2);
  };

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <Row gutter={[16, 16]}>
        {config?.header?.fields?.map(field => (
          <Col key={field?.label} span={field?.label === "Company Logo" ? 8 : 16}>
            {renderField(field)}
          </Col>
        ))}
      </Row>

      {/* Purchase Order Details */}
      <Row gutter={[16, 16]}>
        {config?.purchaseOrderDetails?.fields?.map(field => (
          <Col key={field?.name} span={12}>
            <Form.Item label={field?.label}>
              {renderField(field, field?.type === 'input' ? <Input bordered={false} /> : <DatePicker bordered={false} />)}
            </Form.Item>
          </Col>
        ))}
      </Row>

      {/* Supplier Details */}
      <Form form={form} layout="vertical">
        {config?.supplierDetails?.fields?.map(field => (
          <Form.Item key={field?.name} label={field?.label}>
            {renderField(field, <Input value={field?.value} bordered={false} />)}
          </Form.Item>
        ))}

        {/* Items Table */}
        <Title level={4}>Items</Title>
        <Table
          columns={columns}
          dataSource={items}
          pagination={false}
          showHeader={true}
          bordered={true}
          size="small"
        />

        {/* Summary */}
        <Title level={4} style={{ marginTop: '20px' }}>Summary</Title>
        <Row justify="end" style={{ marginBottom: '10px' }}>
          <Col span={12}>
            {config?.summary.fields.map(field => (
              <Row key={field.key} justify="space-between" style={{ fontWeight: field.bold ? 'bold' : 'normal' }}>
                <span>{field.label}:</span>
                <span>{renderField(field, <span>{field.key === 'total' ? calculateTotal() : field.key === 'gst' ? calculateGST() : field.key === 'grandTotal' ? calculateGrandTotal() : ''}</span>)}</span>
              </Row>
            ))}
          </Col>
        </Row>

        {/* Terms and Conditions */}
        <Title level={4} style={{ marginTop: '20px' }}>Terms and Conditions</Title>
        {config?.termsAndConditions?.fields?.map(field => (
          <Form.Item key={field.name} label={field.label}>
            {renderField(field, <TextArea bordered={false} />)}
          </Form.Item>
        ))}

        {/* Address Details */}
        <Row gutter={[16, 16]}>
          {config?.addressDetails?.fields?.map(field => (
            <Col key={field.name} span={12}>
              <Form.Item label={field.label}>
                {renderField(field, <TextArea value={field.value} bordered={false} />)}
              </Form.Item>
            </Col>
          ))}
        </Row>

        {/* Footer */}
        {config?.footer?.fields?.map(field => (
          <div key={field.label}>
            <Divider />
            {renderField(field)}
          </div>
        ))}

        <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
          <Button type="primary">Save Purchase Order</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Template;