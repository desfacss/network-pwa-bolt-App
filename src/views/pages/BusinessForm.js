import React from 'react';
import { CloseOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Input, InputNumber, message, Select, Space, Typography, Upload } from 'antd';

const BusinessForm = () => {
    const [form] = Form.useForm();

    const props = {
        name: 'file',
        action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    return (
        <Form labelCol={{ span: 6, }} wrapperCol={{ span: 18, }} form={form} name="dynamic_form_complex"
            style={{ maxWidth: 600, }} autoComplete="off" initialValues={{ items: [{}], }} >
            <Form.List name="businesses">
                {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column', }} >
                        {fields.map((field) => (
                            <Card
                                size="small"
                                title={`Business ${field.name + 1}`}
                                key={field.key}
                                extra={<CloseOutlined onClick={() => { remove(field.name); }} />}
                            >
                                <Form.Item label="Name" name={[field.name, 'name']}>
                                    <Input />
                                </Form.Item>

                                <Form.Item label="Your Position/Title" name={[field.name, 'position']}>
                                    <Input />
                                </Form.Item>

                                <Form.Item label="Year of Establishment" name={[field.name, 'year']}>
                                    <InputNumber />
                                </Form.Item>

                                <Form.Item label="Industry/Sector" name={[field.name, 'sector']}>
                                    <Select />
                                </Form.Item>

                                <Form.Item label="Registered business?" name={[field.name, 'registered']}>
                                    <Checkbox />
                                </Form.Item>

                                <Form.Item label="Legal Structure" name={[field.name, 'structure']}>
                                    <Select />
                                </Form.Item>

                                <Form.Item label="Nagarathar Involvement" name={[field.name, 'nagarathar_involvement']}>
                                    <Select />
                                </Form.Item>

                                <Form.Item label="Number of Employees" name={[field.name, 'employees']}>
                                    <Select />
                                </Form.Item>

                                <Form.Item label="Annual Turnover Range" name={[field.name, 'turnover_range']}>
                                    <Select />
                                </Form.Item>

                                <Form.Item label="Brief Description" name={[field.name, 'description']}>
                                    <Input.TextArea rows={4} />
                                </Form.Item>

                                <Form.Item label="Email" name={[field.name, 'email']}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Phone" name={[field.name, 'phone']}>
                                    <InputNumber />
                                </Form.Item>
                                <Form.Item label="Location" name={[field.name, 'location']}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Address" name={[field.name, 'address']}>
                                    <Input.TextArea />
                                </Form.Item>
                                <Form.Item label="Website" name={[field.name, 'website']}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Social Media Links" name={[field.name, 'links']}>
                                    <Input.TextArea rows={4} />
                                </Form.Item>


                                {/* Nest Form.List */}
                                <Form.Item label="Product/Services">
                                    <Form.List name={[field.name, 'products']}>
                                        {(subFields, subOpt) => (
                                            <div
                                                style={{ display: 'flex', flexDirection: 'column', rowGap: 16, }}
                                            >
                                                {subFields.map((subField) => (
                                                    <Space direction='vertical' key={subField.key}>

                                                        <Form.Item noStyle name={[subField.name, 'first']}>
                                                            <Space key={subField.key}>
                                                                <Input placeholder="title" />
                                                                <CloseOutlined
                                                                    onClick={() => {
                                                                        subOpt.remove(subField.name);
                                                                    }}
                                                                />
                                                            </Space>
                                                        </Form.Item>

                                                        <Form.Item noStyle name={[subField.name, 'second']}>
                                                            <Input.TextArea placeholder="Description" />
                                                        </Form.Item>

                                                        <Form.Item noStyle name={[subField.name, 'second']}>
                                                            <Upload {...props}>
                                                                <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                                            </Upload>
                                                        </Form.Item>

                                                        <Form.Item noStyle name={[subField.name, 'second']}>
                                                            <Input placeholder="Tags" />
                                                        </Form.Item>

                                                        <Form.Item name={[field.name, 'category']}>
                                                            <Select placeholder="Category" />
                                                        </Form.Item>

                                                        <Form.Item name={[field.name, 'sub_category']}>
                                                            <Select placeholder="Sub Category" />
                                                        </Form.Item>
                                                    </Space>
                                                ))}
                                                <Button type="dashed" onClick={() => subOpt.add()} block>
                                                    + Add Product/Service
                                                </Button>
                                            </div>
                                        )}
                                    </Form.List>
                                </Form.Item>
                            </Card>
                        ))}

                        <Button type="dashed" onClick={() => add()} block>
                            + Add Business
                        </Button>
                    </div>
                )}
            </Form.List>

            <Form.Item noStyle shouldUpdate>
                {() => (
                    <Typography>
                        <pre>{JSON.stringify(form, null, 2)}</pre>
                        {/* <pre>{JSON.stringify(form.getFieldsValue(), null)}</pre> */}
                    </Typography>
                )}
            </Form.Item>
        </Form>
    );
};
export default BusinessForm;