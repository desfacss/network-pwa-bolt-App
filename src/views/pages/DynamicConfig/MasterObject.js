import React, { useState, useEffect } from 'react';
import { Select, Button, Form, Input, Divider, message } from 'antd';
import { supabase } from 'api/supabaseClient';

const { Option } = Select;

const MasterObject = ({ entityType }) => {
    const [columns, setColumns] = useState({});
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();

    useEffect(() => {
        async function fetchColumns() {
            try {
                const { data, error } = await supabase.rpc('get_columns_v5', { tablename: entityType });
                console.log("rpc data", data, entityType)
                if (error) throw error;
                setColumns(data);
                // Set form initial values based on existing data
                form.setFieldsValue(data);
            } catch (error) {
                console.error('Error fetching columns:', error.message);
            } finally {
                setLoading(false);
            }
        }
        if (entityType) {
            fetchColumns();
        }
    }, [entityType, form]);

    const onFinish = async (values) => {
        try {
            // Prepare the data structure for master_object
            const masterObjectData = Object.entries(values).reduce((acc, [field_name, data_type]) => {
                acc[field_name] = data_type;
                return acc;
            }, {});

            // Update or insert into y_view_config table
            const { data, error } = await supabase
                .from('y_view_config')
                .upsert({
                    entity_type: entityType,
                    master_object: masterObjectData
                }, {
                    onConflict: 'entity_type',
                    ignoreDuplicates: false
                });
            // console.log("gt", data, error)
            if (error) throw error;

            message.success('Configuration saved successfully!');
        } catch (error) {
            console.error('Error saving configuration:', error.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    // Possible data types for PostgreSQL (adjust according to your needs)
    const dataTypeOptions = [
        'bigint', 'integer', 'smallint', 'numeric', 'real', 'double precision',
        'text', 'varchar', 'char', 'date', 'timestamp', 'timestamp with time zone',
        'boolean', 'uuid', 'json', 'jsonb', 'array'
    ];

    return (
        <Form form={form} onFinish={onFinish} layout="vertical">
            {Object.entries(columns).map(([field_name, data_type], index) => (
                <React.Fragment key={field_name}>
                    {index > 0 && <Divider />}
                    <Form.Item
                        label={field_name}
                        name={field_name}
                    >
                        <Select defaultValue={data_type} placeholder="Select data type">
                            {dataTypeOptions.map(type => (
                                <Option key={type} value={type}>{type}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </React.Fragment>
            ))}
            <Button type="primary" htmlType="submit">Save</Button>
        </Form>
    );
};

export default MasterObject;