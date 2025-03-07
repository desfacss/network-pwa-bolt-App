import React, { useRef, useState, useEffect } from 'react';
import { Form, Input, Button, Table, DatePicker, Row, Col, Typography, Divider, InputNumber, message } from 'antd';
import moment from 'moment';
import { useReactToPrint } from 'react-to-print';
import { supabase } from 'configs/SupabaseConfig';
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
    // ... (keep your existing renderField function)
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

  const updateSummary = (data) => {
    let subtotal = 0;
    data.forEach(item => {
      const price = parseFloat(item.price || 0);
      const quantity = parseInt(item.quantity || 0, 10);
      subtotal += price * quantity;
    });

    const taxRate = 0.1; // 10% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    form.setFieldsValue({
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    });
  };

  const addRow = () => {
    const tableSection = Object.keys(config).find(key => config[key].columns);
    const newRow = tableConfig.columns.reduce((acc, col) => {
      acc[col.key] = col.type === 'number' ? 0 : '';
      return acc;
    }, { key: Date.now() }); // Use timestamp as a unique key for each row

    setTableData([...tableData, newRow]);
  };

  const removeRow = (index) => {
    const newData = [...tableData];
    newData.splice(index, 1);
    setTableData(newData);
    updateSummary(newData);
  };

  // ... (keep your existing code for saveToSupabase, handlePrint, and renderForm)

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