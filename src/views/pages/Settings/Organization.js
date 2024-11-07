import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Upload, Select, message, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { supabase } from 'configs/SupabaseConfig';

const { Option } = Select;

const OrganizationSetup = () => {
    const { session } = useSelector((state) => state.auth);
    const organization_id = session?.user?.organization_id;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [organizationData, setOrganizationData] = useState(null);

    useEffect(() => {
        const fetchOrganizationData = async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', organization_id)
                .single();

            if (error) {
                message.error('Error fetching organization data');
            } else {
                setOrganizationData(data);
                form.setFieldsValue({
                    organizationName: data.name,
                    organizationLogo: data.details?.organizationLogo || null,
                    street: data.details?.organizationAddress?.street,
                    city: data.details?.organizationAddress?.city,
                    state: data.details?.organizationAddress?.state,
                    country: data.details?.organizationAddress?.country,
                    postalCode: data.details?.organizationAddress?.postalCode,
                    contactName: data.details?.primaryContact?.contactName,
                    email: data.details?.primaryContact?.email,
                    phone: data.details?.primaryContact?.phone,
                    customDomain: data.details?.domainSettings?.customDomain,
                    loginURL: data.details?.domainSettings?.loginURL,
                    logoutRedirectURL: data.details?.domainSettings?.logoutRedirectURL,
                    baseCurrency: data.details?.regionalSettings?.baseCurrency,
                    supportedCurrencies: data.details?.regionalSettings?.supportedCurrencies,
                    baseTimezone: data.details?.regionalSettings?.baseTimezone,
                    allowedTimezones: data.details?.regionalSettings?.allowedTimezones,
                    dateFormat: data.details?.regionalSettings?.dateFormat,
                    timeFormat: data.details?.regionalSettings?.timeFormat,
                    workWeekStartDay: data.details?.regionalSettings?.workWeekStartDay,
                });
            }
        };

        if (organization_id) {
            fetchOrganizationData();
        }
    }, [organization_id, form]);

    const onFinish = async (values) => {
        setLoading(true);

        const organizationDetails = {
            organizationName: values.organizationName,
            organizationLogo: values.organizationLogo ? values.organizationLogo[0].response.url : null,
            organizationAddress: {
                street: values.street,
                city: values.city,
                state: values.state,
                country: values.country,
                postalCode: values.postalCode,
            },
            primaryContact: {
                contactName: values.contactName,
                email: values.email,
                phone: values.phone,
            },
            domainSettings: {
                customDomain: values.customDomain,
                loginURL: values.loginURL, // Not editable
                logoutRedirectURL: values.logoutRedirectURL, // Not editable
            },
            regionalSettings: {
                baseCurrency: values.baseCurrency,
                supportedCurrencies: values.supportedCurrencies,
                baseTimezone: values.baseTimezone,
                allowedTimezones: values.allowedTimezones,
                dateFormat: values.dateFormat,
                timeFormat: values.timeFormat, // Not editable
                workWeekStartDay: values.workWeekStartDay,
            },
        };

        const { data, error } = await supabase
            .from('organizations')
            .update({
                name: values.organizationName,
                details: organizationDetails,
                updated_at: new Date(),
            })
            .eq('id', organization_id);

        setLoading(false);

        if (error) {
            message.error('Error updating organization');
        } else {
            message.success('Organization updated successfully');
        }
    };

    return (
        <Form layout="vertical" form={form} onFinish={onFinish}>
            {/* Organization Details */}
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="Organization Name" name="organizationName" rules={[{ required: true, message: 'Please input the organization name' }]}>
                        <Input disabled />
                    </Form.Item>
                </Col>

                <Col span={8}>
                    <Form.Item label="Organization Logo" name="organizationLogo" valuePropName="fileList" getValueFromEvent={(e) => e.fileList}>
                        <Upload disabled name="logo" action="/upload.do" listType="picture" maxCount={1}>
                            <Button icon={<UploadOutlined />}>Upload Logo</Button>
                        </Upload>
                    </Form.Item>
                </Col>
            </Row>

            {/* Address Section */}
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="Street" name="street" rules={[{ required: true, message: 'Street is required' }]}>
                        <Input placeholder="Street" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="City" name="city" rules={[{ required: true, message: 'City is required' }]}>
                        <Input placeholder="City" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="State" name="state" rules={[{ required: true, message: 'State is required' }]}>
                        <Input placeholder="State" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="Country" name="country" rules={[{ required: true, message: 'Country is required' }]}>
                        <Input placeholder="Country" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Postal Code" name="postalCode" rules={[{ required: true, message: 'Postal Code is required' }]}>
                        <Input placeholder="Postal Code" />
                    </Form.Item>
                </Col>
            </Row>

            {/* Primary Contact Information */}
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="Contact Name" name="contactName" rules={[{ required: true, message: 'Contact Name is required' }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Email Address" name="email" rules={[{ required: true, type: 'email', message: 'Please input a valid email address' }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Phone Number" name="phone" rules={[{ required: true, message: 'Phone Number is required' }]}>
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

            {/* Domain & URL Settings */}
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="Custom Domain" name="customDomain">
                        <Input disabled placeholder="e.g., orgname.appdomain.com or customdomain.com" />
                    </Form.Item>
                </Col>
            </Row>

            {/* Regional Settings */}
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="Base Currency" name="baseCurrency" rules={[{ required: true, message: 'Please select the base currency' }]}>
                        <Select disabled placeholder="Select currency">
                            <Option value="GBP">GBP</Option>
                            {/* Add more options as needed */}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Base Timezone" name="baseTimezone" rules={[{ required: true, message: 'Please select the base timezone' }]}>
                        <Select disabled placeholder="Select timezone">
                            <Option value="UK">UK</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Date Format" name="dateFormat">
                        <Select disabled>
                            <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="Time Format" name="timeFormat">
                        <Select disabled>
                            <Option value="24">24-hour</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Work Week Start Day" name="workWeekStartDay">
                        <Select disabled>
                            <Option value="Monday">Monday</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Save
                </Button>
            </Form.Item>
        </Form>
    );
};

export default OrganizationSetup;
