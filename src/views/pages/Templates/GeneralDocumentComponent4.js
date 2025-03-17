import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Table, DatePicker, Typography, InputNumber, message, Modal, Select } from 'antd';
import { useReactToPrint } from 'react-to-print';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import { sendEmail } from 'components/common/SendEmail';
import { REACT_APP_RESEND_FROM_EMAIL } from 'configs/AppConfig'

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const GeneralDocumentComponent = ({ formName, initialData }) => {
  const [form] = Form.useForm();
  const [shareForm] = Form.useForm(); // Separate form for sharing
  const { session } = useSelector((state) => state.auth);
  const [tableData, setTableData] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [recipientType, setRecipientType] = useState(null);
  // const [otpEnabled, setOtpEnabled] = useState(false);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    fetchFormConfig();
    fetchUsers();
    fetchOrganizations();
    if (initialData) {
      form.setFieldsValue(initialData);
      setTableData(initialData.tableData || []);
    }
  }, [formName, initialData]);

  const fetchFormConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('data_schema')
        .eq('name', formName)
        .single();

      if (error) throw error;
      if (data) {
        setConfig(data.data_schema);
        if (!initialData) initializeTableData(data.data_schema);
      } else {
        message.error("Form configuration not found.");
      }
    } catch (error) {
      console.error('Error fetching form config:', error);
      message.error("Error loading form configuration.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) console.error('Error fetching users:', error);
    else setUsers(data);
  };

  const fetchOrganizations = async () => {
    const { data, error } = await supabase.from('organizations').select('id, name');
    if (error) console.error('Error fetching organizations:', error);
    else setOrganizations(data);
  };

  const initializeTableData = (loadedConfig) => {
    const tableSection = Object.keys(loadedConfig || {}).find((key) => loadedConfig[key].columns);
    if (tableSection) {
      const initialData = loadedConfig[tableSection].data || loadedConfig[tableSection].rows || [];
      setTableData(initialData);
      updateSummary(initialData, loadedConfig);
    }
  };

  const renderField = (field) => {
    const alignmentMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
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
        {field.type === 'datePicker' && (
          <Form.Item name={field.name} noStyle>
            <DatePicker onChange={(date, dateString) => form.setFieldsValue({ [field.name]: date })} />
          </Form.Item>
        )}
        {field.type === 'signature' && (
          <div style={{ borderTop: '1px solid #000', marginTop: '10px', paddingTop: '10px', width: '200px', textAlign: 'center' }}>
            {field.label}
          </div>
        )}
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

    columns.push({
      title: 'Action',
      key: 'action',
      render: (_, record, index) => <Button onClick={() => removeRow(index)}>Remove</Button>,
    });

    return (
      <div>
        <Table columns={columns} dataSource={tableData} pagination={false} bordered size="small" />
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

  const updateSummary = (data, loadedConfig = config) => {
    const summarySection = loadedConfig?.summary;
    const calculationConfig = loadedConfig?.summaryCalculation || {};
    const summaryFieldsMapping = loadedConfig?.summaryFieldsMapping || {};

    if (summarySection && summarySection.fields) {
      const newValues = {};
      const subtotal = data.reduce((sum, item) => {
        const price = parseFloat(item[calculationConfig.priceField] || 0);
        const quantity = parseInt(item[calculationConfig.quantityField] || 0, 10);
        return sum + price * quantity;
      }, 0);

      summarySection.fields.forEach((field) => {
        if (summaryFieldsMapping[field.key]) {
          const { calculation, taxRate } = summaryFieldsMapping[field.key];
          if (calculation === 'subtotal') newValues[field.key] = subtotal.toFixed(2);
          else if (calculation === 'tax') newValues[field.key] = (subtotal * (taxRate || 0.1)).toFixed(2);
          else if (calculation === 'total') {
            const tax = parseFloat(newValues.tax || (subtotal * (taxRate || 0.1)).toFixed(2));
            newValues[field.key] = (subtotal + tax).toFixed(2);
          } else if (calculation === 'roundedOff') {
            const total = parseFloat(newValues.total || 0);
            newValues[field.key] = (Math.round(total) - total).toFixed(2);
          }
        }
      });
      form.setFieldsValue(newValues);
    }
  };

  const addRow = () => {
    const tableSection = Object.keys(config).find((key) => config[key].columns);
    if (tableSection) {
      const tableConfig = config[tableSection];
      const newRow = tableConfig.columns.reduce((acc, col) => {
        acc[col.key] = col.type === 'number' ? 0 : '';
        return acc;
      }, { key: Date.now() });
      setTableData([...tableData, newRow]);
    }
  };

  const removeRow = (index) => {
    const newData = [...tableData];
    newData.splice(index, 1);
    setTableData(newData);
    updateSummary(newData);
  };

  const reportDataRef = useRef();

  const saveToSupabase = async () => {
    if (!config?.type) return message.error('No Config Type');
    const values = form.getFieldsValue();
    const details = { ...values, tableData };

    const { data, error } = await supabase
      .from('tmp_templates')
      .insert([{ details, user_id: session?.user?.id, organization_id: session?.user?.organization?.id, type: config?.type }]);

    if (error) {
      console.error('Error saving to Supabase:', error);
      message.error('Failed to save document');
    } else {
      message.success('Saved Successfully');
    }
  };

  const handlePrint = useReactToPrint({ contentRef: reportDataRef });

  const handleShare = () => setIsShareModalVisible(true);

  const handleShareOk = async () => {
    try {
      const values = await shareForm.validateFields();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + values.expiry);

      const shareData = {
        document_id: initialData?.id, // Assuming initialData has the document ID
        sender_id: session?.user?.id,
        recipient_type: values.recipientType,
        ...(values.recipientType === 'email' && { recipient_email: values.recipientEmail }),
        ...(values.recipientType === 'user' && { recipient_user_id: values.recipientUser }),
        ...(values.recipientType === 'organization' && { recipient_org_id: values.recipientOrg }),
        otp: values?.otp,
        expires_at: expiresAt.toISOString(),
        created_by: session?.user?.id,
      };

      const { data, error } = await supabase.from('document_shares').insert(shareData).select().single();
      if (error) throw error;

      message.success('Document shared successfully');
      if (values.recipientType === 'email') {
        const recipientLink = `${window.location.origin}/app/recipient/${data.id}`;
        const emailData = [{
          from: `${session?.user?.user_name} on zoworks <${REACT_APP_RESEND_FROM_EMAIL}>`,
          to: [values.recipientEmail],
          subject: `${session?.user?.user_name} on zoworks Shared Document with You`,
          html: `<p>You have been shared a document. View it here: <a href="${recipientLink}">${recipientLink}</a></p>`,
        }];
        await sendEmail(emailData);
      }
      setIsShareModalVisible(false);
      shareForm.resetFields();
    } catch (error) {
      console.error('Error sharing document:', error);
      message.error('Failed to share document');
    }
  };

  const handleShareCancel = () => {
    setIsShareModalVisible(false);
    shareForm.resetFields();
  };

  const renderForm = () => {
    const sectionOrder = ['header', 'itemsTable', 'summary', 'termsAndConditions', 'footer'];
    if (loading) return <div>Loading form configuration...</div>;
    if (!config) return <div>Form configuration not found.</div>;

    return (
      <div ref={reportDataRef}>
        {sectionOrder.map((sectionKey) => {
          if (config[sectionKey]) {
            const section = config[sectionKey];
            if (section.fields) {
              return (
                <div key={sectionKey}>
                  <Title level={4}>{sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</Title>
                  {section.fields.map((field, fieldIndex) => (
                    <Form.Item key={fieldIndex} name={field.name || field.label}>
                      {renderField(field)}
                    </Form.Item>
                  ))}
                </div>
              );
            } else if (section.columns) {
              return (
                <div key={sectionKey}>
                  <Title level={4}>{sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</Title>
                  {renderTable(section)}
                </div>
              );
            }
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
          <Button type="primary" onClick={saveToSupabase} disabled={loading}>
            Save Document
          </Button>
          <Button onClick={handlePrint} style={{ marginLeft: '10px' }} disabled={loading}>
            Download PDF
          </Button>
          <Button onClick={handleShare} style={{ marginLeft: '10px' }} disabled={loading}>
            Share Document
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="Share Document"
        visible={isShareModalVisible}
        onOk={handleShareOk}
        onCancel={handleShareCancel}
        okText="Share"
        cancelText="Cancel"
      >
        <Form form={shareForm} layout="vertical">
          <Form.Item label="Recipient Type" name="recipientType" rules={[{ required: true }]}>
            <Select onChange={(value) => setRecipientType(value)}>
              <Option value="email">Email</Option>
              <Option value="user">User</Option>
              <Option value="organization">Organization</Option>
            </Select>
          </Form.Item>

          {recipientType === 'email' && (
            <Form.Item label="Recipient Email" name="recipientEmail" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
          )}
          {recipientType === 'user' && (
            <Form.Item label="Select User" name="recipientUser" rules={[{ required: true }]}>
              <Select>
                {users.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.user_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {recipientType === 'organization' && (
            <Form.Item label="Select Organization" name="recipientOrg" rules={[{ required: true }]}>
              <Select>
                {organizations.map((org) => (
                  <Option key={org.id} value={org.id}>
                    {org.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* <Form.Item name="otpEnabled" valuePropName="checked">
            <Checkbox onChange={(e) => setOtpEnabled(e.target.checked)}>Require OTP</Checkbox>
          </Form.Item> */}

          {/* {otpEnabled && ( */}
          <Form.Item label="OTP" name="otp">
            <Input />
          </Form.Item>
          {/* )} */}

          <Form.Item label="Expiry (minutes)" name="expiry" rules={[{ required: true }]}>
            <InputNumber min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GeneralDocumentComponent;