import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker, Radio, Checkbox, InputNumber, Col, Row, Divider } from 'antd';
const { TextArea } = Input;
const { Option } = Select;

const DynamicForm = ({ schema, onFinish, firstStep, lastStep, enums, setMessageAbort, initialValues, prev }) => {
    const [form] = Form.useForm();
    const [fields, setFields] = useState([]);
    const [radioValues, setRadioValues] = useState({});

    useEffect(() => {
        if (initialValues) {
            initialValues?.forEach((item, index) => {
                for (let key in item) {
                    if (key.endsWith('_custom')) {
                        let newKey = key.slice(0, -7); // Remove '_custom' from the key
                        // handleRadioChange(index, newKey, item[key]);
                        handleRadioChange(index, newKey, initialValues[index][newKey]);
                    }
                }
            });
            console.log("T", initialValues);
            form.setFieldsValue(initialValues);
            let i = 1
            while (initialValues?.length > i) {
                // console.log("i", i)
                addFields()
                i++
            }
        }
    }, [initialValues])
    const handleRadioChange = (index, fieldName, value, isDelete) => {
        // console.log("T", index, fieldName, value)
        // setRadioValues({
        //     ...radioValues,
        //     [`${index}-${fieldName}`]: isDelete ? null : value,
        // });
        setRadioValues(prevState => ({
            ...prevState,
            [`${index}-${fieldName}`]: isDelete ? null : value,
        }));
    };

    useEffect(() => {
        if (schema && schema.properties) {
            const orderSchema = reorderProperties(schema);
            setFields([{ key: 0, schema: orderSchema }]);
        }
    }, [schema]);

    function reorderProperties(obj) {
        const orderedProperties = {};

        // Extract properties and sort them by order
        const sortedProperties = Object.keys(obj.properties)
            .map(key => ({ key, ...obj.properties[key] }))
            .sort((a, b) => a.ui_order - b.ui_order);

        // Rebuild the properties object in sorted order
        sortedProperties.forEach(property => {
            const { key, ...rest } = property;
            orderedProperties[key] = rest;
        });

        return {
            ...obj,
            properties: orderedProperties
        };
    }
    if (!schema || !schema.properties) {
        return <div>Refresh Page</div>;
    }

    const addFields = () => {
        const orderSchema = reorderProperties(schema);
        setFields([...fields, { key: fields.length, schema: orderSchema }]);
    };

    const deleteFields = (key) => {
        setFields(fields.filter(field => field.key !== key));
    };

    const onNext = (values) => {
        onFinish(values);
        form.resetFields();
    };

    const RenderField = (field, fieldName, index) => {
        const isRequired = schema.required && schema.required.includes(fieldName);
        const rules = [{ required: isRequired, message: `Please input your ${field.title}!` }];

        if (field.format === 'email') {
            rules.push({ type: 'email', message: `Please input a valid ${field.title}!` });
        }

        const commonProps = {
            key: `${index}-${fieldName}`,
            name: [index, fieldName],
            label: field.title,
            tooltip: field.description,
            rules: rules,
        };
        const colProps = { xs: 24, sm: field.size ? field.size * 12 : 12 };

        const renderFormItem = (component) => (
            <Col {...colProps}>
                <Form.Item {...commonProps}>{component}</Form.Item>
            </Col>
        );

        switch (field.format) {
            case 'password':
                return renderFormItem(<Input.Password placeholder={`Enter ${field.title}`} />);
            case 'radio':
                return (
                    <>
                        {renderFormItem(
                            <Radio.Group
                                onChange={(e) => handleRadioChange(index, fieldName, e.target.value)}
                            >
                                {enums && enums.length > 0 && enums.find(item => item.name === field.enum)?.options?.map((value, i) => (
                                    <Radio key={value} value={value}>
                                        {value}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                        {field.option && radioValues[`${index}-${fieldName}`] === field.option && (
                            <Col {...colProps} span={24}>
                                <Form.Item
                                    key={`${index}-${fieldName}-custom`}
                                    name={[index, `${fieldName}_custom`]}
                                    rules={[{ required: isRequired, message: `Please input ${field.title}!` }]}
                                >
                                    <Input placeholder={`${field.option} Specify`} />
                                </Form.Item>
                            </Col>
                        )}
                    </>
                );
            case 'select':
                return (
                    <>
                        {renderFormItem(
                            <Select placeholder={`Select a ${field.title}`} showSearch onChange={(e) => handleRadioChange(index, fieldName, e)} >
                                {enums && enums.length > 0 && enums.find(item => item.name === field.enum)?.options?.map(option => (
                                    <Option key={option} value={option}>
                                        {option}
                                    </Option>
                                ))}
                            </Select>
                        )}
                        {field.option && radioValues[`${index}-${fieldName}`] === field.option && (
                            <Col {...colProps} span={24}>
                                <Form.Item
                                    key={`${index}-${fieldName}-custom`}
                                    name={[index, `${fieldName}_custom`]}
                                    label=' '
                                // rules={[{ required: isRequired, message: `Please input ${field.title}!` }]}
                                >
                                    <Input placeholder={`${field.option} Specify`} />
                                </Form.Item>
                            </Col>
                        )}
                    </>
                );
            case 'section':
                return (
                    <Row>
                        <Col span={24} className='mb-0 pb-0'>
                            <h3>{field?.title}</h3>
                        </Col>
                        <Col span={24}>
                            <p>{field?.description}</p>
                        </Col>
                    </Row>
                );
            case 'number':
                return renderFormItem(<InputNumber placeholder={`Enter ${field.title}`} />);
            case 'date':
                return renderFormItem(<DatePicker style={{ width: '100%' }} placeholder={`Select a ${field.title}`} />);
            case 'checkbox':
                return (
                    <Col {...colProps}>
                        <Form.Item {...commonProps}
                            valuePropName="checked"
                        >
                            <Checkbox>{field.title}</Checkbox>
                        </Form.Item>
                    </Col>
                );
            case 'checkbox_group':
                return (
                    <Col {...colProps}>
                        <Form.Item {...commonProps} >
                            <Checkbox.Group
                                onChange={(e) => { handleRadioChange(index, fieldName, field?.option, !e?.includes(field?.option)) }}>
                                <Row>
                                    {enums && enums.length > 0 && enums.find(item => item.name === field.enum)?.options?.map(option => (
                                        <Col span={field.style === 'vertical' && 24} className={field.style === 'vertical' && 'mb-2'}>
                                            <Checkbox key={option} value={option}>
                                                {option}
                                            </Checkbox>
                                        </Col>
                                    ))}
                                </Row>
                            </Checkbox.Group>
                        </Form.Item>
                        {field.option && radioValues[`${index}-${fieldName}`] === field.option && (
                            <Col {...colProps}>
                                <Form.Item
                                    key={`${index}-${fieldName}-custom`}
                                    name={[index, `${fieldName}_custom`]}
                                    rules={[{ required: isRequired, message: `Please input ${field.title}!` }]}
                                >
                                    <Input placeholder={`${field.option} Specify`} />
                                </Form.Item>
                            </Col>
                        )}
                    </Col>
                );
            case 'link':
                return renderFormItem(<Input addonBefore="http://" placeholder={`Enter ${field.title} Link`} />);
            case 'textarea':
                return renderFormItem(<TextArea placeholder={`${field.title}`} allowClear rows={4} />);
            default:
                return renderFormItem(<Input placeholder={`Enter ${field.title}`} />);
        }
    };

    return (
        <>
            {fields && <Form
                form={form}
                name="dynamic_form"
                layout="vertical"
                onFinish={onNext}
                initialValues={initialValues}
            >
                {fields.map((fieldSet, index) => (
                    <div key={fieldSet.key}>
                        {index !== 0 &&
                            <Row justify="end" gutter={16}>
                                <Col span={20}>
                                    <h3>
                                        {fieldSet?.schema?.title} - {index + 1}
                                    </h3>
                                </Col>
                                <Col span={4}>
                                    <Button danger onClick={() => deleteFields(fieldSet.key)}>
                                        Delete
                                    </Button>
                                </Col>
                            </Row>}
                        <Row gutter={16}>
                            {fieldSet?.schema?.properties && Object.keys(fieldSet?.schema?.properties).map((key) => RenderField(fieldSet?.schema?.properties[key], key, index))}
                        </Row>
                        {index < fields.length - 1 && <Divider />}
                        {initialValues &&
                            <Form.Item key={`id`} name={[index, 'id']}>
                                {/* <Button type="primary" htmlType="submit" block/> */}
                            </Form.Item>
                        }
                    </div>
                ))}
                {schema && schema?.is_repeatable && (
                    <Form.Item>
                        <Button type="primary" onClick={addFields}>
                            + Add another {schema?.title}
                        </Button>
                    </Form.Item>
                )}
                <Divider />
                <Row gutter={12}>
                    {initialValues && <Col xs={6} sm={3}>
                        {initialValues &&
                            <Button onClick={prev} block disabled={firstStep}>
                                {'< Prev'}
                            </Button>
                        }
                    </Col>}
                    <Col xs={initialValues ? 18 : 24} sm={initialValues ? 13 : 16}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                {lastStep ? 'Complete Survey' : 'Save & Continue'}
                            </Button>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}
                    // className='p-2'
                    >
                        <Button onClick={() => setMessageAbort(true)} block>
                            {/* <a onClick={() => setMessageAbort(true)} > */}
                            Save Draft & Continue Later
                            {/* </a> */}
                        </Button>
                    </Col>
                </Row>
            </Form>}
        </>
    );
};

export default DynamicForm;
