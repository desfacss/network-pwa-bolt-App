import React, { useState, useEffect } from 'react';
import { Select, Button, Input, Form, Row, Col, message, Modal, List, Popconfirm } from 'antd';
import { supabase } from 'configs/SupabaseConfig'; // Ensure you import from the correct config file
import { useSelector } from 'react-redux';

const EnumEditor = () => {
  const [enumData, setEnumData] = useState([]);
  const [selectedEnum, setSelectedEnum] = useState(null);
  const [newOption, setNewOption] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalEnumName, setModalEnumName] = useState('');
  const [editingOption, setEditingOption] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [organizationId, setOrganizationId] = useState('');

  const { session } = useSelector((state) => state.auth);

  useEffect(() => {
    const userOrganizationId = session?.user?.organization?.id;
    setOrganizationId(userOrganizationId);

    // Fetch enums for the organization
    if (userOrganizationId) {
      getEnums(userOrganizationId);
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

  const handleEditOption = (option) => {
    setEditingOption(option);
    setEditingValue(option);
  };

  const handleSaveEdit = () => {
    if (editingValue) {
      const updatedOptions = selectedEnum.options.map(opt =>
        opt === editingOption ? editingValue : opt
      );
      updateEnum(selectedEnum.id, updatedOptions);
      setEditingOption(null);
      setEditingValue('');
    } else {
      message.error('Option cannot be empty');
    }
  };

  const updateEnum = async (enumId, updatedOptions) => {
    const { data, error } = await supabase
      .from('enums')
      .update({ options: updatedOptions })
      .eq('id', enumId);

    if (error) {
      message.error('Failed to update enum');
      console.error('Error updating enum:', error);
    } else {
      message.success('Enum updated successfully');
      await getEnums(organizationId);

      // Update the currently selected enum
      setSelectedEnum((prevSelected) => ({
        ...prevSelected,
        options: updatedOptions,
      }));
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
                onChange={(value) => setSelectedEnum(enumData?.find(e => e?.id === value))}
                placeholder="Select Enum"
              >
                {enumData?.map((enumItem) => (
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
              dataSource={selectedEnum?.options}
              renderItem={(option) => (
                <List.Item
                  actions={[
                    editingOption === option ? (
                      <Button type="primary" onClick={handleSaveEdit}>
                        Save
                      </Button>
                    ) : (
                      <Button onClick={() => handleEditOption(option)}>Edit</Button>
                    ),
                    <Popconfirm
                      title="Are you sure you want to delete this option?"
                      onConfirm={() => handleDeleteOption(option)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button danger>Delete</Button>
                    </Popconfirm>,
                  ]}
                >
                  {editingOption === option ? (
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      placeholder="Edit option"
                    />
                  ) : (
                    option
                  )}
                </List.Item>
              )}
            />

            {/* Add Option */}
            <Row gutter={16}>
              <Col span={8}>
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Enter new option"
                />
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
          open={isModalVisible}
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
