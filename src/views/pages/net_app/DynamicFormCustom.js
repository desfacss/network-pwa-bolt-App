import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker, Radio, Checkbox, InputNumber, Col, Row, Divider } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
// import ProFom from './ProFom.tsx';
const { TextArea } = Input;
const { Option } = Select;

const DynamicFormCustom = ({ initialValues }) => {
    const [form] = Form.useForm();
    const [fields, setFields] = useState([]);
    const [radioValues, setRadioValues] = useState({});
    const [enums, setEnums] = useState()
    const [schema, setSchema] = useState()

    console.log("schema", schema)
    useEffect(() => {
        const getEnums = async () => {
            let { data, error } = await supabase.from('enum').select('*')
            if (data) {
                setEnums(data)
            }
        }
        const getForms = async (i) => {
            const { data, error } = await supabase.from('forms').select('*').eq('name', 'bus_reg_nested').single()
            if (data) {
                console.log("D", data)
                setSchema(data.data)
            }
        }
        getEnums()
        getForms()
    }, [])

    useEffect(() => {
        console.log("I", initialValues)
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

    // const addFields = () => {
    //     const orderSchema = reorderProperties(schema);
    //     setFields([...fields, { key: fields.length, schema: orderSchema }]);
    // };

    // const deleteFields = (key) => {
    //     setFields(fields.filter(field => field.key !== key));
    // };

    const handleAddField = (index, fieldName) => {
        const values = form.getFieldValue([index, fieldName]) || [];
        const newValues = [...values, {}]; // Add a new empty object for the repeatable section
        form.setFieldsValue({
            [index]: { [fieldName]: newValues },
        });
    };

    const handleRemoveField = (index, fieldName, fieldIndex) => {
        const values = form.getFieldValue([index, fieldName]) || [];
        const newValues = values.filter((_, idx) => idx !== fieldIndex); // Remove the selected section
        form.setFieldsValue({
            [index]: { [fieldName]: newValues },
        });
    };

    // const addFields = () => {
    //     setFields(prevFields => {
    //         const newFields = [...prevFields, { key: prevFields.length, schema: reorderProperties(schema) }];
    //         // Update the form with new values after adding a section
    //         const currentValues = form.getFieldsValue();
    //         form.setFieldsValue(currentValues); // Ensure the form is synchronized
    //         return newFields;
    //     });
    // };

    // const deleteFields = (key) => {
    //     setFields(prevFields => {
    //         const newFields = prevFields.filter(field => field.key !== key);
    //         // Update the form to remove the values associated with the deleted section
    //         const currentValues = form.getFieldsValue();
    //         delete currentValues[key];
    //         form.setFieldsValue(currentValues); // Sync the form state after deletion
    //         return newFields;
    //     });
    // };

    const addFields = () => {
        const newKey = fields.length; // New unique key based on the length of fields array
        setFields(prevFields => {
            const newFields = [...prevFields, { key: newKey, schema: reorderProperties(schema) }];
            return newFields;
        });

        // Force re-render and sync the form with the updated fields
        form.resetFields();
        const currentValues = form.getFieldsValue();
        currentValues[newKey] = {}; // Initialize the new field section
        form.setFieldsValue(currentValues);
    };

    const deleteFields = (key) => {
        setFields(prevFields => {
            const newFields = prevFields.filter(field => field.key !== key);
            return newFields;
        });

        // Sync the form after removing the section
        form.resetFields();
        const currentValues = form.getFieldsValue();
        delete currentValues[key]; // Remove values of deleted section
        form.setFieldsValue(currentValues);
    };

    const onNext = (values) => {
        console.log(values)
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
        // ***************************************************************************************************
        if (field.type === 'array' && field.is_repeatable) {
            const fieldValues = form.getFieldValue([index, fieldName]) || [{}]; // Get the array of repeatable fields

            return (
                <>
                    <Form.Item label={field.title} {...commonProps} key={fieldName}>
                        {fieldValues.map((_, fieldIndex) => (
                            <Row key={`${index}-${fieldName}-${fieldIndex}`} gutter={16}>
                                {/* Render each field inside the repeatable section */}
                                {Object.keys(field.items.properties).map((subField) => (
                                    RenderField(field.items.properties[subField], `${fieldName}.${subField}`, fieldIndex)
                                ))}
                                <Col span={4}>
                                    <Button danger onClick={() => handleRemoveField(index, fieldName, fieldIndex)}>
                                        Remove
                                    </Button>
                                </Col>
                            </Row>
                        ))}
                    </Form.Item>
                    <Button type="primary" onClick={() => handleAddField(index, fieldName)}>
                        + Add another {field.title}
                    </Button>
                </>
            );
        }
        // ***************************************************************************************************
        const colProps = { xs: 24, sm: field.size ? field.size * 12 : 12 };

        const renderFormItem = (component) => (
            <Col {...colProps}>
                <Form.Item {...commonProps}>{component}</Form.Item>
            </Col>
        );

        switch (field.format) {
            case 'password':
                return renderFormItem(<Input.Password placeholder={`Enter ${field.title}`} disabled={field.not_editable} />);
            case 'radio':
                return (
                    <>
                        {renderFormItem(
                            <Radio.Group disabled={field.not_editable}
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
                            <Select disabled={field.not_editable} placeholder={`Select a ${field.title}`} showSearch onChange={(e) => handleRadioChange(index, fieldName, e)} >
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
                return renderFormItem(<InputNumber placeholder={`Enter ${field.title}`} disabled={field.not_editable} />);
            case 'date':
                return renderFormItem(<DatePicker style={{ width: '100%' }} placeholder={`Select a ${field.title}`} disabled={field.not_editable} />);
            case 'checkbox':
                return (
                    <Col {...colProps}>
                        <Form.Item {...commonProps}
                            valuePropName="checked"
                        >
                            <Checkbox disabled={field.not_editable}>{field.title}</Checkbox>
                        </Form.Item>
                    </Col>
                );
            case 'checkbox_group':
                return (
                    <Col {...colProps}>
                        <Form.Item {...commonProps} >
                            <Checkbox.Group disabled={field.not_editable}
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
                return renderFormItem(<Input addonBefore="http://" placeholder={`Enter ${field.title} Link`} disabled={field.not_editable} />);
            case 'textarea':
                return renderFormItem(<TextArea placeholder={`${field.title}`} allowClear rows={4} disabled={field.not_editable} />);
            default:
                return renderFormItem(<Input placeholder={`Enter ${field.title}`} disabled={field.not_editable} />);
        }
    };

    return (
        <>
            {/* <ProFom /> */}
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
                                <Button type="primary" htmlType="submit" block />
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
            </Form>}
        </>
    );
};

export default DynamicFormCustom;
