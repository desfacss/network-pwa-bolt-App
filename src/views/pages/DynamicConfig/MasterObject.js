import React, { useState, useEffect } from 'react';
import { Select, Button, Form, Table, message, Tooltip } from 'antd';
import { CheckCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { supabase } from 'api/supabaseClient';

const { Option } = Select;

const MasterObject = ({ entityType }) => {
    const [columns, setColumns] = useState({});
    const [masterObject, setMasterObject] = useState({});
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();

    useEffect(() => {
        async function fetchData() {
            try {
                const columnsResponse = await supabase.rpc('get_columns_v10', { tablename: entityType });
                const masterObjectResponse = await supabase
                    .from('y_view_config')
                    .select('master_object')
                    .eq('entity_type', entityType)
                    .single();

                if (columnsResponse.error) throw columnsResponse.error;
                if (masterObjectResponse.error) throw masterObjectResponse.error;

                setColumns(columnsResponse.data || {});
                setMasterObject(masterObjectResponse.data?.master_object || {});

                // Set form initial values based on existing data
                const initialValues = Object.entries(columnsResponse.data || {}).reduce((acc, [field, type]) => {
                    acc[field] = masterObjectResponse.data?.master_object[field] || type;
                    return acc;
                }, {});
                form.setFieldsValue(initialValues);
            } catch (error) {
                console.error('Error fetching columns or master object:', error.message);
            } finally {
                setLoading(false);
            }
        }

        if (entityType) {
            fetchData();
        }
    }, [entityType, form]);

    const onFinish = async (values) => {
        try {
            console.log("Form values:", values); // Log to check if onFinish is called
            const masterObjectData = Object.entries(values).reduce((acc, [field_name, data_type]) => {
                acc[field_name] = data_type;
                return acc;
            }, {});
    
            // Update or insert into y_view_config table
            const { error } = await supabase
                .from('y_view_config')
                .upsert({
                    entity_type: entityType,
                    master_object: masterObjectData
                }, {
                    onConflict: 'entity_type',
                    ignoreDuplicates: false
                });
    
            if (error) {
                console.error('Supabase error:', error);
                throw new Error(`Error updating master object: ${error.message}`);
            }
    
            message.success('Configuration saved successfully!');
            setMasterObject(masterObjectData);
        } catch (error) {
            console.error('Error in onFinish:', error);
            message.error('Failed to save configuration: ' + error.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    const dataTypeOptions = [
        'bigint', 'integer', 'smallint', 'numeric', 'real', 'double precision',
        'text', 'varchar', 'char', 'date', 'timestamp', 'timestamp with time zone',
        'boolean', 'uuid', 'json', 'jsonb', 'array'
    ];

    const columnsDef = [
        {
            title: 'Field Names',
            dataIndex: 'field',
            key: 'field',
            render: (text, record) => {
                const isUpdated = masterObject[record.field] && masterObject[record.field] !== record.dataType;
                const isNew = !masterObject[record.field] && record.dataType;
                const rowStyle = isUpdated ? { backgroundColor: 'lightgreen' } : isNew ? { backgroundColor: 'lightpink' } : {};
                return (
                    <span style={rowStyle}>
                        {text} ({record.dataType})
                    </span>
                );
            },
        },
        {
            title: 'Data Type (Select)',
            dataIndex: 'selectType',
            key: 'selectType',
            render: (_, record) => {
                const isUpdated = masterObject[record.field] && masterObject[record.field] !== record.dataType;
                const isNew = !masterObject[record.field] && record.dataType;
                const rowStyle = isUpdated ? { backgroundColor: 'lightgreen' } : isNew ? { backgroundColor: 'lightpink' } : {};

                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isUpdated && (
                            <Tooltip title="Updated in master_object">
                                <CheckCircleFilled style={{ color: 'green', marginRight: '5px' }} />
                            </Tooltip>
                        )}
                        {isNew && (
                            <Tooltip title="New from get_columns_v6">
                                <ExclamationCircleFilled style={{ color: 'red', marginRight: '5px' }} />
                            </Tooltip>
                        )}
                        <Form.Item name={record.field} noStyle>
                            <Select style={{ width: '100%' }} defaultValue={record.dataType}>
                                {dataTypeOptions.map(type => (
                                    <Option key={type} value={type}>{type}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                );
            }
        },
    ];

    const data = Object.entries(columns).map(([field_name, data_type]) => ({
        key: field_name,
        field: field_name,
        dataType: data_type,
        selectType: data_type
    }));

    return (
        <Form form={form} onFinish={onFinish}>
            <Table
                columns={columnsDef}
                dataSource={data}
                pagination={false}
                bordered
            />
            <Button type="primary" htmlType="submit" style={{ marginTop: '10px' }}>Save</Button>
        </Form>
    );
};

export default MasterObject;