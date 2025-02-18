import React, { useRef } from 'react';
import { Form, Input, Button, Table, DatePicker, Row, Col, Typography, Divider, InputNumber, message } from 'antd';
import moment from 'moment';
import { useReactToPrint } from 'react-to-print';
import { supabase } from 'api/supabaseClient';
import { useSelector } from 'react-redux';

const { TextArea } = Input;
const { Title } = Typography;

const GeneralDocumentComponent = ({ config }) => {
  const [form] = Form.useForm();
  const { session } = useSelector((state) => state.auth);
  // Helper function to render different types of fields
  const renderField = (field) => {
    const alignmentMap = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end'
    };
    const alignment = alignmentMap[field.alignment] || 'flex-start';

    return (
      <div style={{ display: 'flex', justifyContent: alignment, marginBottom: '10px' }}>
        {field.label && <span style={{ marginRight: '10px' }}>{field.label}:</span>}
        {field.type === 'text' && <p>{field.value}</p>}
        {field.type === 'input' && (
          <Form.Item name={field.name} noStyle>
            <Input value={field.value} onChange={(e) => form.setFieldsValue({ [field.name]: e.target.value })} />
          </Form.Item>
        )}
        {field.type === 'textArea' && (
          <Form.Item name={field.name} noStyle>
            <TextArea value={field.value} onChange={(e) => form.setFieldsValue({ [field.name]: e.target.value })} />
          </Form.Item>
        )}
        {field.type === 'datePicker' && (
          <Form.Item name={field.name} noStyle>
            <DatePicker onChange={(date, dateString) => { if (date) { form.setFieldsValue({ [field.name]: dateString }) } }} />
          </Form.Item>
        )}
        {field.type === 'signature' && (
          <div style={{ borderTop: '1px solid #000', marginTop: '10px', paddingTop: '10px', width: '200px', textAlign: 'center' }}>
            {field.label}
          </div>
        )}
        {field.type === 'display' && (
          <span style={{ fontWeight: field.bold ? 'bold' : 'normal' }}>{field.value}</span>
        )}
      </div>
    );
  };

  // Function to render table from config
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

    return (
      <Table
        columns={columns}
        dataSource={tableConfig.data || tableConfig.rows}
        pagination={false}
        bordered={true}
        size="small"
      />
    );
  };

  // Handle changes in table data
  // const handleTableChange = (index, key, value) => {
  //   const newData = [...config[Object.keys(config).find(key => config[key].columns)]['data' in config[Object.keys(config).find(key => config[key].columns)] ? 'data' : 'rows'];
  //   newData[index][key] = value;
  //   // Here you would typically update the state or call a function to update the config
  //   console.log(newData);
  // };

  const handleTableChange = (index, key, value) => {
    // First, find the key in the config object where 'columns' exists
    const tableKey = Object.keys(config).find(k => config[k].columns);

    // Then check if this key has 'data' or 'rows' property
    const dataKey = config[tableKey].data ? 'data' : 'rows';

    // Create a shallow copy of the data or rows array
    const newData = [...config[tableKey][dataKey]];

    // Update the value in the copied array
    newData[index][key] = value;

    // Log the new data or update state/config accordingly
    console.log(newData);
    // If you're managing state, you would update it here:
    // setState({...state, [tableKey]: {...state[tableKey], [dataKey]: newData}});
  };

  const reportDataRef = useRef();

  // Function to save data to Supabase
  const saveToSupabase = async () => {
    // console.log("tre", config);
    if (!config?.type) {
      return message.error('No Config Type')
    }
    const values = form.getFieldsValue();
    const details = { ...values }; // Combine form values with config

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
      message.success('Saved Sucessfully')
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
                {section.title && <Title level={4}>{section.title}</Title>}
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
                {section.title && <Title level={4}>{section.title}</Title>}
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
          {/* <Button type="primary" onClick={() => console.log(form.getFieldsValue())}>Save Document</Button> */}
          <Button type="primary" onClick={saveToSupabase}>Save Document</Button>
          <Button onClick={handlePrint} style={{ marginLeft: '10px' }}>Download PDF</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default GeneralDocumentComponent;