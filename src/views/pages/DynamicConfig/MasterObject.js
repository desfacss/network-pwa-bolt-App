import React, { useState, useEffect } from 'react';
import { Select, Button, Form, Table, message, Tooltip, Input } from 'antd';
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
                console.log('Data from get_columns_v17:', columnsResponse.data);
                const masterObjectResponse = await supabase
                    .from('y_view_config')
                    .select('master_object')
                    .eq('entity_type', entityType)
                    .single();
                console.log('Data from master_object:', masterObjectResponse.data);

                if (columnsResponse.error) throw columnsResponse.error;
                if (masterObjectResponse.error) throw masterObjectResponse.error;

                setColumns(columnsResponse.data || []);
                setMasterObject(masterObjectResponse.data?.master_object || {});

                // Set form initial values based on existing data
                const initialValues = columnsResponse.data.reduce((acc, col) => {
                    const masterObjEntry = masterObject[col.key] || {};
                    acc[col.key] = {
                        type: masterObjEntry.type || col.type,
                        source_table: masterObjEntry.foreign_key?.source_table || col.foreign_key?.source_table || col.potential_fk?.source_table || '',
                        source_column: masterObjEntry.foreign_key?.source_column || col.foreign_key?.source_column || col.potential_fk?.source_column || '',
                        display_column: masterObjEntry.foreign_key?.display_column || col.foreign_key?.display_column || col.potential_fk?.display_column || ''
                    };
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
            const masterObjectData = Object.entries(values).map(([key, field]) => {
                const foreignKey = {
                    source_table: field.source_table.trim() || undefined,
                    source_column: field.source_column.trim() || undefined,
                    display_column: field.display_column.trim() || undefined
                };

                const entry = {
                    key: key,
                    type: field.type,
                    foreign_key: Object.values(foreignKey).every(v => v === undefined) ? undefined : foreignKey
                };

                return entry;
            });

            const { error } = await supabase
                .from('y_view_config')
                .upsert({
                    entity_type: entityType,
                    master_object: masterObjectData.filter(item => item.foreign_key || item.type !== item.key)
                }, {
                    onConflict: 'entity_type',
                    ignoreDuplicates: false
                });

            if (error) {
                console.error('Supabase error:', error);
                throw new Error(`Error updating master object: ${error.message}`);
            }

            message.success('Configuration saved successfully!');
            setMasterObject(masterObjectData.reduce((acc, obj) => ({...acc, [obj.key]: obj}), {}));
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
                const isUpdated = masterObject[record.key] && masterObject[record.key].type !== record.type;
                const isNew = !masterObject[record.key];
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
            dataIndex: ['type'],
            key: 'type',
            render: (_, record) => {
                const isUpdated = masterObject[record.key] && masterObject[record.key].type !== record.type;
                const isNew = !masterObject[record.key];
                const rowStyle = isUpdated ? { backgroundColor: 'lightgreen' } : isNew ? { backgroundColor: 'lightpink' } : {};
                
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isUpdated && (
                            <Tooltip title="Updated in master_object">
                                <CheckCircleFilled style={{ color: 'green', marginRight: '5px' }} />
                            </Tooltip>
                        )}
                        {isNew && (
                            <Tooltip title="New from get_columns_v17">
                                <ExclamationCircleFilled style={{ color: 'red', marginRight: '5px' }} />
                            </Tooltip>
                        )}
                        <Form.Item name={[record.key, 'type']} noStyle>
                            <Select style={{ width: '100%' }} defaultValue={masterObject[record.key]?.type || record.type}>
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
            dataIndex: ['source_table'],
            key: 'source_table',
            render: (_, record) => (
                <Form.Item name={[record.key, 'source_table']} noStyle>
                    <Input placeholder="Source Table" defaultValue={masterObject[record.key]?.foreign_key?.source_table || record.foreign_key?.source_table || record.potential_fk?.source_table || ''} />
                </Form.Item>
            )
        },
        {
            title: 'Source Column',
            dataIndex: ['source_column'],
            key: 'source_column',
            render: (_, record) => (
                <Form.Item name={[record.key, 'source_column']} noStyle>
                    <Input placeholder="Source Column" defaultValue={masterObject[record.key]?.foreign_key?.source_column || record.foreign_key?.source_column || record.potential_fk?.source_column || ''} />
                </Form.Item>
            )
        },
        {
            title: 'Display Column',
            dataIndex: ['display_column'],
            key: 'display_column',
            render: (_, record) => (
                <Form.Item name={[record.key, 'display_column']} noStyle>
                    <Input placeholder="Display Column" defaultValue={masterObject[record.key]?.foreign_key?.display_column || record.foreign_key?.display_column || record.potential_fk?.display_column || ''} />
                </Form.Item>
            )
        }
    ];

    const data = columns.map(col => ({
        key: col.key,
        ...col,
        type: col.type,
        foreign_key: col.foreign_key || {},
        potential_fk: col.potential_fk || {}
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