import React, { useEffect } from 'react';
import { Table, Button, Form, Space, Input, Popover } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from 'api/supabaseClient';
import { Select } from 'antd';

const { Option } = Select;

const ConfigEditor = ({ detailView, entityType }) => {
    const [form] = Form.useForm();

    // Predefined static tab options
    const staticTabOptions = ["files", "notes", "status"];
    const tabViewOptions = ["tableview", "gridview", "kanbanview", "calendarview", "timelineview", "ganttview", "dashboardview"];

    useEffect(() => {
        form.setFieldsValue({
            staticTabs: detailView?.staticTabs || [],
            dynamicTabs: detailView?.dynamicTabs || []
        });
    }, [detailView, form]);

    const columnsStatic = [
        {
            title: 'Tab',
            dataIndex: 'tab',
            key: 'tab',
            render: (_, record, index) => (
                <Form.Item
                    name={[index, 'tab']}
                    rules={[{ required: true, message: 'Please select a tab!' }]}
                >
                    <Select placeholder="Select tab">
                        {staticTabOptions.map(option => (
                            <Option key={option} value={option}>{option}</Option>
                        ))}
                    </Select>
                </Form.Item>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record, index) => (
                <Button
                    onClick={() => {
                        const staticTabs = form.getFieldValue('staticTabs');
                        staticTabs.splice(index, 1);
                        form.setFieldsValue({ staticTabs });
                    }}
                    icon={<DeleteOutlined />}
                    danger
                />
            ),
        },
    ];

    const columnsDynamic = [
        {
            title: 'Label',
            dataIndex: 'label',
            key: 'label',
            render: (_, record, index) => (
                <Form.Item
                    name={[index, 'label']}
                    rules={[{ required: true, message: 'Please input the label!' }]}
                >
                    <Input placeholder="Label" />
                </Form.Item>
            ),
        },
        {
            title: 'Entity Type',
            dataIndex: ['props', 'entityType'],
            key: 'entityType',
            render: (_, record, index) => (
                <Form.Item
                    name={[index, 'props', 'entityType']}
                    rules={[{ required: true, message: 'Please input the entity type!' }]}
                >
                    <Input placeholder="Entity Type" />
                </Form.Item>
            ),
        },
        {
            title: 'Filters',
            key: 'filters',
            render: (_, record, index) => (
                <Form.Item name={[index, 'props', 'filters']}>
                    <Popover
                        content={
                            <FilterEditor
                                filters={record?.props?.filters || []}
                                onChange={(newFilters) => {
                                    const dynamicTabs = form.getFieldValue('dynamicTabs');
                                    dynamicTabs[index].props.filters = newFilters;
                                    form.setFieldsValue({ dynamicTabs });
                                }}
                            />
                        }
                        title="Edit Filters"
                        trigger="click"
                    >
                        <Button type="primary">Edit</Button>
                    </Popover>
                </Form.Item>
            ),
        },
        {
            title: 'Tabs',
            key: 'tabs',
            render: (_, record, index) => (
                <Form.Item name={[index, 'props', 'tabs']}>
                    <Select mode="multiple" placeholder="Select Tabs">
                        {tabViewOptions.map(option => (
                            <Option key={option} value={option}>{option}</Option>
                        ))}
                    </Select>
                </Form.Item>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record, index) => (
                <Button
                    onClick={() => {
                        const dynamicTabs = form.getFieldValue('dynamicTabs');
                        dynamicTabs.splice(index, 1);
                        form.setFieldsValue({ dynamicTabs });
                    }}
                    icon={<DeleteOutlined />}
                    danger
                />
            ),
        },
    ];

    const handleAddStatic = () => {
        const staticTabs = form.getFieldValue('staticTabs') || [];
        form.setFieldsValue({ staticTabs: [...staticTabs, ''] });
    };

    const handleAddDynamic = () => {
        const dynamicTabs = form.getFieldValue('dynamicTabs') || [];
        form.setFieldsValue({ dynamicTabs: [...dynamicTabs, { label: '', props: { entityType: '', filters: [], tabs: [] } }] });
    };

    const onFinish = async (values) => {
        console.log("nn", entityType);
        try {
            const { data, error } = await supabase.from('y_view_config')
                .update({
                    detailview: {
                        staticTabs: values.staticTabs,
                        dynamicTabs: values.dynamicTabs
                    }
                })
                .eq('entity_type', entityType).select('*');

            if (error) throw error;
            console.log('Config saved successfully!', data);
        } catch (error) {
            console.error('Error saving config:', error.message);
        }
    };

    const FilterEditor = ({ filters, onChange }) => {
        const [filterList, setFilterList] = React.useState(filters);

        const handleAddFilter = () => {
            setFilterList([...filterList, { column: '', value: '' }]);
        };

        const handleFilterChange = (index, field, value) => {
            const updatedFilters = [...filterList];
            updatedFilters[index][field] = value;
            setFilterList(updatedFilters);
            onChange(updatedFilters); // Important: Update parent component's state
        };

        const handleDeleteFilter = (index) => {
            const updatedFilters = filterList.filter((_, i) => i !== index);
            setFilterList(updatedFilters);
            onChange(updatedFilters); // Important: Update parent component's state
        };

        const filterColumns = [
            {
                title: 'Column',
                dataIndex: 'column',
                key: 'column',
                render: (_, record, index) => (
                    <Input
                        placeholder="Column"
                        value={record.column}
                        onChange={(e) => handleFilterChange(index, 'column', e.target.value)}
                    />
                )
            },
            {
                title: 'Value',
                dataIndex: 'value',
                key: 'value',
                render: (_, record, index) => (
                    <Input
                        placeholder="Value"
                        value={record.value}
                        onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                    />
                )
            },
            {
                title: 'Action',
                key: 'action',
                render: (_, record, index) => (
                    <Button onClick={() => handleDeleteFilter(index)} icon={<DeleteOutlined />} danger />
                ),
            },
        ];

        return (
            <div>
                <Table columns={filterColumns} dataSource={filterList} pagination={false} />
                <Button onClick={handleAddFilter} icon={<PlusOutlined />}>Add Filter</Button>
            </div>
        );
    };

    return (
        <Form form={form} onFinish={onFinish}>
            <h3>Static Tabs</h3>
            <Form.List name="staticTabs">
                {(fields, { add, remove }) => (
                    <>
                        <Table
                            columns={columnsStatic}
                            dataSource={fields.map((field, index) => ({ ...field, key: `static-${index}` }))}
                            pagination={false}
                        />
                        <Button onClick={handleAddStatic} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>Add Static Tab</Button>
                    </>
                )}
            </Form.List>

            <h3>Dynamic Tabs</h3>
            <Form.List name="dynamicTabs">
                {(fields, { add, remove }) => (
                    <>
                        <Table
                            columns={columnsDynamic}
                            dataSource={fields.map((field, index) => ({ ...field, key: `dynamic-${index}` }))}
                            pagination={false}
                        />
                        <Button onClick={handleAddDynamic} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>Add Dynamic Tab</Button>
                    </>
                )}
            </Form.List>

            <Form.Item>
                <Button type="primary" htmlType="submit">Save Configuration</Button>
            </Form.Item>
        </Form>
    );
};

export default ConfigEditor;