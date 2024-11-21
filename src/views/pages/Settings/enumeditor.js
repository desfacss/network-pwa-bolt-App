import React, { useState, useEffect } from 'react';
import { Select, Button, Input, Form, Row, Col, message, Modal, List } from 'antd';
import { supabase } from 'configs/SupabaseConfig'; // Ensure you import from the correct config file

const EnumEditor = () => {
  const [enumData, setEnumData] = useState([]);
  const [selectedEnum, setSelectedEnum] = useState(null);
  const [newOption, setNewOption] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalEnumName, setModalEnumName] = useState('');
  const [organizationId, setOrganizationId] = useState('');

  useEffect(() => {
    // Fetch organization ID from the user session (example using Redux, adjust to your state management)
    const userOrganizationId = 'your-session-or-context-value'; // Replace with actual session fetching logic
    const fallbackOrganizationId = 'b67f2ed5-d153-4928-9a1c-822fc146c26a';

    setOrganizationId(userOrganizationId || fallbackOrganizationId);

    // Fetch enums for the organization
    if (userOrganizationId || fallbackOrganizationId) {
      getEnums(userOrganizationId || fallbackOrganizationId);
    }
  }, []);

  const getEnums = async (orgId) => {
    const { data, error } = await supabase
      .from('enums')
      .select('*')
      .eq('organization_id', orgId)
      .eq('is_active', true); // Only get active enums

    if (error) {
      message.error('Failed to fetch enums');
    } else {
      setEnumData(data);
    }
  };

  const handleAddOption = () => {
    if (newOption) {
      const updatedOptions = [...selectedEnum.options, newOption];
      updateEnum(selectedEnum.id, updatedOptions);
      setNewOption('');
    } else {
      message.error('Option cannot be empty');
    }
  };

  const handleDeleteOption = (option) => {
    const updatedOptions = selectedEnum.options.filter(opt => opt !== option);
    updateEnum(selectedEnum.id, updatedOptions);
  };

  const updateEnum = async (enumId, updatedOptions) => {
    const { data, error } = await supabase
      .from('enums')
      .update({ options: updatedOptions })
      .eq('id', enumId)
      .single();

    if (error) {
      message.error('Failed to update enum');
    } else {
      // After updating, refresh the enums list
      getEnums(organizationId);
      message.success('Enum updated successfully');
    }
  };

  const handleCreateEnum = async () => {
    if (!modalEnumName) {
      message.error('Enum name is required');
      return;
    }

    const { data, error } = await supabase
      .from('enums')
      .insert([
        {
          name: modalEnumName,
          options: [], // Initialize with an empty array or any default options
          organization_id: organizationId,
        },
      ]);

    if (error) {
      message.error('Failed to create enum');
    } else {
      message.success('Enum created successfully');
      setIsModalVisible(false);
      getEnums(organizationId); // Refresh enums after creation
    }
  };

  return (
    <div>
      {/* Enum Selection */}
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Select Enum">
              <Select
                value={selectedEnum?.id}
                onChange={(value) => setSelectedEnum(enumData.find(e => e.id === value))}
                placeholder="Select Enum"
              >
                {enumData.map((enumItem) => (
                  <Select.Option key={enumItem.id} value={enumItem.id}>
                    {enumItem.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {selectedEnum && (
          <div>
            {/* Enum Options List */}
            <List
              bordered
              dataSource={selectedEnum.options}
              renderItem={(option) => (
                <List.Item
                  actions={[
                    <Button danger onClick={() => handleDeleteOption(option)}>
                      Delete
                    </Button>,
                  ]}
                >
                  {option}
                </List.Item>
              )}
            />

            {/* Add Option */}
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="New Option">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Enter new option"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Button type="primary" onClick={handleAddOption}>
                  Add Option
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {/* Create New Enum Modal */}
        <Button type="dashed" onClick={() => setIsModalVisible(true)}>
          Create New Enum
        </Button>

        <Modal
          title="Create New Enum"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={handleCreateEnum}
        >
          <Form layout="vertical">
            <Form.Item label="Enum Name">
              <Input
                value={modalEnumName}
                onChange={(e) => setModalEnumName(e.target.value)}
                placeholder="Enter enum name"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Form>
    </div>
  );
};

export default EnumEditor;
