import React from 'react';
import { Form, Input, Select, Button, DatePicker, Radio, Checkbox, InputNumber } from 'antd';

const { Option } = Select;

const DynamicForm = ({ schema, onFinish, lastStep }) => {
    const [form] = Form.useForm();

    if (!schema || !schema?.properties) {
        return <div>Error: Schema is not defined correctly.</div>;
    }

    const renderField = (field, fieldName) => {
        const isRequired = schema.required && schema.required.includes(fieldName);

        const rules = [{ required: isRequired, message: `Please input your ${field.title}!` }];
        if (field.format === 'email') {
            rules.push({ type: 'email', message: `Please input a valid ${field.title}!` });
        }

        switch (field.format) {
            case 'password':
                return (
                    <Form.Item
                        key={fieldName}
                        name={fieldName}
                        label={field.title}
                        rules={rules}
                    >
                        <Input.Password placeholder={`Enter your ${field.title}`} />
                    </Form.Item>
                );
            case 'radio':
                return (
                    <Form.Item
                        key={fieldName}
                        name={fieldName}
                        label={field.title}
                        rules={rules}
                    >
                        <Radio.Group>
                            {field.enum.map((value, index) => (
                                <Radio key={value} value={value}>
                                    {field.enumNames ? field.enumNames[index] : value}
                                </Radio>
                            ))}
                        </Radio.Group>
                    </Form.Item>
                );
            case 'select':
                return (
                    <Form.Item
                        key={fieldName}
                        name={fieldName}
                        label={field.title}
                        rules={rules}
                    >
                        <Select placeholder={`Select a ${field.title}`}>
                            {field.enum.map((value, index) => (
                                <Option key={value} value={value}>
                                    {field.enumNames ? field.enumNames[index] : value}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                );
            case 'number':
                return (
                    <Form.Item
                        key={fieldName}
                        name={fieldName}
                        label={field.title}
                        rules={rules}
                    >
                        <InputNumber placeholder={`Enter your ${field.title}`} />
                    </Form.Item>
                );
            case 'date':
                return (
                    <Form.Item
                        key={fieldName}
                        name={fieldName}
                        label={field.title}
                        rules={rules}
                    >
                        <DatePicker style={{ width: '100%' }} placeholder={`Select a ${field.title}`} />
                    </Form.Item>
                );
            case 'checkbox':
                return (
                    <Form.Item
                        key={fieldName}
                        name={fieldName}
                        valuePropName="checked"
                        rules={rules}
                    >
                        <Checkbox>{field.title}</Checkbox>
                    </Form.Item>
                );
            default:
                return (
                    <Form.Item
                        key={fieldName}
                        name={fieldName}
                        label={field.title}
                        rules={rules}
                    >
                        <Input placeholder={`Enter your ${field.title}`} />
                    </Form.Item>
                );
        }
    };

    return (
        <Form
            form={form}
            name="dynamic_form"
            layout="vertical"
            onFinish={onFinish}
        >
            {Object.keys(schema.properties).map((key) => renderField(schema.properties[key], key))}
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {lastStep ? 'Submit' : 'Next'}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default DynamicForm;
