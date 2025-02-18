import React, { useState } from 'react';
import { Form, Input, Button, Table, InputNumber, DatePicker, Row, Col, Typography } from 'antd';
import workOrderConfig from './workOrderConfig.json';
// import completionCertificateConfig from './completionCertificateConfig.json';

const { TextArea } = Input;
const { Title } = Typography;

const config = workOrderConfig
const WorkOrder = () => {
  const [form] = Form.useForm();
  const [jobDetails, setJobDetails] = useState(config?.jobDetails?.data);

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
        <span style={{ marginRight: '10px' }}>{field.label}:</span>
        {field.type === 'text' ? (
          <p>{field.value}</p>
        ) : field.type === 'textArea' ? (
          <TextArea value={form.getFieldValue(field.name) || field.value} onChange={(e) => form.setFieldsValue({ [field.name]: e.target.value })} />
        ) : field.type === 'input' ? (
          <Input value={form.getFieldValue(field.name) || field.value} onChange={(e) => form.setFieldsValue({ [field.name]: e.target.value })} />
        ) : field.type === 'datePicker' ? (
          <DatePicker onChange={(date, dateString) => form.setFieldsValue({ [field.name]: dateString })} />
        ) : field.type === 'display' ? (
          <span style={{ fontWeight: field.bold ? 'bold' : 'normal' }}>{field.value}</span>
        ) : null}
        {content}
      </div>
    );
  };

  // Table columns configuration
  const columns = config?.jobDetails?.columns?.map(col => ({
    title: col.title,
    dataIndex: col.key,
    key: col.key,
    render: (text, record, index) => {
      if (col.key === 'description') {
        return <Input
          value={text}
          onChange={(e) => handleJobDetailChange(index, col.key, e.target.value)}
          style={{ border: 'none', width: '100%' }}
        />;
      } else if (col.key === 'unit' || col.key === 'quantity' || col.key === 'unitRate') {
        return <Input
          value={text}
          onChange={(e) => handleJobDetailChange(index, col.key, e.target.value)}
          style={{ border: 'none', width: '100%' }}
        />;
      } else if (col.key === 'total') {
        return <span>{calculateTotal(record.quantity, record.unitRate)}</span>;
      }
      return text;
    },
  }));

  // Handling changes in job details
  const handleJobDetailChange = (index, key, value) => {
    const newJobDetails = [...jobDetails];
    newJobDetails[index][key] = value;
    setJobDetails(newJobDetails);
  };

  // Calculating total for each row in the job details table
  const calculateTotal = (quantity, unitRate) => {
    return (quantity * unitRate).toFixed(2);
  };

  // Calculating grand total
  const calculateGrandTotal = () => {
    return jobDetails.reduce((sum, item) => sum + parseFloat(calculateTotal(item?.quantity, item?.unitRate)), 0).toFixed(2);
  };

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      {config?.header?.fields?.map(field => (
        <Title key={field?.label} level={4} style={{ textAlign: field?.alignment, margin: 0 }}>{field?.value}</Title>
      ))}

      {/* Work Order Details */}
      <Form form={form} layout="vertical">
        <Row gutter={[16, 16]}>
          {config?.workOrderDetails?.fields?.map(field => (
            <Col key={field.name} span={8}>
              <Form.Item name={field.name}>
                {renderField(field)}
              </Form.Item>
            </Col>
          ))}
        </Row>

        {/* Subcontractor Details */}
        {config?.subcontractorDetails?.fields?.map(field => (
          <Form.Item key={field?.name} name={field?.name}>
            {renderField(field)}
          </Form.Item>
        ))}

        {/* Job Details */}
        <Title level={4}>Job Details</Title>
        <Table
          columns={columns}
          dataSource={jobDetails}
          pagination={false}
          bordered={true}
          size="small"
        />

        {/* Summary */}
        <Title level={4} style={{ marginTop: '20px' }}>Summary</Title>
        {config?.summary?.fields?.map(field => (
          <Row key={field.key} justify="end" style={{ marginBottom: '10px', fontWeight: field.bold ? 'bold' : 'normal' }}>
            <Col span={12}>
              <span>{field.label}: </span>
              <span>{calculateGrandTotal()}</span>
            </Col>
          </Row>
        ))}

        {/* Scope of Work */}
        {config?.scopeOfWork?.fields?.map(field => (
          <Form.Item key={field.name} name={field.name}>
            {renderField(field)}
          </Form.Item>
        ))}

        {/* Engineer in Charge */}
        {config?.engineerInCharge?.fields?.map(field => (
          <Form.Item key={field.name} name={field.name}>
            {renderField(field)}
          </Form.Item>
        ))}

        {/* Subcontractor Signature */}
        {config?.subcontractorSignature?.fields?.map(field => (
          <div key={field.label} style={{ textAlign: field.alignment, marginTop: '20px' }}>
            {renderField(field)}
          </div>
        ))}

        <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
          <Button type="primary" onClick={() => console.log(form.getFieldsValue())}>Save Work Order</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default WorkOrder;