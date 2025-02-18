import React from 'react';
import { Form, Input, Button, Table, DatePicker, Row, Col, Typography } from 'antd';
import completionCertificateConfig from './completionCertificateConfig.json';

const { TextArea } = Input;
const { Title } = Typography;

const config = completionCertificateConfig

const CompletionCertificate = () => {
  const [form] = Form.useForm();

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
        <span>{field.label}: </span>
        {field.type === 'text' ? (
          <p>{field.value || field.label}</p>
        ) : field.type === 'textArea' ? (
          <TextArea value={form.getFieldValue(field.name)} onChange={(e) => form.setFieldsValue({ [field.name]: e.target.value })} />
        ) : field.type === 'input' ? (
          <Input value={form.getFieldValue(field.name)} onChange={(e) => form.setFieldsValue({ [field.name]: e.target.value })} />
        ) : field.type === 'datePicker' ? (
          <DatePicker onChange={(date, dateString) => form.setFieldsValue({ [field.name]: dateString })} />
        ) : field.type === 'signature' ? (
          <div style={{ borderTop: '1px solid #000', marginTop: '10px', paddingTop: '10px', width: '200px' }}>{field.label}</div>
        ) : null}
        {content}
      </div>
    );
  };

  // Table columns configuration
  const columns = config?.table.columns.map(col => ({
    title: col.title,
    dataIndex: col.key,
    key: col.key,
    render: (text, record, index) => {
      if (col.type === 'textArea') {
        return <TextArea rows={1} value={text} onChange={(e) => handleTableChange(index, col.key, e.target.value)} style={{ border: 'none', width: '100%' }} />;
      }
      return text;
    },
  }));

  // Handling changes in table data
  const handleTableChange = (index, key, value) => {
    const newRows = [...config?.table.rows];
    newRows[index][key] = value;
    // Here you would update the state if you were managing this data in state
    console.log(newRows);
  };

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <Title level={3} style={{ textAlign: config?.header.alignment }}>{config?.header.title}</Title>

      {/* Recipient Details */}
      <Row gutter={16}>
        <Col span={12}>
          {renderField(config?.recipientDetails.fields[0])}
        </Col>
        <Col span={12}>
          <Form.Item name="date">
            {renderField(config?.recipientDetails.fields[1])}
          </Form.Item>
        </Col>
      </Row>

      {/* Certificate Body */}
      <p>{config?.certificateBody.text}</p>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={config?.table.rows}
        pagination={false}
        bordered={true}
        size="small"
      />

      {/* Signatories */}
      <Row gutter={16} style={{ marginTop: '20px' }}>
        <Col span={12}>
          {renderField(config?.signatories.fields[0])}
        </Col>
        <Col span={12}>
          <Form.Item name="otherParty">
            {renderField(config?.signatories.fields[1])}
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          {renderField(config?.signatories.fields[2])}
        </Col>
        <Col span={12}>
          {renderField(config?.signatories.fields[3])}
        </Col>
      </Row>

      <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
        <Button type="primary" onClick={() => console.log(form.getFieldsValue())}>Save Certificate</Button>
      </Form.Item>
    </div>
  );
};

export default CompletionCertificate;