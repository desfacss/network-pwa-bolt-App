import React from 'react';
import { Form, Input, Select, Button } from 'antd';

const { Option } = Select;

const schema = {
    properties: {
        email: {
            title: 'email',
            type: 'string',
            format: 'email',
            maxLength: 10,
            minLength: 5
        },
        name: {
            title: 'name',
            type: 'string',
            default: 'john',
            minLength: 6,
            maxLength: 12
        },
        gender: {
            enum: ['male', 'female', 'other'],
            title: 'Gender',
            type: 'string',
            enumNames: ['M', 'F', 'O']
        },
        desc: {
            title: 'description',
            type: 'string'
        }
    },
    required: ['name', 'email'],
    type: 'object'
};


export default () => {
    const [form] = Form.useForm();

    if (!schema || !schema.properties) {
        return <div>Error: Schema is not defined correctly.</div>;
    }

    const renderField = (field, fieldName) => {
        const isRequired = schema.required && schema.required.includes(fieldName);

        switch (field.type) {
            case 'string':
                if (field.enum) {
                    return (
                        <Form.Item
                            key={fieldName}
                            name={fieldName}
                            label={field.title}
                            rules={[
                                { required: isRequired, message: `Please select your ${field.title}!` }
                            ]}
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
                } else {
                    return (
                        <Form.Item
                            key={fieldName}
                            name={fieldName}
                            label={field.title}
                            rules={[
                                { required: isRequired, message: `Please input your ${field.title}!` },
                                field.format && { type: field.format, message: `Please input a valid ${field.title}!` },
                                field.maxLength && { max: field.maxLength, message: `Max length is ${field.maxLength}!` },
                                field.minLength && { min: field.minLength, message: `Min length is ${field.minLength}!` }
                            ].filter(Boolean)}
                        >
                            <Input placeholder={`Enter your ${field.title}`} />
                        </Form.Item>
                    );
                }
            default:
                return null;
        }
    };

    const onFinish = (values) => {
        console.log('Success:', values);
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Form
            form={form}
            name="dynamic_form"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
        >
            {Object.keys(schema.properties).map((key) => renderField(schema.properties[key], key))}
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};
