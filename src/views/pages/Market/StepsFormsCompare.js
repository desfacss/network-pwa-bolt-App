import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker, Radio, Checkbox, InputNumber, Col, Row } from 'antd';

const { Option } = Select;

const DynamicForm = ({ schema, onFinish, lastStep, enums }) => {
    const [form] = Form.useForm();
    const [fields, setFields] = useState([]);

    useEffect(() => {
        if (schema && schema.properties) {
            setFields([{ key: 0, schema }]);
        }
    }, [schema]);

    const [radioValues, setRadioValues] = useState({});

    const handleRadioChange = (index, fieldName, value) => {
        setRadioValues({
            ...radioValues,
            [`${index}-${fieldName}`]: value,
        });
    };

    const RenderField = (field, fieldName, index) => {
        const isRequired = schema.required && schema.required.includes(fieldName);
        const rules = [{ required: isRequired, message: `Please input your ${field.title}!` }];

        if (field.format === 'email') {
            rules.push({ type: 'email', message: `Please input a valid ${field.title}!` });
        }

        const colProps = { xs: 24, sm: field.size ? field.size * 12 : 12 };

        const renderFormItem = (component) => (
            <Col {...colProps}>
                <Form.Item
                    key={`${index}-${fieldName}`}
                    name={[index, fieldName]}
                    label={field.title}
                    rules={rules}
                >
                    {component}
                </Form.Item>
            </Col>
        );

        switch (field.format) {
            case 'password':
                return renderFormItem(<Input.Password placeholder={`Enter your ${field.title}`} />);
            case 'radio':
                return (
                    <Col {...colProps}>
                        <Form.Item
                            name={[index, fieldName]}
                            label={field.title}
                            rules={rules}
                        >
                            <Radio.Group onChange={(e) => handleRadioChange(index, fieldName, e.target.value)}>
                                {enums && enums.length > 0 && enums.find(item => item.name === field.enum)?.options?.map((value, i) => (
                                    <Radio key={value} value={value}>
                                        {value}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        </Form.Item>
                        {radioValues[`${index}-${fieldName}`] === field.option && (
                            <Form.Item
                                key={`${index}-${fieldName}-custom`}
                                name={[index, `${fieldName}_custom`]}
                                label={`${field.title} (Other)`}
                                rules={[{ required: isRequired, message: `Please input your ${field.title}!` }]}
                            >
                                <Input placeholder={`Enter your ${field.title}`} />
                            </Form.Item>
                        )}
                    </Col>
                );
            case 'select':
                return renderFormItem(
                    <Select placeholder={`Select a ${field.title}`}>
                        {enums && enums.length > 0 && enums.find(item => item.name === field.enum)?.options?.map(option => (
                            <Option key={option} value={option}>
                                {option}
                            </Option>
                        ))}
                    </Select>
                );
            case 'number':
                return renderFormItem(<InputNumber placeholder={`Enter your ${field.title}`} />);
            case 'date':
                return renderFormItem(<DatePicker style={{ width: '100%' }} placeholder={`Select a ${field.title}`} />);
            case 'checkbox':
                return (
                    <Col {...colProps}>
                        <Form.Item
                            name={[index, fieldName]}
                            label={field.title}
                            valuePropName="checked"
                        >
                            <Checkbox>{field.title}</Checkbox>
                        </Form.Item>
                    </Col>
                );
            case 'link':
                return renderFormItem(<Input defaultValue="mysite" addonBefore="http://" placeholder={`Enter your ${field.title}`} />);
            default:
                return renderFormItem(<Input placeholder={`Enter your ${field.title}`} />);
        }
    };

    const addFields = () => {
        setFields([...fields, { key: fields.length, schema }]);
    };

    const onNext = (values) => {
        onFinish(values);
        form.resetFields();
    };

    return (
        <>
            {fields && <Form
                form={form}
                name="dynamic_form"
                layout="vertical"
                onFinish={onNext}
            >
                <Row gutter={16}>
                    {fields.map((fieldSet, index) =>
                        fieldSet?.schema?.properties && Object.keys(fieldSet?.schema?.properties).map((key) => RenderField(fieldSet?.schema?.properties[key], key, index))
                    )}
                </Row>
                {schema.is_repeatable && (
                    <Form.Item>
                        <Button type="dashed" onClick={addFields} style={{ width: '100%' }}>
                            Add {schema?.title}
                        </Button>
                    </Form.Item>
                )}
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        {lastStep ? 'Submit' : 'Next'}
                    </Button>
                </Form.Item>
            </Form>}
        </>
    );
};

export default DynamicForm;
