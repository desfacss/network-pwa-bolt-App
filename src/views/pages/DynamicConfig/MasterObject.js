import React, { useState, useEffect } from 'react';
import { Select, Button, Form, Table, message, Tooltip } from 'antd';
import { CheckCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { supabase } from 'api/supabaseClient';

const { Option } = Select;

const MasterObject = ({ entityType }) => {
    const [columns, setColumns] = useState([]);
    const [masterObject, setMasterObject] = useState({});
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();

    useEffect(() => {
        async function fetchData() {
            try {
                const columnsResponse = await supabase.rpc('get_columns_v17', { tablename: entityType });
                const masterObjectResponse = await supabase
                    .from('y_view_config')
                    .select('master_object')
                    .eq('entity_type', entityType)
                    .single();

                if (columnsResponse.error) throw columnsResponse.error;
                if (masterObjectResponse.error) throw masterObjectResponse.error;

                setColumns(columnsResponse.data || []);
                setMasterObject(masterObjectResponse.data?.master_object || {});

                // Set form initial values based on existing data
                const initialValues = columnsResponse.data.reduce((acc, col) => {
                    acc[col.key] = masterObjectResponse.data?.master_object[col.key] || col.type;
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
            const masterObjectData = Object.entries(values).map(([key, type]) => {
                const column = columns.find(col => col.key === key);
                return {
                    key: key,
                    type: type,
                    ...(column?.foreign_key ? { foreign_key: column.foreign_key } : {})
                };
            });

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
            setMasterObject(masterObjectData.reduce((acc, obj) => ({...acc, [obj.key]: obj.type}), {}));
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
            dataIndex: 'key',
            key: 'key',
            render: (text, record) => {
                const isUpdated = masterObject[record.key] && masterObject[record.key] !== record.type;
                const isNew = !masterObject[record.key] && record.type;
                const rowStyle = isUpdated ? { backgroundColor: 'lightgreen' } : isNew ? { backgroundColor: 'lightpink' } : {};
                return (
                    <span style={rowStyle}>
                        {text} ({record.type})
                    </span>
                );
            },
        },
        {
            title: 'Data Type (Select)',
            dataIndex: 'type',
            key: 'type',
            render: (_, record) => {
                const isUpdated = masterObject[record.key] && masterObject[record.key] !== record.type;
                const isNew = !masterObject[record.key] && record.type;
                const rowStyle = isUpdated ? { backgroundColor: 'lightgreen' } : isNew ? { backgroundColor: 'lightpink' } : {};
                
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isUpdated && (
                            <Tooltip title="Updated in master_object">
                                <CheckCircleFilled style={{ color: 'green', marginRight: '5px' }} />
                            </Tooltip>
                        )}
                        {isNew && (
                            <Tooltip title="New from get_columns_v15">
                                <ExclamationCircleFilled style={{ color: 'red', marginRight: '5px' }} />
                            </Tooltip>
                        )}
                        <Form.Item name={record.key} noStyle>
                            <Select style={{ width: '100%' }} 
                                defaultValue={masterObject[record.key] || record.type}>
                                {dataTypeOptions.map(type => (
                                    <Option key={type} value={type}>{type}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                );
            }
        },
        {
            title: 'Source Table',
            dataIndex: 'foreign_key.source_table',
            key: 'source_table',
            render: sourceTable => sourceTable || '-'
        },
        {
            title: 'Source Column',
            dataIndex: 'foreign_key.source_column',
            key: 'source_column',
            render: sourceColumn => sourceColumn || '-'
        },
        {
            title: 'Display Column',
            dataIndex: 'foreign_key.display_column',
            key: 'display_column',
            render: displayColumn => displayColumn || '-'
        }
    ];

    const data = columns.map(col => ({
        key: col.key,
        ...col,
        type: col.type,
        foreign_key: col.foreign_key || {}
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