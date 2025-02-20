import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Table, DatePicker, Typography, InputNumber, message } from 'antd';
import { useReactToPrint } from 'react-to-print';
import { supabase } from 'api/supabaseClient';
import { useSelector } from 'react-redux';

const { TextArea } = Input;
const { Title } = Typography;

const GeneralDocumentComponent = ({ config }) => {
  const [form] = Form.useForm();
  const { session } = useSelector((state) => state.auth);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    initializeTableData();
  }, []);

  const initializeTableData = () => {
    const tableSection = Object.keys(config).find(key => config[key].columns);
    if (tableSection) {
      const initialData = config[tableSection].data || config[tableSection].rows || [];
      setTableData(initialData);
      updateSummary(initialData);
    }
  };

  const renderField = (field) => {
    const alignmentMap = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end'
    };
    const alignment = alignmentMap[field.alignment] || 'flex-start';

    return (
      <div style={{ display: 'flex', justifyContent: alignment, marginBottom: '10px' }}>
        {field.label && <span style={{ marginRight: '10px' }}>{field.label}</span>}
        {field.type === 'text' && <p>{field.value}</p>}
        {field.type === 'input' && (
          <Form.Item name={field.name} noStyle>
            <Input onChange={(e) => form.setFieldsValue({ [field.name]: e.target.value })} />
          </Form.Item>
        )}
        {field.type === 'textArea' && (
          <Form.Item name={field.name} noStyle>
            <TextArea onChange={(e) => form.setFieldsValue({ [field.name]: e.target.value })} />
          </Form.Item>
        )}
        {/* {field.type === 'datePicker' && (
          <Form.Item name={field.name} noStyle>
            <DatePicker onChange={(date, dateString) => form.setFieldsValue({ [field.name]: dateString })} />
          </Form.Item>
        )} */}
        {field.type === 'datePicker' && (
          <Form.Item name={field.name} noStyle>
            <DatePicker onChange={(date, dateString) => {
              if (date) { // Check if date is selected
                form.setFieldsValue({ [field.name]: date });
              } else {
                form.setFieldsValue({ [field.name]: null }); // Clear the field if date is invalid or not selected
              }
            }} />
          </Form.Item>
        )}
        {field.type === 'signature' && (
          <div style={{ borderTop: '1px solid #000', marginTop: '10px', paddingTop: '10px', width: '200px', textAlign: 'center' }}>
            {field.label}
          </div>
        )}
        {/* {field.type === 'display' && (
          <span style={{ fontWeight: field.bold ? 'bold' : 'normal' }}>{field.value || field.label}</span>
        )} */}
        {field.type === 'display' && (
          <Form.Item name={field.key} noStyle>
            <span style={{ fontWeight: field.bold ? 'bold' : 'normal' }}>{form.getFieldValue(field.key) || field.label}</span>
          </Form.Item>
        )}
      </div>
    );
  };

  const renderTable = (tableConfig) => {
    const columns = tableConfig.columns.map(col => ({
      title: col.title,
      dataIndex: col.key,
      key: col.key,
      render: (text, record, index) => {
        if (col.type === 'number') {
          return <InputNumber min={0} value={text} onChange={(value) => handleTableChange(index, col.key, value)} />;
        }
        return <Input value={text} onChange={(e) => handleTableChange(index, col.key, e.target.value)} />;
      },
    }));

    // Add a new column for action (Add/Remove row)
    columns.push({
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        <Button onClick={() => removeRow(index)}>Remove</Button>
      )
    });

    return (
      <div>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          bordered={true}
          size="small"
        />
        <Button style={{ marginTop: 10 }} onClick={addRow}>Add Row</Button>
      </div>
    );
  };

  const handleTableChange = (index, key, value) => {
    const newData = [...tableData];
    newData[index] = { ...newData[index], [key]: value };
    setTableData(newData);
    updateSummary(newData);
  };

  // const updateSummary = (data) => {
  //   let subtotal = 0;
  //   data.forEach(item => {
  //     const price = parseFloat(item.price || 0);
  //     const quantity = parseInt(item.quantity || 0, 10);
  //     subtotal += price * quantity;
  //   });

  //   const taxRate = 0.1; // 10% tax
  //   const tax = subtotal * taxRate;
  //   const total = subtotal + tax;

  //   form.setFieldsValue({
  //     subtotal: subtotal.toFixed(2),
  //     tax: tax.toFixed(2),
  //     total: total.toFixed(2)
  //   });
  // };

  // useEffect(() => {
  //   if (tableData.length > 0) {
  //     updateSummary(tableData);
  //   }
  // }, [tableData]); // Dependency on tableData to recalculate when data changes

  const updateSummary = (data) => {
    const summarySection = config.summary;
    const calculationConfig = config.summaryCalculation || {};
    const summaryFieldsMapping = config.summaryFieldsMapping || {};

    if (summarySection && summarySection.fields) {
      const newValues = {};

      // Calculate basic values
      const subtotal = data.reduce((sum, item) => {
        const price = parseFloat(item[calculationConfig.priceField] || 0);
        const quantity = parseInt(item[calculationConfig.quantityField] || 0, 10);
        return sum + (price * quantity);
      }, 0);

      // Map and calculate summary values based on config
      summarySection.fields.forEach(field => {
        if (summaryFieldsMapping[field.key]) {
          const { calculation, taxRate } = summaryFieldsMapping[field.key];

          if (calculation === 'subtotal') {
            newValues[field.key] = subtotal.toFixed(2);
          } else if (calculation === 'tax') {
            newValues[field.key] = (subtotal * (taxRate || 0.1)).toFixed(2); // Default 10% if not specified
          } else if (calculation === 'total') {
            const tax = parseFloat(newValues.tax || (subtotal * (taxRate || 0.1)).toFixed(2)); // Use calculated tax if available
            newValues[field.key] = (subtotal + tax).toFixed(2);
          } else if (calculation === 'roundedOff') {
            const total = parseFloat(newValues.total || 0);
            newValues[field.key] = (Math.round(total) - total).toFixed(2);
          }
        }
      });

      console.log("updateSummary", data, newValues);
      form.setFieldsValue(newValues);
    }
  };

  const addRow = () => {
    const tableSection = Object.keys(config).find(key => config[key].columns);
    if (tableSection) {
      const tableConfig = config[tableSection]; // Here we define tableConfig
      const newRow = tableConfig.columns.reduce((acc, col) => {
        acc[col.key] = col.type === 'number' ? 0 : '';
        return acc;
      }, { key: Date.now() }); // Use timestamp as a unique key for each row

      setTableData([...tableData, newRow]);
    }
  };

  const removeRow = (index) => {
    const newData = [...tableData];
    newData.splice(index, 1);
    setTableData(newData);
    updateSummary(newData);
  }

  const reportDataRef = useRef();

  // Function to save data to Supabase
  const saveToSupabase = async () => {
    if (!config?.type) {
      return message.error('No Config Type');
    }
    const values = form.getFieldsValue();
    const details = { ...values, tableData: tableData, }; // Combine form values with config

    const { data, error } = await supabase
      .from('tmp_templates')
      .insert([
        {
          details: details,
          user_id: session?.user?.id,
          organization_id: session?.user?.organization?.id,
          type: config?.type
        }
      ]);

    if (error) {
      console.error('Error saving to Supabase:', error);
    } else {
      message.success('Saved Successfully');
      console.log('Data saved successfully:', data);
    }
  };

  // Setup for react-to-print
  const handlePrint = useReactToPrint({
    contentRef: reportDataRef
  });

  // Render function for the form and table
  const renderForm = () => {
    return (
      <div ref={reportDataRef}>
        {Object.keys(config).map((sectionKey, index) => {
          const section = config[sectionKey];
          if (section.fields) {
            return (
              <div key={index}>
                <Title level={4}>{sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Title>
                {section.fields.map((field, fieldIndex) => (
                  <Form.Item key={fieldIndex} name={field.name || field.label}>
                    {renderField(field)}
                  </Form.Item>
                ))}
              </div>
            );
          } else if (section.columns) {
            return (
              <div key={index}>
                <Title level={4}>Items Table</Title>
                {renderTable(section)}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
      <Form form={form} layout="vertical">
        {renderForm()}
        <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
          <Button type="primary" onClick={saveToSupabase}>Save Document</Button>
          <Button onClick={handlePrint} style={{ marginLeft: '10px' }}>Download PDF</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default GeneralDocumentComponent;